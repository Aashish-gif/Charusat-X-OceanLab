import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-flash-latest'];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  for (const m of models) {
    try {
      const response = await ai.models.generateContent({
        model: m,
        contents: "hello",
      });
      console.log(`Success with ${m}:`, response.text);
      return;
    } catch (err) {
      console.error(`Failed with ${m}:`, err.message);
    }
  }
}

testGemini();
