import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import os from 'os';

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

const getOpenAI = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
});

const CLOUD_CONTEXT_PROMPT = 'Terraform, AWS, VPC, EC2, Lambda, S3, RDS, Subnet, Ingress, Egress, IAM, NAT gateway, route table, security group, load balancer, ECS, EKS, CloudFront, CloudWatch, infrastructure as code.';
const cloudKeywordsRegex = /\b(aws|terraform|vpc|ec2|s3|rds|lambda|subnet|ingress|egress|network|bucket|instance|database|serverless|server|cloud|iam|security group|route table|nat gateway|load balancer|eks|ecs|cloudfront|cloudwatch)\b/i;

const hasCloudKeywords = (text = '') => cloudKeywordsRegex.test(text);

const classifyDomainWithLLM = async (text) => {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return null;
  }

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_GUARDRAIL_MODEL || 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            "You are the Zenith AI Gatekeeper. Evaluate the user input. If it is related to AWS infrastructure, Cloud architecture, or Terraform setup, return the original text. If it is unrelated (e.g., food, sports, general chat), return exactly: 'ERROR_OUT_OF_DOMAIN'."
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    return completion.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Guardrail LLM classification failed, using regex fallback:', error?.message || error);
    return null;
  }
};

const runDomainGuardrail = async (text) => {
  const sanitizedText = (text || '').trim();

  if (!sanitizedText) {
    return {
      ok: false,
      text: '',
      reason: 'EMPTY_INPUT'
    };
  }

  const llmResult = await classifyDomainWithLLM(sanitizedText);
  if (llmResult) {
    if (llmResult === 'ERROR_OUT_OF_DOMAIN') {
      return {
        ok: false,
        text: sanitizedText,
        reason: 'LLM_OUT_OF_DOMAIN'
      };
    }

    return {
      ok: true,
      text: sanitizedText,
      reason: 'LLM_ALLOWED'
    };
  }

  if (hasCloudKeywords(sanitizedText)) {
    return {
      ok: true,
      text: sanitizedText,
      reason: 'REGEX_ALLOWED'
    };
  }

  return {
    ok: false,
    text: sanitizedText,
    reason: 'REGEX_OUT_OF_DOMAIN'
  };
};

const transcribeWithOpenAI = async (audioPath) => {
  // OpenAI requires a valid file extension. Multer drops the extension.
  const newPath = audioPath + '.webm';
  fs.renameSync(audioPath, newPath);

  try {
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: fs.createReadStream(newPath),
      model: 'whisper-1',
      prompt: CLOUD_CONTEXT_PROMPT,
    });
    return transcription?.text?.trim() || '';
  } finally {
    // We renamed the path, so update audioPath back to caller or clean it up here
    // Since the main route unlinks `audioPath`, we should re-rename it back so the finally block works,
    // OR we can just unlink the newPath right here.
    if (fs.existsSync(newPath)) {
      fs.renameSync(newPath, audioPath); // Restore original path for the route's cleanup
    }
  }
};

