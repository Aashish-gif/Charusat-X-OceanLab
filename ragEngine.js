import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

let vectorStore = null;
let isInitialized = false;
let initializePromise = null;

function getProjectRoot() {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	// Keep RAG assets self-contained under Backend/
	return __dirname;
}

async function loadKnowledgeBaseDocuments() {
	const kbPath = path.join(getProjectRoot(), 'knowledge-base');

	async function walk(dir) {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		const files = await Promise.all(entries.map(async entry => {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return walk(fullPath);
			}
			return fullPath.endsWith('.txt') ? [fullPath] : [];
		}));
		return files.flat();
	}

	const filePaths = await walk(kbPath);
	const docs = await Promise.all(filePaths.map(async filePath => {
		const content = await fs.readFile(filePath, 'utf8');
		return { pageContent: content, metadata: { source: filePath } };
	}));
	return docs;
}

async function buildVectorStoreFromDocs(docs) {
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200
	});
	const splitDocs = await splitter.splitDocuments(docs);

	const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
	if (!apiKey) {
		throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.');
	}

	const embeddings = new GoogleGenerativeAIEmbeddings({
		apiKey,
		model: 'text-embedding-004'
	});

	// Minimal in-memory vector store with cosine similarity
	class SimpleMemoryVectorStore {
		constructor(items, vectors) {
			this.items = items;
			this.vectors = vectors;
		}
		static async fromDocuments(documents, embeddingModel) {
			const texts = documents.map(d => d.pageContent || '');
			const vectors = await embeddingModel.embedDocuments(texts);
			return new SimpleMemoryVectorStore(documents, vectors);
		}
		static cosineSim(a, b) {
			let dot = 0, na = 0, nb = 0;
			for (let i = 0; i < a.length; i++) {
				const x = a[i], y = b[i];
				dot += x * y;
				na += x * x;
				nb += y * y;
			}
			if (na === 0 || nb === 0) return 0;
			return dot / (Math.sqrt(na) * Math.sqrt(nb));
		}
		async similaritySearchWithScore(query, k = 3) {
			const q = await embeddings.embedQuery(query);
			const scored = this.vectors.map((vec, i) => {
				const sim = SimpleMemoryVectorStore.cosineSim(q, vec);
				// Convert similarity to pseudo-distance for compatibility (lower is better)
				const distance = 1 - sim;
				return [this.items[i], distance];
			});
			scored.sort((a, b) => a[1] - b[1]);
			return scored.slice(0, k);
		}
		async similaritySearch(query, k = 3) {
			const withScore = await this.similaritySearchWithScore(query, k);
			return withScore.map(([doc]) => doc);
		}
	}

	return SimpleMemoryVectorStore.fromDocuments(splitDocs, embeddings);
}

export async function initRAG() {
	if (isInitialized) return;
	if (initializePromise) {
		await initializePromise;
		return;
	}

	initializePromise = (async () => {
		const docs = await loadKnowledgeBaseDocuments();
		vectorStore = await buildVectorStoreFromDocs(docs);
		isInitialized = true;
	})();

	await initializePromise;
}

export async function getVerifiedContext(query) {
	if (!isInitialized) {
		await initRAG();
	}
	if (!vectorStore) return null;

	const hasWithScore = typeof vectorStore.similaritySearchWithScore === 'function';
	const k = 3;

	if (hasWithScore) {
		const results = await vectorStore.similaritySearchWithScore(query, k);
		if (!results || results.length === 0) return null;

		const DISTANCE_THRESHOLD = 0.35;
		const filtered = results.filter(([, score]) => typeof score === 'number' && score <= DISTANCE_THRESHOLD);
		if (filtered.length === 0) return null;

		const combined = filtered
			.map(([doc]) => doc.pageContent)
			.filter(Boolean)
			.join('\n\n');

		return combined.length > 0 ? combined : null;
	} else {
		const results = await vectorStore.similaritySearch(query, k);
		if (!results || results.length === 0) return null;
		const combined = results.map(d => d.pageContent).filter(Boolean).join('\n\n');
		return combined.length > 0 ? combined : null;
	}
}

