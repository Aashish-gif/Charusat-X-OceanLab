import { Node } from 'reactflow';
import { generateTerraformWithRag } from './ragTerraformGenerator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://charusat-x-oceanlab.onrender.com/api';

type GuardrailApiError = {
  type: 'OUT_OF_DOMAIN';
  message: string;
  text?: string;
};

type SttUnavailableError = {
  type: 'STT_UNAVAILABLE';
  message: string;
};

interface TextToCloudResult {
  nodes: Node[];
  edges: any[];
  terraformCode: string;
  success: boolean;
  message?: string;
}

const buildDomainError = (data: any): GuardrailApiError => ({
  type: 'OUT_OF_DOMAIN',
  message: data?.message || 'Zenith AI strictly supports AWS/Cloud services.',
  text: data?.text,
});

export const validateCloudPrompt = async (text: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/voice/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 403 && data.error === 'ERROR_OUT_OF_DOMAIN') {
      throw new Error(JSON.stringify(buildDomainError(data)));
    }
    throw new Error(data.message || 'Failed to validate domain input.');
  }

  return data.text || text;
};

// Mock implementation for demonstration purposes
// In a real implementation, this would call an actual AI API
export const convertTextToCloud = async (text: string): Promise<TextToCloudResult> => {
  try {
    const validatedText = await validateCloudPrompt(text);

    let nodes: Node[] = [];
    let edges: any[] = [];
    
    // First, try to use the backend AI generation endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/v1/voice/generate-cloud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: validatedText })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.nodes) {
         nodes = data.nodes;
         edges = data.edges || [];
      } else if (response.status === 503) {
         console.warn("No OpenAI API key in backend. Using basic regex fallback.");
      } else {
         throw new Error(data.message || 'Error from generation API');
      }
    } catch (apiError) {
      console.error("AI Generation API failed, falling back to basic regex mapper", apiError);
    }

    // Only run the basic fallback if nodes are still empty (e.g. API limit reached or missing key)
    if (nodes.length === 0) {
      const textLower = validatedText.toLowerCase();
      const positions = [
        { x: 100, y: 150 }, { x: 300, y: 150 }, { x: 500, y: 150 }, { x: 200, y: 350 }
      ];
      let positionIndex = 0;
      
      if (textLower.includes('vpc') || textLower.includes('network')) {
        const vpcId = `vpc_${Date.now()}`;
        nodes.push({
          id: vpcId,
          type: 'vpcGroup',
          position: { x: 50, y: 50 },
          data: {
            label: 'Production VPC', resourceType: 'Virtual Private Cloud', icon: 'Network',
            terraformType: 'aws_vpc', category: 'network', type: 'vpc',
            config: { cidr_block: '10.0.0.0/16', enable_dns_hostnames: true }
          },
        });
      }
      if (textLower.includes('lambda') || textLower.includes('serverless')) {
        nodes.push({
          id: `lambda_${Date.now()}`, type: 'cloudComponent', position: positions[positionIndex++ % positions.length],
          data: {
            label: 'API Function', resourceType: 'Serverless Function', icon: 'Zap',
            terraformType: 'aws_lambda_function', category: 'compute', type: 'lambda',
            config: { runtime: 'python3.13', handler: 'index.handler' }
          },
        });
      }
      if (textLower.includes('database') || textLower.includes('rds')) {
        nodes.push({
          id: `db_${Date.now()}`, type: 'cloudComponent', position: positions[positionIndex++ % positions.length],
          data: {
            label: 'Primary Database', resourceType: 'Relational Database', icon: 'Database',
            terraformType: 'aws_db_instance', category: 'database', type: 'rds',
            config: { engine: 'postgres', instance_class: 'db.t3.micro' }
          },
        });
      }
      if (textLower.includes('s3') || textLower.includes('bucket') || textLower.includes('storage')) {
        nodes.push({
          id: `s3_${Date.now()}`, type: 'cloudComponent', position: positions[positionIndex++ % positions.length],
          data: {
            label: 'App Assets', resourceType: 'Object Storage', icon: 'Folder',
            terraformType: 'aws_s3_bucket', category: 'storage', type: 's3',
            config: { bucket: 'zenith-ai-assets-' + Date.now() }
          },
        });
      }
      if (textLower.includes('ec2') || textLower.includes('instance') || textLower.includes('server') || nodes.length === 0) {
        nodes.push({
          id: `ec2_${Date.now()}`, type: 'cloudComponent', position: positions[positionIndex++ % positions.length],
          data: {
            label: 'Default Instance', resourceType: 'Virtual Server', icon: 'Server',
            terraformType: 'aws_instance', category: 'compute', type: 'ec2',
            config: { instance_type: 't3.micro' }
          },
        });
      }
    }

    // Generate Terraform code from the nodes using RAG
    const terraformCode = await generateTerraformWithRag(nodes, edges);

    return {
      nodes,
      edges,
      terraformCode,
      success: true,
      message: `Generated ${nodes.length} infrastructure components from your description`
    };
  } catch (error) {
    console.error('Error in text-to-cloud conversion:', error);

    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError?.type === 'OUT_OF_DOMAIN') {
          throw error;
        }
      } catch {
        // Ignore parsing errors and continue with generic fallback.
      }
    }

    return {
      nodes: [],
      edges: [],
      terraformCode: '',
      success: false,
      message: 'Failed to convert text to cloud infrastructure. Please try again.'
    };
  }
};

// Real implementation would call an AI API
export const convertTextToCloudWithAI = async (text: string, apiKey?: string): Promise<TextToCloudResult> => {
  // This is where you would integrate with an actual AI service like OpenAI
  // For now, using the mock implementation
  return convertTextToCloud(text);
};

export const transcribeAudio = async (audioBlob: Blob): Promise<{ success: boolean; text?: string; message?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(`${API_BASE_URL}/v1/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403 && data.error === 'ERROR_OUT_OF_DOMAIN') {
        throw new Error(JSON.stringify(buildDomainError(data)));
      }
      if (response.status === 503 && data.error === 'STT_NOT_CONFIGURED') {
        const payload: SttUnavailableError = {
          type: 'STT_UNAVAILABLE',
          message: data.message || 'Speech-to-text provider is not configured.',
        };
        throw new Error(JSON.stringify(payload));
      }
      throw new Error(data.message || 'Error transcribing audio');
    }

    return { success: true, text: data.text };
  } catch (error: any) {
    console.error('Error during transcription:', error);
    try {
      const parsedError = JSON.parse(error.message);
      if (parsedError.type === 'OUT_OF_DOMAIN') {
        throw error;
      }
    } catch (e) {
      // not JSON parseable, throw original
    }
    throw error;
  }
};