const transcribeWithDeepgram = async (audioPath) => {
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey) {
    return null;
  }

  const audioBuffer = await fs.promises.readFile(audioPath);
  const deepgramUrl = 'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&language=en';

  const response = await fetch(deepgramUrl, {
    method: 'POST',
    headers: {
      Authorization: `Token ${deepgramKey}`,
      'Content-Type': 'audio/webm',
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Deepgram transcription failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() || '';
};

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  let audioPath;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded.' });
    }

    audioPath = req.file.path;
    let transcribedText = '';
    let transcriptionSource = '';

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      try {
        transcribedText = await transcribeWithOpenAI(audioPath);
        transcriptionSource = 'openai-whisper';
      } catch (aiError) {
        console.error('OpenAI Whisper Error:', aiError);
        return res.status(502).json({
          success: false,
          message: 'Whisper transcription failed. Please try again.',
          error: 'STT_PROVIDER_ERROR',
        });
      }
    } else if (process.env.DEEPGRAM_API_KEY) {
      try {
        transcribedText = await transcribeWithDeepgram(audioPath);
        transcriptionSource = 'deepgram';
      } catch (dgError) {
        console.error('Deepgram transcription error:', dgError);
        return res.status(502).json({
          success: false,
          message: 'Deepgram transcription failed. Please try again.',
          error: 'STT_PROVIDER_ERROR',
        });
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'No speech-to-text provider configured. Add OPENAI_API_KEY or DEEPGRAM_API_KEY.',
        error: 'STT_NOT_CONFIGURED',
      });
    }

    if (!transcribedText) {
      return res.status(422).json({
        success: false,
        message: 'Could not detect speech from audio. Please speak clearly and try again.',
        error: 'EMPTY_TRANSCRIPTION',
      });
    }

    const guardrailResult = await runDomainGuardrail(transcribedText);
    if (!guardrailResult.ok) {
      return res.status(403).json({
        success: false,
        message: 'Zenith AI strictly supports AWS/Cloud services.',
        error: 'ERROR_OUT_OF_DOMAIN',
        text: guardrailResult.text,
        reason: guardrailResult.reason
      });
    }

    return res.status(200).json({
      success: true,
      text: guardrailResult.text,
      source: transcriptionSource,
      guardrail: guardrailResult.reason
    });

  } catch (error) {
    console.error('Transcription route error:', error);
    res.status(500).json({ success: false, message: 'Internal server error processing audio.' });
  } finally {
    if (audioPath) {
      fs.unlink(audioPath, (err) => {
        if (err) {
          console.error('Error deleting temp file:', err);
        }
      });
    }
  }
});

router.post('/validate', async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const guardrailResult = await runDomainGuardrail(text);

    if (!guardrailResult.ok) {
      return res.status(403).json({
        success: false,
        message: 'Zenith AI strictly supports AWS/Cloud services.',
        error: 'ERROR_OUT_OF_DOMAIN',
        text: guardrailResult.text,
        reason: guardrailResult.reason
      });
    }

    return res.status(200).json({
      success: true,
      text: guardrailResult.text,
      guardrail: guardrailResult.reason
    });
  } catch (error) {
    console.error('Validation route error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error validating text.' });
  }
});

router.post('/generate-cloud', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'No text provided' });
    }

    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return res.status(503).json({ 
        success: false, 
        error: 'LLM_NOT_CONFIGURED',
        message: 'OpenAI API key is missing. Cannot generate intelligent infrastructure layout.' 
      });
    }

    const systemPrompt = `You are Zenith AI Cloud Architect. Convert the user's infrastructure request into a JSON array of nodes and edges for ReactFlow.
Allowed node 'terraformType': 'aws_instance', 'aws_s3_bucket', 'aws_db_instance', 'aws_vpc', 'aws_lambda_function', 'aws_subnet'.
Allowed node 'icon': 'Server', 'Folder', 'Database', 'Network', 'Zap', 'Layers'.
Return ONLY valid JSON with no markdown formatting.
Schema:
{
  "nodes": [
    {
      "id": "unique_string",
      "type": "cloudComponent" or "vpcGroup",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Human readable name",
        "resourceType": "e.g. Object Storage, Virtual Server",
        "icon": "Folder",
        "terraformType": "aws_s3_bucket",
        "category": "storage|compute|database|network",
        "type": "s3|ec2|rds|vpc|lambda|subnet",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "source": "source_node_id",
      "target": "target_node_id",
      "type": "animated"
    }
  ]
}
Design a logical, spaced out positioning for the nodes (e.g. x: 50, 200, 400; y: 100, 250). Wrap subnets/instances in VPCs by setting 'parentNode' and 'extent': 'parent' if requested.`;

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_GUARDRAIL_MODEL || 'gpt-4o',
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]
    });

    const parsedResponse = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json({
      success: true,
      nodes: parsedResponse.nodes || [],
      edges: parsedResponse.edges || []
    });

  } catch (error) {
    console.error('Generate-cloud AI error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate cloud layout from text.' });
  }
});

export default router;
