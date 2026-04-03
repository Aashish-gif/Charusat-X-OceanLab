import { AWSResource } from '@/store/useStore';

export const awsResources: AWSResource[] = [
  // Network
  {
    id: 'vpc',
    name: 'VPC',
    type: 'Virtual Private Cloud',
    category: 'network',
    icon: 'Network',
    terraformType: 'aws_vpc',
  },
  {
    id: 'subnet',
    name: 'Subnet',
    type: 'VPC Subnet',
    category: 'network',
    icon: 'Layers',
    terraformType: 'aws_subnet',
  },
  {
    id: 'igw',
    name: 'Internet Gateway',
    type: 'Internet Gateway',
    category: 'network',
    icon: 'Globe',
    terraformType: 'aws_internet_gateway',
  },
  {
    id: 'nat',
    name: 'NAT Gateway',
    type: 'NAT Gateway',
    category: 'network',
    icon: 'ArrowLeftRight',
    terraformType: 'aws_nat_gateway',
  },
  {
    id: 'elb',
    name: 'Load Balancer',
    type: 'Elastic Load Balancer',
    category: 'network',
    icon: 'Scale',
    terraformType: 'aws_lb',
  },
  
  // Compute
  {
    id: 'ec2',
    name: 'EC2 Instance',
    type: 'Virtual Server',
    category: 'compute',
    icon: 'Server',
    terraformType: 'aws_instance',
  },
  {
    id: 'lambda',
    name: 'Lambda',
    type: 'Serverless Function',
    category: 'compute',
    icon: 'Zap',
    terraformType: 'aws_lambda_function',
  },
  {
    id: 'ecs',
    name: 'ECS Cluster',
    type: 'Container Service',
    category: 'compute',
    icon: 'Container',
    terraformType: 'aws_ecs_cluster',
  },
  {
    id: 'eks',
    name: 'EKS Cluster',
    type: 'Kubernetes Service',
    category: 'compute',
    icon: 'Boxes',
    terraformType: 'aws_eks_cluster',
  },
  
  // Storage
  {
    id: 's3',
    name: 'S3 Bucket',
    type: 'Object Storage',
    category: 'storage',
    icon: 'Folder',
    terraformType: 'aws_s3_bucket',
  },
  {
    id: 'ebs',
    name: 'EBS Volume',
    type: 'Block Storage',
    category: 'storage',
    icon: 'HardDrive',
    terraformType: 'aws_ebs_volume',
  },
  {
    id: 'efs',
    name: 'EFS',
    type: 'Elastic File System',
    category: 'storage',
    icon: 'Files',
    terraformType: 'aws_efs_file_system',
  },
  
  // Database
  {
    id: 'rds',
    name: 'RDS',
    type: 'Relational Database',
    category: 'database',
    icon: 'Database',
    terraformType: 'aws_db_instance',
  },
  {
    id: 'dynamodb',
    name: 'DynamoDB',
    type: 'NoSQL Database',
    category: 'database',
    icon: 'Table',
    terraformType: 'aws_dynamodb_table',
  },
  {
    id: 'elasticache',
    name: 'ElastiCache',
    type: 'In-Memory Cache',
    category: 'database',
    icon: 'Cpu',
    terraformType: 'aws_elasticache_cluster',
  },
  
  // Security
  {
    id: 'sg',
    name: 'Security Group',
    type: 'Firewall Rules',
    category: 'security',
    icon: 'Shield',
    terraformType: 'aws_security_group',
  },
  {
    id: 'iam',
    name: 'IAM Role',
    type: 'Identity & Access',
    category: 'security',
    icon: 'Key',
    terraformType: 'aws_iam_role',
  },
  {
    id: 'kms',
    name: 'KMS Key',
    type: 'Encryption Key',
    category: 'security',
    icon: 'Lock',
    terraformType: 'aws_kms_key',
  },
  
  // Integration
  {
    id: 'apigateway',
    name: 'API Gateway',
    type: 'REST API',
    category: 'integration',
    icon: 'Workflow',
    terraformType: 'aws_api_gateway_rest_api',
  },
  {
    id: 'sqs',
    name: 'SQS Queue',
    type: 'Message Queue',
    category: 'integration',
    icon: 'MessageSquare',
    terraformType: 'aws_sqs_queue',
  },
  {
    id: 'sns',
    name: 'SNS Topic',
    type: 'Notification Service',
    category: 'integration',
    icon: 'Bell',
    terraformType: 'aws_sns_topic',
  },
  {
    id: 'eventbridge',
    name: 'EventBridge',
    type: 'Event Bus',
    category: 'integration',
    icon: 'Webhook',
    terraformType: 'aws_cloudwatch_event_bus',
  },
];

export const resourceCategories = [
  { id: 'network', name: 'Network', icon: 'Network' },
  { id: 'compute', name: 'Compute', icon: 'Server' },
  { id: 'storage', name: 'Storage', icon: 'HardDrive' },
  { id: 'database', name: 'Database', icon: 'Database' },
  { id: 'security', name: 'Security', icon: 'Shield' },
  { id: 'integration', name: 'Integration', icon: 'Workflow' },
] as const;
