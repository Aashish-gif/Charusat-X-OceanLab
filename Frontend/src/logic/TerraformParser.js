/**
 * Parses HCL (HashiCorp Configuration Language) Terraform code to React Flow nodes and edges
 * @param {string} hclCode - The Terraform HCL code to parse
 * @returns {Object} Object containing nodes and edges arrays
 */
export function parseHCLtoNodes(hclCode) {
  if (!hclCode) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];

  // Regular expression to match resource declarations
  const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s+\{([^}]+?)\}/gs;

  let match;
  let nodeIdCounter = 0;

  while ((match = resourceRegex.exec(hclCode)) !== null) {
    const resourceType = match[1]; // e.g., "aws_instance"
    const resourceName = match[2]; // e.g., "web_server"
    const resourceBody = match[3];

    // Map to Zenith Ai node types
    const meta = getResourceMetadata(resourceType);

    const node = {
      id: `${resourceType}.${resourceName}`,
      type: meta.type === 'vpc' ? 'vpcGroup' : 'cloudComponent',
      position: { x: (nodeIdCounter % 4) * 300 + 50, y: Math.floor(nodeIdCounter / 4) * 250 + 50 },
      data: {
        label: resourceName,
        resourceType: meta.label,
        icon: meta.icon,
        terraformType: resourceType,
        category: meta.category,
        type: meta.type,
        config: parseResourceAttributes(resourceBody)
      }
    };

    nodes.push(node);
    nodeIdCounter++;
  }

  // Create edges based on references
  createEdgesFromReferences(nodes, edges, hclCode);

  return { nodes, edges };
}

/**
 * Maps Terraform resource types to Zenith Ai node metadata
 */
function getResourceMetadata(resourceType) {
  const metadata = {
    'aws_instance': { type: 'ec2', icon: 'Server', label: 'Virtual Server', category: 'compute' },
    'aws_s3_bucket': { type: 's3', icon: 'Folder', label: 'Object Storage', category: 'storage' },
    'aws_db_instance': { type: 'rds', icon: 'Database', label: 'Relational Database', category: 'database' },
    'aws_lambda_function': { type: 'lambda', icon: 'Zap', label: 'Serverless Function', category: 'compute' },
    'aws_vpc': { type: 'vpc', icon: 'Network', label: 'Virtual Private Cloud', category: 'network' },
    'aws_subnet': { type: 'subnet', icon: 'Layers', label: 'VPC Subnet', category: 'network' },
    'aws_security_group': { type: 'sg', icon: 'Shield', label: 'Firewall Rules', category: 'security' },
    'aws_lb': { type: 'elb', icon: 'Scale', label: 'Elastic Load Balancer', category: 'network' }
  };

  return metadata[resourceType] || { type: 'generic', icon: 'Cloud', label: 'Cloud Resource', category: 'other' };
}

/**
 * Parses resource attributes
 */
function parseResourceAttributes(resourceBody) {
  const attributes = {};
  const attrRegex = /(\w+)\s*=\s*(("[^"]*")|([^ \n\r}]+))/g;

  let attrMatch;
  while ((attrMatch = attrRegex.exec(resourceBody)) !== null) {
    const key = attrMatch[1];
    let value = attrMatch[2];
    if (value.startsWith('"')) value = value.slice(1, -1);
    attributes[key] = value;
  }

  return attributes;
}

/**
 * Creates edges based on resource references
 */
function createEdgesFromReferences(nodes, edges, hclCode) {
  nodes.forEach(sourceNode => {
    nodes.forEach(targetNode => {
      if (sourceNode.id === targetNode.id) return;

      const targetRef = targetNode.id; // e.g., "aws_vpc.main"
      const sourceBodyRegex = new RegExp(`resource\\s+"${sourceNode.data.terraformType}"\\s+"${sourceNode.data.label}"\\s+\\{([^}]+)\\}`, 's');
      const bodyMatch = hclCode.match(sourceBodyRegex);

      if (bodyMatch && bodyMatch[1].includes(targetRef)) {
        const edgeId = `e-${sourceNode.id}-${targetNode.id}`;
        if (!edges.find(e => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: sourceNode.id,
            target: targetNode.id,
            animated: true,
            style: { stroke: '#3b82f6' }
          });
        }
      }
    });
  });
}
