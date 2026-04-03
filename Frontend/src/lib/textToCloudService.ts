import { Node } from 'reactflow';
import { generateTerraformWithRag } from './ragTerraformGenerator';

interface TextToCloudResult {
  nodes: Node[];
  edges: any[];
  terraformCode: string;
  success: boolean;
  message?: string;
}

// Mock implementation for demonstration purposes
// In a real implementation, this would call an actual AI API
export const convertTextToCloud = async (text: string): Promise<TextToCloudResult> => {
  try {
    // This is a simplified mock implementation
    // In a real scenario, you would call an AI API like OpenAI

    // Parse the text to identify infrastructure components
    const textLower = text.toLowerCase();
    const nodes: Node[] = [];

    // Define positions for nodes
    const positions = [
      { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
    ];

    let positionIndex = 0;

    // Identify components and build relationships
    if (textLower.includes('vpc') || textLower.includes('network') || textLower.includes('infrastructure')) {
      const vpcId = `vpc_${Date.now()}`;
      nodes.push({
        id: vpcId,
        type: 'vpcGroup',
        position: { x: 50, y: 50 },
        data: {
          label: 'Production VPC',
          resourceType: 'Virtual Private Cloud',
          icon: 'Network',
          terraformType: 'aws_vpc',
          category: 'network',
          type: 'vpc',
          config: { cidr_block: '10.0.0.0/16', enable_dns_hostnames: true }
        },
      });

      if (textLower.includes('public') || textLower.includes('web')) {
        const subnetId = `subnet_${Date.now()}`;
        nodes.push({
          id: subnetId,
          type: 'cloudComponent',
          parentNode: vpcId,
          extent: 'parent',
          position: { x: 50, y: 100 },
          data: {
            label: 'Public Subnet',
            resourceType: 'VPC Subnet',
            icon: 'Layers',
            terraformType: 'aws_subnet',
            category: 'network',
            type: 'subnet',
            config: { cidr_block: '10.0.1.0/24', availability_zone: 'us-east-1a' }
          },
        });
      }
    }

    if (textLower.includes('serverless') || textLower.includes('lambda') || textLower.includes('api')) {
      nodes.push({
        id: `lambda_${Date.now()}`,
        type: 'cloudComponent',
        position: positions[positionIndex++ % positions.length],
        data: {
          label: 'API Function',
          resourceType: 'Serverless Function',
          icon: 'Zap',
          terraformType: 'aws_lambda_function',
          category: 'compute',
          type: 'lambda',
          config: { runtime: 'python3.13', handler: 'index.handler', timeout: 30 }
        },
      });
    }

    if (textLower.includes('database') || textLower.includes('rds') || textLower.includes('sql')) {
      nodes.push({
        id: `db_${Date.now()}`,
        type: 'cloudComponent',
        position: positions[positionIndex++ % positions.length],
        data: {
          label: 'Primary Database',
          resourceType: 'Relational Database',
          icon: 'Database',
          terraformType: 'aws_db_instance',
          category: 'database',
          type: 'rds',
          config: { engine: 'postgres', instance_class: 'db.t3.micro', allocated_storage: 20 }
        },
      });
    }

    if (textLower.includes('storage') || textLower.includes('s3') || textLower.includes('bucket')) {
      nodes.push({
        id: `s3_${Date.now()}`,
        type: 'cloudComponent',
        position: positions[positionIndex++ % positions.length],
        data: {
          label: 'App Assets',
          resourceType: 'Object Storage',
          icon: 'Folder',
          terraformType: 'aws_s3_bucket',
          category: 'storage',
          type: 's3',
          config: { bucket: 'zenith-ai-assets-' + Date.now(), versioning: { enabled: true } }
        },
      });
    }

    // Default if nothing matched
    if (nodes.length === 0) {
      nodes.push({
        id: `ec2_${Date.now()}`,
        type: 'cloudComponent',
        position: { x: 250, y: 200 },
        data: {
          label: 'Default Instance',
          resourceType: 'Virtual Server',
          icon: 'Server',
          terraformType: 'aws_instance',
          category: 'compute',
          type: 'ec2',
          config: { instance_type: 't3.micro' }
        },
      });
    }

    // Generate Terraform code from the nodes using RAG
    const terraformCode = await generateTerraformWithRag(nodes, []); // No edges for text-to-cloud conversion

    return {
      nodes,
      edges: [],
      terraformCode,
      success: true,
      message: `Generated ${nodes.length} infrastructure components from your description`
    };
  } catch (error) {
    console.error('Error in text-to-cloud conversion:', error);
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