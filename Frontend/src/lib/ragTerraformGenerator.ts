import { Node } from 'reactflow';

interface TerraformResource {
  id: string;
  type: string;
  attributes: Record<string, any>;
  dependencies?: string[];
}

interface RagKnowledgeBase {
  [key: string]: {
    terraformTemplate: string;
    examples: string[];
    bestPractices: string[];
    requiredFields: string[];
    optionalFields: string[];
  };
}

// Updated knowledge base with production-ready AWS resource configurations
const knowledgeBase: RagKnowledgeBase = {
  'aws_instance': {
    terraformTemplate: `# EC2 Instance
resource "aws_instance" "{{name}}" {
  ami                         = data.aws_ami.{{ami_type}}.id
  instance_type               = "{{instance_type}}"
  key_name                   = aws_key_pair.{{name}}_key.key_name
  vpc_security_group_ids     = [aws_security_group.{{name}}_sg.id]
  subnet_id                  = aws_subnet.{{name}}_subnet.id
  associate_public_ip_address = {{associate_public_ip}}

  root_block_device {
    volume_type           = "gp3"
    volume_size           = {{root_volume_size}}
    delete_on_termination = true
    encrypted             = true
  }

  ebs_block_device {
    device_name = "/dev/sdf"
    volume_type = "gp3"
    volume_size = {{ebs_volume_size}}
    encrypted   = true
  }

  monitoring = true
  ebs_optimized = true

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
    instance_metadata_tags      = "enabled"
  }

  user_data = base64encode(templatefile("\${path.module}/templates/user-data.sh", {
    environment = var.environment
    instance_name = "{{name}}"
  }))

  tags = {
    Name        = "{{name}}"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Data source for latest Amazon Linux 2 AMI
data "aws_ami" "{{ami_type}}" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# SSH Key Pair
resource "aws_key_pair" "{{name}}_key" {
  key_name   = "\${var.environment}-\${var.application_name}-{{name}}-key"
  public_key = var.public_key

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-key"
    Environment = var.environment
    Terraform   = "true"
  }
}

# CloudWatch Log Group for instance logs
resource "aws_cloudwatch_log_group" "{{name}}_logs" {
  name              = "/aws/ec2/\${var.environment}/\${var.application_name}/{{name}}"
  retention_in_days = 30

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-logs"
    Environment = var.environment
    Terraform   = "true"
  }
}

# IAM Instance Profile (if needed)
resource "aws_iam_instance_profile" "{{name}}_profile" {
  name = "\${var.environment}-\${var.application_name}-{{name}}-profile"
  role = aws_iam_role.ec2_role.name
}

# IAM Role for EC2 instances
resource "aws_iam_role" "ec2_role" {
  name = "\${var.environment}-\${var.application_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-ec2-role"
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_iam_role_policy_attachment" "ec2_ssm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ec2_cloudwatch_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}`,
    examples: [
      `resource "aws_instance" "web_server" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.medium"
  key_name                   = aws_key_pair.web_key.key_name
  vpc_security_group_ids     = [aws_security_group.web_sg.id]
  subnet_id                  = aws_subnet.public.id
  associate_public_ip_address = true

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 50
    delete_on_termination = true
    encrypted             = true
  }

  ebs_block_device {
    device_name = "/dev/sdf"
    volume_type = "gp3"
    volume_size = 100
    encrypted   = true
  }

  monitoring = true
  ebs_optimized = true

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
    instance_metadata_tags      = "enabled"
  }

  user_data = base64encode(templatefile("\${path.module}/templates/user-data.sh", {
    environment = var.environment
    instance_name = "web-server"
  }))

  tags = {
    Name        = "web-server"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}`
    ],
    bestPractices: [
      'Use IMDSv2 (HTTP tokens required)',
      'Enable encryption at rest for all volumes',
      'Use gp3 volumes for better performance control',
      'Enable detailed monitoring',
      'Use data sources for dynamic values',
      'Use variables for environment-specific values',
      'Implement proper tagging strategy',
      'Use user_data for configuration management',
      'Enable metadata options for security',
      'Attach IAM roles instead of storing credentials',
      'Use CloudWatch for logging and monitoring',
      'Implement proper network segmentation'
    ],
    requiredFields: ['ami', 'instance_type'],
    optionalFields: ['key_name', 'vpc_security_group_ids', 'subnet_id', 'root_block_device', 'metadata_options', 'tags']
  },
  'aws_s3_bucket': {
    terraformTemplate: `# S3 Bucket
resource "aws_s3_bucket" "{{name}}" {
  bucket = "\${var.environment}-\${var.application_name}-{{name}}-\${random_string.suffix.result}"

  tags = {
    Name        = "{{name}}"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "{{name}}_versioning" {
  bucket = aws_s3_bucket.{{name}}.id
  versioning_configuration {
    status = "{{versioning_status}}"
  }
}

# S3 Bucket Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "{{name}}_encryption" {
  bucket = aws_s3_bucket.{{name}}.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.{{name}}.arn
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "{{name}}_public_access" {
  bucket = aws_s3_bucket.{{name}}.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "{{name}}_lifecycle" {
  bucket = aws_s3_bucket.{{name}}.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }

  rule {
    id     = "abort-incomplete-multipart"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# S3 Bucket Policy (if needed)
resource "aws_s3_bucket_policy" "{{name}}_policy" {
  bucket = aws_s3_bucket.{{name}}.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSSLRequestsOnly"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.{{name}}.arn,
          "\${aws_s3_bucket.{{name}}.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport": "false"
          }
        }
      }
    ]
  })
}

# S3 Bucket CORS Configuration
resource "aws_s3_bucket_cors_configuration" "{{name}}_cors" {
  bucket = aws_s3_bucket.{{name}}.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# KMS Key for S3 Encryption
resource "aws_kms_key" "{{name}}" {
  description             = "KMS key for \${var.environment} \${var.application_name} S3 bucket"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::\${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-s3-kms-key"
    Environment = var.environment
    Terraform   = "true"
  }
}

# KMS Alias
resource "aws_kms_alias" "{{name}}_alias" {
  name          = "alias/\${var.environment}/\${var.application_name}/s3-key"
  target_key_id = aws_kms_key.{{name}}.id
}

# Random string for unique bucket name
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
  number  = true
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# CloudWatch Event Rule for S3 notifications (if needed)
resource "aws_cloudwatch_event_rule" "{{name}}_s3_events" {
  name        = "\${var.environment}-\${var.application_name}-s3-events"
  description = "Capture S3 bucket events for \${var.environment} \${var.application_name}"

  event_pattern = jsonencode({
    source = ["aws.s3"]
    detail-type = ["S3 Object Created", "S3 Object Deleted"]
    detail = {
      bucket = {
        name = [aws_s3_bucket.{{name}}.id]
      }
    }
  })

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-s3-events"
    Environment = var.environment
    Terraform   = "true"
  }
}`,
    examples: [
      `resource "aws_s3_bucket" "image_storage" {
  bucket = "\${var.environment}-\${var.application_name}-image-storage-\${random_string.suffix.result}"

  tags = {
    Name        = "image-storage"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

resource "aws_s3_bucket_versioning" "image_storage_versioning" {
  bucket = aws_s3_bucket.image_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "image_storage_encryption" {
  bucket = aws_s3_bucket.image_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.image_storage.arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "image_storage_public_access" {
  bucket = aws_s3_bucket.image_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_kms_key" "image_storage" {
  description             = "KMS key for \${var.environment} \${var.application_name} image storage"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-image-storage-kms-key"
    Environment = var.environment
    Terraform   = "true"
  }
}`
    ],
    bestPractices: [
      'Enable versioning for data protection',
      'Enforce encryption at rest using KMS',
      'Block public access by default',
      'Implement lifecycle policies for cost optimization',
      'Require SSL transport',
      'Use proper tagging strategy',
      'Implement cross-region replication for critical data',
      'Set up CORS configuration for web applications',
      'Use CloudWatch for monitoring and alerting',
      'Implement proper access logging'
    ],
    requiredFields: ['bucket'],
    optionalFields: ['tags', 'versioning', 'encryption', 'public_access_block', 'lifecycle_rule', 'policy', 'cors']
  },
  'aws_vpc': {
    terraformTemplate: `# VPC
resource "aws_vpc" "{{name}}" {
  cidr_block                       = "{{cidr_block}}"
  enable_dns_hostnames             = {{enable_dns_hostnames}}
  enable_dns_support               = {{enable_dns_support}}
  assign_generated_ipv6_cidr_block = {{assign_ipv6_cidr_block}}

  tags = {
    Name        = "{{name}}"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Internet Gateway
resource "aws_internet_gateway" "{{name}}_igw" {
  vpc_id = aws_vpc.{{name}}.id

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-igw"
    Environment = var.environment
    Terraform   = "true"
  }
}

# Public Subnets
resource "aws_subnet" "{{name}}_public_1" {
  vpc_id                  = aws_vpc.{{name}}.id
  cidr_block              = "{{public_cidr_block_1}}"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-public-subnet-1"
    Environment = var.environment
    Terraform   = "true"
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_subnet" "{{name}}_public_2" {
  vpc_id                  = aws_vpc.{{name}}.id
  cidr_block              = "{{public_cidr_block_2}}"
  availability_zone       = "\${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-public-subnet-2"
    Environment = var.environment
    Terraform   = "true"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private Subnets
resource "aws_subnet" "{{name}}_private_1" {
  vpc_id            = aws_vpc.{{name}}.id
  cidr_block        = "{{private_cidr_block_1}}"
  availability_zone = "\${var.aws_region}a"

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-private-subnet-1"
    Environment = var.environment
    Terraform   = "true"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_subnet" "{{name}}_private_2" {
  vpc_id            = aws_vpc.{{name}}.id
  cidr_block        = "{{private_cidr_block_2}}"
  availability_zone = "\${var.aws_region}b"

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-private-subnet-2"
    Environment = var.environment
    Terraform   = "true"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# NAT Gateway EIP
resource "aws_eip" "{{name}}_nat_eip" {
  domain = "vpc"
  tags = {
    Name        = "\${var.environment}-\${var.application_name}-nat-eip"
    Environment = var.environment
    Terraform   = "true"
  }
}

# NAT Gateway
resource "aws_nat_gateway" "{{name}}_nat_gw" {
  allocation_id = aws_eip.{{name}}_nat_eip.id
  subnet_id     = aws_subnet.{{name}}_public_1.id
  connectivity_type = "public"

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-nat-gw"
    Environment = var.environment
    Terraform   = "true"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "{{name}}_public" {
  vpc_id = aws_vpc.{{name}}.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.{{name}}_igw.id
  }

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-public-route-table"
    Environment = var.environment
    Terraform   = "true"
  }
}

# Route Table for Private Subnets
resource "aws_route_table" "{{name}}_private" {
  vpc_id = aws_vpc.{{name}}.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.{{name}}_nat_gw.id
  }

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-private-route-table"
    Environment = var.environment
    Terraform   = "true"
  }
}

# Route Table Associations for Public Subnets
resource "aws_route_table_association" "{{name}}_public_1_assoc" {
  subnet_id      = aws_subnet.{{name}}_public_1.id
  route_table_id = aws_route_table.{{name}}_public.id
}

resource "aws_route_table_association" "{{name}}_public_2_assoc" {
  subnet_id      = aws_subnet.{{name}}_public_2.id
  route_table_id = aws_route_table.{{name}}_public.id
}

# Route Table Associations for Private Subnets
resource "aws_route_table_association" "{{name}}_private_1_assoc" {
  subnet_id      = aws_subnet.{{name}}_private_1.id
  route_table_id = aws_route_table.{{name}}_private.id
}

resource "aws_route_table_association" "{{name}}_private_2_assoc" {
  subnet_id      = aws_subnet.{{name}}_private_2.id
  route_table_id = aws_route_table.{{name}}_private.id
}

# Default Security Group
resource "aws_default_security_group" "{{name}}_default" {
  vpc_id = aws_vpc.{{name}}.id

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-default-sg"
    Environment = var.environment
    Terraform   = "true"
  }
}

# VPC Flow Logs
resource "aws_flow_log" "{{name}}_flow_log" {
  log_destination_type = "cloud-watch-logs"
  log_group_name       = aws_cloudwatch_log_group.vpc_flow_logs.name
  resource_type        = "VPC"
  traffic_type         = "ALL"
  vpc_id              = aws_vpc.{{name}}.id

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-vpc-flow-logs"
    Environment = var.environment
    Terraform   = "true"
  }
}

# CloudWatch Log Group for VPC Flow Logs
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/\${var.environment}/\${var.application_name}/flow-logs"
  retention_in_days = 30

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-vpc-flow-logs-group"
    Environment = var.environment
    Terraform   = "true"
  }
}

# VPC Endpoint for S3 (to avoid NAT for S3 traffic)
resource "aws_vpc_endpoint" "{{name}}_s3_endpoint" {
  vpc_id       = aws_vpc.{{name}}.id
  service_name = "com.amazonaws.\${var.aws_region}.s3"
  route_table_ids = [
    aws_route_table.{{name}}_private.id
  ]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-s3-vpc-endpoint"
    Environment = var.environment
    Terraform   = "true"
  }
}

# VPC Endpoint for DynamoDB (to avoid NAT for DynamoDB traffic)
resource "aws_vpc_endpoint" "{{name}}_dynamodb_endpoint" {
  vpc_id       = aws_vpc.{{name}}.id
  service_name = "com.amazonaws.\${var.aws_region}.dynamodb"
  route_table_ids = [
    aws_route_table.{{name}}_private.id
  ]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-dynamodb-vpc-endpoint"
    Environment = var.environment
    Terraform   = "true"
  }
}

# VPC Endpoint for CloudWatch Logs (to avoid NAT for log traffic)
resource "aws_vpc_endpoint" "{{name}}_logs_endpoint" {
  vpc_id       = aws_vpc.{{name}}.id
  service_name = "com.amazonaws.\${var.aws_region}.logs"
  route_table_ids = [
    aws_route_table.{{name}}_private.id
  ]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-logs-vpc-endpoint"
    Environment = var.environment
    Terraform   = "true"
  }
}

# VPC Endpoint for SSM (to avoid NAT for SSM traffic)
resource "aws_vpc_endpoint" "{{name}}_ssm_endpoint" {
  vpc_id       = aws_vpc.{{name}}.id
  service_name = "com.amazonaws.\${var.aws_region}.ssm"
  route_table_ids = [
    aws_route_table.{{name}}_private.id
  ]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-ssm-vpc-endpoint"
    Environment = var.environment
    Terraform   = "true"
  }
}

# VPC Endpoint for Secrets Manager (to avoid NAT for secrets traffic)
resource "aws_vpc_endpoint" "{{name}}_secretsmanager_endpoint" {
  vpc_id       = aws_vpc.{{name}}.id
  service_name = "com.amazonaws.\${var.aws_region}.secretsmanager"
  route_table_ids = [
    aws_route_table.{{name}}_private.id
  ]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-secretsmanager-vpc-endpoint"
    Environment = var.environment
    Terraform   = "true"
  }
}

# DHCP Options Set
resource "aws_vpc_dhcp_options" "{{name}}_dhcp" {
  domain_name         = var.aws_region == "us-east-1" ? "ec2.internal" : "\${var.aws_region}.compute.internal"
  domain_name_servers = ["AmazonProvidedDNS"]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-dhcp-options"
    Environment = var.environment
    Terraform   = "true"
  }
}

# DHCP Options Association
resource "aws_vpc_dhcp_options_association" "{{name}}_dhcp_assoc" {
  vpc_id          = aws_vpc.{{name}}.id
  dhcp_options_id = aws_vpc_dhcp_options.{{name}}_dhcp.id
}`,
    examples: [
      `resource "aws_vpc" "main" {
  cidr_block                       = "10.0.0.0/16"
  enable_dns_hostnames             = true
  enable_dns_support               = true
  assign_generated_ipv6_cidr_block = true

  tags = {
    Name        = "main"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

resource "aws_internet_gateway" "main_igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-igw"
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-public-subnet-1"
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "\${var.aws_region}a"

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-private-subnet-1"
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_eip" "nat_eip" {
  domain = "vpc"
  tags = {
    Name        = "\${var.environment}-\${var.application_name}-nat-eip"
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_1.id
  connectivity_type = "public"

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-nat-gw"
    Environment = var.environment
    Terraform   = "true"
  }
}`
    ],
    bestPractices: [
      'Enable IPv6 support',
      'Use dedicated subnets for different purposes',
      'Implement NAT gateways for private subnets',
      'Use centralized routing tables',
      'Tag resources consistently',
      'Implement VPC flow logs for security monitoring',
      'Use AWS Transit Gateway for complex networking',
      'Create VPC endpoints to avoid NAT for service traffic',
      'Implement proper DHCP options',
      'Use multiple AZs for high availability'
    ],
    requiredFields: ['cidr_block'],
    optionalFields: ['enable_dns_hostnames', 'enable_dns_support', 'assign_generated_ipv6_cidr_block', 'tags', 'instance_tenancy']
  },
  'aws_security_group': {
    terraformTemplate: `# Security Group
resource "aws_security_group" "{{name}}" {
  name_prefix = "\${var.environment}-\${var.application_name}-{{name}}-"
  description = "{{description}}"
  vpc_id      = "{{vpc_id}}"

  revoke_rules_on_delete = true

  tags = {
    Name        = "{{name}}"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Ingress Rules
{{#ingress_rules}}
resource "aws_security_group_rule" "{{name}}_ingress_{{@index}}" {
  type                     = "ingress"
  from_port                = {{from_port}}
  to_port                  = {{to_port}}
  protocol                 = "{{protocol}}"
  description              = "{{description}}"
  security_group_id        = aws_security_group.{{name}}.id

  {{#cidr_blocks}}
  cidr_blocks              = [{{cidr_blocks}}]
  {{/cidr_blocks}}
  {{#source_security_group_id}}
  source_security_group_id = {{source_security_group_id}}
  {{/source_security_group_id}}
}
{{/ingress_rules}}

# Egress Rules
{{#egress_rules}}
resource "aws_security_group_rule" "{{name}}_egress_{{@index}}" {
  type              = "egress"
  from_port         = {{from_port}}
  to_port           = {{to_port}}
  protocol          = "{{protocol}}"
  description       = "{{description}}"
  security_group_id = aws_security_group.{{name}}.id

  {{#cidr_blocks}}
  cidr_blocks       = [{{cidr_blocks}}]
  {{/cidr_blocks}}
  {{#destination_security_group_id}}
  security_groups   = [{{destination_security_group_id}}]
  {{/destination_security_group_id}}
}
{{/egress_rules}}

# Security Group Rule with source security group
resource "aws_security_group_rule" "{{name}}_rule" {
  type                     = "{{rule_type}}"
  from_port                = {{from_port}}
  to_port                  = {{to_port}}
  protocol                 = "{{protocol}}"
  source_security_group_id = "{{source_sg_id}}"
  security_group_id        = aws_security_group.{{name}}.id
  description              = "{{description}}"
}`,
    examples: [
      `resource "aws_security_group" "web_sg" {
  name_prefix = "\${var.environment}-\${var.application_name}-web-"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  revoke_rules_on_delete = true

  tags = {
    Name        = "web-sg"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

resource "aws_security_group_rule" "web_ingress_http" {
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  description              = "HTTP from anywhere"
  security_group_id        = aws_security_group.web_sg.id
  cidr_blocks              = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "web_ingress_https" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  description              = "HTTPS from anywhere"
  security_group_id        = aws_security_group.web_sg.id
  cidr_blocks              = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "web_egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  description       = "All outbound traffic"
  security_group_id = aws_security_group.web_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}`
    ],
    bestPractices: [
      'Use security group rules instead of inline rules for complex setups',
      'Revoke rules on delete to prevent orphaned rules',
      'Use source security groups instead of IP ranges when possible',
      'Implement zero trust networking principles',
      'Use descriptive names and descriptions',
      'Tag security groups appropriately',
      'Regularly audit security group rules',
      'Use security hub for automated compliance checks',
      'Implement least privilege access',
      'Use security groups for internal communication'
    ],
    requiredFields: ['name', 'vpc_id'],
    optionalFields: ['description', 'ingress', 'egress', 'tags', 'revoke_rules_on_delete']
  },
  'aws_db_instance': {
    terraformTemplate: `# RDS Instance
resource "aws_db_instance" "{{name}}" {
  identifier_prefix          = "\${var.environment}-\${var.application_name}-{{name}}-"
  allocated_storage          = {{allocated_storage}}
  max_allocated_storage      = {{max_allocated_storage}}
  storage_type               = "{{storage_type}}"
  engine                     = "{{engine}}"
  engine_version             = "{{engine_version}}"
  instance_class             = "{{instance_class}}"
  db_name                    = "{{db_name}}"
  username                   = "{{username}}"
  password                   = var.db_password
  backup_retention_period    = {{backup_retention_period}}
  backup_window              = "{{backup_window}}"
  maintenance_window         = "{{maintenance_window}}"
  skip_final_snapshot        = {{skip_final_snapshot}}
  deletion_protection        = {{deletion_protection}}
  multi_az                   = {{multi_az}}
  storage_encrypted          = true
  copy_tags_to_snapshot      = true
  publicly_accessible        = false
  vpc_security_group_ids     = [aws_security_group.{{name}}_sg.id]
  db_subnet_group_name       = aws_db_subnet_group.{{name}}.name
  parameter_group_name       = aws_db_parameter_group.{{name}}.name

  performance_insights_enabled = {{performance_insights_enabled}}
  performance_insights_retention_period = {{performance_insights_retention_period}}

  {{#enabled_cloudwatch_logs_exports}}
  enabled_cloudwatch_logs_exports = [{{enabled_cloudwatch_logs_exports}}]
  {{/enabled_cloudwatch_logs_exports}}

  tags = {
    Name        = "{{name}}"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "{{name}}" {
  name       = "\${var.environment}-\${var.application_name}-{{name}}-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  description = "Subnet group for \${var.environment} \${var.application_name} {{name}} database"

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-subnet-group"
    Environment = var.environment
    Terraform   = "true"
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "{{name}}" {
  name   = "\${var.environment}-\${var.application_name}-{{name}}-parameter-group"
  family = "{{parameter_group_family}}"
  description = "Parameter group for \${var.environment} \${var.application_name} {{name}} database"

  {{#parameters}}
  parameter {
    name  = "{{name}}"
    value = "{{value}}"
    apply_method = "{{apply_method}}"
  }
  {{/parameters}}

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-parameter-group"
    Environment = var.environment
    Terraform   = "true"
  }
}

# DB Option Group
resource "aws_db_option_group" "{{name}}_option_group" {
  name                    = "\${var.environment}-\${var.application_name}-{{name}}-option-group"
  option_group_description = "Option group for \${var.environment} \${var.application_name} {{name}} database"
  engine_name             = "{{engine}}"
  major_engine_version    = "{{major_engine_version}}"

  {{#options}}
  option {
    option_name = "{{option_name}}"

    {{#option_settings}}
    option_settings {
      name  = "{{name}}"
      value = "{{value}}"
    }
    {{/option_settings}}
  }
  {{/options}}

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-option-group"
    Environment = var.environment
    Terraform   = "true"
  }
}

# CloudWatch Log Group for RDS logs
resource "aws_cloudwatch_log_group" "{{name}}_logs" {
  name              = "/aws/rds/cluster/\${var.environment}/\${var.application_name}/{{name}}"
  retention_in_days = 30

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-logs"
    Environment = var.environment
    Terraform   = "true"
  }
}

# KMS Key for RDS encryption
resource "aws_kms_key" "{{name}}_kms" {
  description             = "KMS key for \${var.environment} \${var.application_name} {{name}} database encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-kms-key"
    Environment = var.environment
    Terraform   = "true"
  }
}

# KMS Alias
resource "aws_kms_alias" "{{name}}_kms_alias" {
  name          = "alias/\${var.environment}/\${var.application_name}/rds-key"
  target_key_id = aws_kms_key.{{name}}_kms.id
}

# RDS Event Subscription (for monitoring)
resource "aws_db_event_subscription" "{{name}}_event_subscription" {
  name          = "\${var.environment}-\${var.application_name}-{{name}}-events"
  sns_topic     = aws_sns_topic.rds_notifications.arn
  source_type   = "db-instance"
  source_ids    = [aws_db_instance.{{name}}.id]

  event_categories = [
    "availability",
    "configuration change",
    "deletion",
    "failover",
    "low storage",
    "maintenance",
    "notification",
    "recovery"
  ]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-event-subscription"
    Environment = var.environment
    Terraform   = "true"
  }
}

# SNS Topic for RDS notifications
resource "aws_sns_topic" "rds_notifications" {
  name = "\${var.environment}-\${var.application_name}-rds-notifications"

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-rds-notifications"
    Environment = var.environment
    Terraform   = "true"
  }
}`,
    examples: [
      `resource "aws_db_instance" "main_postgres" {
  identifier_prefix          = "\${var.environment}-\${var.application_name}-postgres-"
  allocated_storage          = 100
  max_allocated_storage      = 1000
  storage_type               = "gp3"
  engine                     = "postgres"
  engine_version             = "15.4"
  instance_class             = "db.t3.medium"
  db_name                    = "myapp"
  username                   = "admin"
  password                   = var.db_password
  backup_retention_period    = 7
  backup_window              = "03:00-04:00"
  maintenance_window         = "sun:04:00-sun:05:00"
  skip_final_snapshot        = false
  deletion_protection        = true
  multi_az                   = true
  storage_encrypted          = true
  copy_tags_to_snapshot      = true
  publicly_accessible        = false
  vpc_security_group_ids     = [aws_security_group.db_sg.id]
  db_subnet_group_name       = aws_db_subnet_group.main.name
  parameter_group_name       = aws_db_parameter_group.postgres.name

  performance_insights_enabled = true
  performance_insights_retention_period = 7

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name        = "main-postgres"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "\${var.environment}-\${var.application_name}-main-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-main-subnet-group"
    Environment = var.environment
  }
}`
    ],
    bestPractices: [
      'Enable multi-AZ for high availability',
      'Use encrypted storage',
      'Enable performance insights',
      'Implement proper backup strategies',
      'Use parameter groups for configuration',
      'Enable deletion protection',
      'Use option groups for advanced features',
      'Export logs to CloudWatch',
      'Use RDS Proxy for connection management',
      'Implement read replicas for scaling',
      'Use Aurora for better performance and availability',
      'Set up monitoring and alerting for database metrics'
    ],
    requiredFields: ['identifier', 'engine', 'instance_class', 'username', 'password'],
    optionalFields: ['allocated_storage', 'backup_retention_period', 'backup_window', 'maintenance_window', 'vpc_security_group_ids', 'deletion_protection', 'multi_az', 'parameter_group_name']
  },
  'aws_lambda_function': {
    terraformTemplate: `# Lambda Function
resource "aws_lambda_function" "{{name}}" {
  filename         = "{{filename}}"
  function_name    = "\${var.environment}-\${var.application_name}-{{name}}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "{{handler}}"
  runtime          = "{{runtime}}"  # Recommended: python3.13 or python3.14 for 2026
  timeout          = {{timeout}}
  memory_size      = {{memory_size}}

  source_code_hash = data.archive_file.lambda_zip.output_base64

  environment {
    variables = {
      ENVIRONMENT    = var.environment
      APPLICATION    = var.application_name
      LOG_LEVEL      = "INFO"
      {{#additional_environment_variables}}
      {{key}}        = "{{value}}"
      {{/additional_environment_variables}}
    }
  }

  # VPC Configuration for accessing private resources
  vpc_config {
    subnet_ids         = [aws_subnet.{{parentNode}}_private_1.id, aws_subnet.{{parentNode}}_private_2.id]
    security_group_ids = [aws_security_group.{{name}}_lambda_sg.id]
  }

  tracing_config {
    mode = "{{tracing_mode}}"  # Default: "Active" for production
  }

  reserved_concurrent_executions = {{reserved_concurrent_executions}}  # Default: -1 for unlimited

  {{#layers}}
  layers = [
    {{#each layers}}
    "{{this}}",
    {{/each}}
  ]
  {{/layers}}

  tags = {
    Name        = "{{name}}"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Lambda execution role
resource "aws_iam_role" "lambda_exec" {
  name = "\${var.environment}-\${var.application_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-lambda-role"
    Environment = var.environment
    Terraform   = "true"
  }
}

# Required IAM policy for VPC access (includes EC2 network interface permissions)
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda source code archive
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "\${path.module}/lambda/\${var.application_name}/{{name}}/main.py"
  output_path = "\${path.module}/lambda/\${var.application_name}/{{name}}/function.zip"
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "{{name}}_logs" {
  name              = "/aws/lambda/\${var.environment}-\${var.application_name}-{{name}}"
  retention_in_days = 30

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-logs"
    Environment = var.environment
    Terraform   = "true"
  }
}

# Security Group for Lambda to access private resources
resource "aws_security_group" "{{name}}_lambda_sg" {
  name_prefix = "\${var.environment}-\${var.application_name}-{{name}}-lambda-"
  description = "Security group for Lambda function {{name}} to access private resources"
  vpc_id      = aws_vpc.{{parentNode}}.id  # Reference to the actual VPC resource

  # Allow outbound to private EC2 instances inside VPC (any port/TCP)
  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.{{parentNode}}.cidr_block]  # Reference to actual VPC CIDR
    description = "Allow outbound to private resources within VPC"
  }

  # Allow outbound to AWS services via VPC endpoints (cost optimization)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    prefix_list_ids = [aws_vpc_endpoint.{{parentNode}}_s3_endpoint.prefix_list_id]  # S3 endpoint
    description = "Allow outbound to S3 via VPC endpoint"
  }

  # Allow outbound to DynamoDB via VPC endpoint
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    prefix_list_ids = [aws_vpc_endpoint.{{parentNode}}_dynamodb_endpoint.prefix_list_id]  # DynamoDB endpoint
    description = "Allow outbound to DynamoDB via VPC endpoint"
  }

  # Allow outbound to CloudWatch Logs via VPC endpoint
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    prefix_list_ids = [aws_vpc_endpoint.{{parentNode}}_logs_endpoint.prefix_list_id]  # CloudWatch Logs endpoint
    description = "Allow outbound to CloudWatch Logs via VPC endpoint"
  }

  # Allow outbound to SSM via VPC endpoint
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    prefix_list_ids = [aws_vpc_endpoint.{{parentNode}}_ssm_endpoint.prefix_list_id]  # SSM endpoint
    description = "Allow outbound to SSM via VPC endpoint"
  }

  # Allow outbound to Secrets Manager via VPC endpoint
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    prefix_list_ids = [aws_vpc_endpoint.{{parentNode}}_secretsmanager_endpoint.prefix_list_id]  # Secrets Manager endpoint
    description = "Allow outbound to Secrets Manager via VPC endpoint"
  }

  # Allow outbound to internet for AWS services only (minimize NAT usage)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTPS to internet for AWS services"
  }

  tags = {
    Name        = "{{name}}-lambda-sg"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Security Group for private EC2 instance (allow inbound from Lambda)
resource "aws_security_group" "{{name}}_ec2_sg" {
  name_prefix = "\${var.environment}-\${var.application_name}-{{name}}-ec2-"
  description = "Security group for private EC2 instance accessible by Lambda"
  vpc_id      = aws_vpc.{{parentNode}}.id

  # Inbound from Lambda security group
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.{{name}}_lambda_sg.id]  # Allow only Lambda SG
    description     = "Allow inbound from Lambda function on port 8080"
  }

  # Inbound for common ports if needed
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.{{name}}_lambda_sg.id]
    description     = "Allow inbound HTTPS from Lambda function"
  }

  # Outbound to internet
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound to internet"
  }

  tags = {
    Name        = "{{name}}-ec2-sg"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Lambda Event Source Mapping (if needed)
{{#event_source_mapping}}
resource "aws_lambda_event_source_mapping" "{{name}}_event_source" {
  event_source_arn = "{{event_source_arn}}"
  function_name    = aws_lambda_function.{{name}}.arn
  batch_size       = {{batch_size}}
  enabled          = {{enabled}}
}
{{/event_source_mapping}}

# Lambda Alias (for versioning)
resource "aws_lambda_alias" "{{name}}_alias" {
  name             = "current"
  description      = "Current version of \${var.environment}-\${var.application_name}-{{name}}"
  function_name    = aws_lambda_function.{{name}}.arn
  function_version = aws_lambda_function.{{name}}.version
}

# Lambda Provisioned Concurrency (for performance)
resource "aws_lambda_provisioned_concurrency_config" "{{name}}_provisioned_concurrency" {
  function_name                    = aws_lambda_function.{{name}}.function_name
  qualifier                       = aws_lambda_alias.{{name}}_alias.name
  provisioned_concurrent_executions = 2
}

# Lambda URL Configuration (if needed)
resource "aws_lambda_function_url" "{{name}}_url" {
  function_name      = aws_lambda_function.{{name}}.function_name
  authorization_type = "{{url_auth_type}}"  # Default: "AWS_IAM" for security

  cors {
    allow_credentials = {{url_cors_allow_credentials}}  # Default: false
    allow_origins     = var.allowed_origins
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    max_age           = 86400
  }
}`,
    examples: [
      `resource "aws_lambda_function" "api_handler" {
  filename         = "api_handler.zip"
  function_name    = "\${var.environment}-\${var.application_name}-api-handler"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "main.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  memory_size      = 256

  source_code_hash = filebase64sha256("api_handler.zip")

  environment {
    variables = {
      ENVIRONMENT = var.environment
      LOG_LEVEL   = "INFO"
      DB_HOST     = aws_db_instance.main.endpoint
    }
  }

  # VPC Configuration for accessing private resources
  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda_api_sg.id]
  }

  tracing_config {
    mode = "Active"
  }

  reserved_concurrent_executions = 10

  tags = {
    Name        = "api-handler"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Lambda execution role with VPC access
resource "aws_iam_role" "lambda_exec" {
  name = "\${var.environment}-\${var.application_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Required IAM policy for VPC access
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Security Group for Lambda to access private EC2 instance
resource "aws_security_group" "lambda_api_sg" {
  name_prefix = "\${var.environment}-\${var.application_name}-lambda-api-"
  description = "Security group for Lambda function to access private EC2 instance"
  vpc_id      = aws_vpc.main.id

  # Outbound traffic to private EC2 instance on port 8080
  egress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]  # Reference to VPC CIDR variable
    description = "Allow outbound to private EC2 instance on port 8080"
  }

  # Outbound traffic to internet (for general access)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound to internet"
  }

  tags = {
    Name        = "lambda-api-sg"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}`
    ],
    bestPractices: [
      'Use VPC configuration for private resources',
      'Implement proper IAM roles and policies',
      'Use environment variables for configuration',
      'Enable active tracing with X-Ray',
      'Set appropriate timeout and memory limits',
      'Use reserved concurrency for critical functions',
      'Use Lambda layers for shared code',
      'Enable proper logging and monitoring',
      'Use dead letter queues for error handling',
      'Implement proper versioning and aliases',
      'Use provisioned concurrency for predictable performance',
      'Use Lambda URLs for simple API endpoints'
    ],
    requiredFields: ['filename', 'function_name', 'role', 'handler', 'runtime'],
    optionalFields: ['timeout', 'memory_size', 'environment', 'vpc_config', 'tracing_config', 'reserved_concurrent_executions', 'layers']
  },
  'aws_iam_role': {
    terraformTemplate: `# IAM Role
resource "aws_iam_role" "{{name}}" {
  name = "\${var.environment}-\${var.application_name}-{{name}}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "{{assume_role_action}}"
        Effect = "Allow"
        Principal = {
          {{#service_principal}}
          Service = "{{service_principal}}"
          {{/service_principal}}
          {{#account_principal}}
          AWS   = "arn:aws:iam::{{account_principal}}:root"
          {{/account_principal}}
          {{#federated_principal}}
          Federated = "{{federated_principal}}"
          {{/federated_principal}}
        }
      }
    ]
  })

  managed_policy_arns = [
    {{#managed_policies}}
    "{{this}}",
    {{/managed_policies}}
  ]

  tags = {
    Name        = "{{name}}"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

# Inline policy for the role (if needed)
{{#inline_policies}}
resource "aws_iam_role_policy" "{{name}}_{{@index}}" {
  name = "\${var.environment}-\${var.application_name}-{{name}}-policy-{{@index}}"
  role = aws_iam_role.{{name}}.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          {{#actions}}
          "{{this}}",
          {{/actions}}
        ]
        Resource = [
          {{#resources}}
          "{{this}}",
          {{/resources}}
        ]
      }
    ]
  })
}
{{/inline_policies}}

# Instance Profile (if needed for EC2)
{{#create_instance_profile}}
resource "aws_iam_instance_profile" "{{name}}_instance_profile" {
  name = "\${var.environment}-\${var.application_name}-{{name}}-profile"
  role = aws_iam_role.{{name}}.name
}
{{/create_instance_profile}}

# Role Policy Attachment
{{#policy_attachments}}
resource "aws_iam_role_policy_attachment" "{{name}}_policy_{{@index}}" {
  role       = aws_iam_role.{{name}}.name
  policy_arn = "{{this}}"
}
{{/policy_attachments}}

# Role Boundary (for permission boundaries)
{{#role_boundary}}
resource "aws_iam_role_policy_attachment" "{{name}}_boundary" {
  role       = aws_iam_role.{{name}}.name
  policy_arn = "{{role_boundary}}"
}
{{/role_boundary}}

# OIDC Provider for EKS/Federation (if needed)
{{#oidc_provider}}
resource "aws_iam_openid_connect_provider" "{{name}}_oidc" {
  url = "{{oidc_url}}"

  client_id_list = [
    "{{oidc_client_id}}"
  ]

  thumbprint_list = [
    "{{oidc_thumbprint}}"
  ]
}
{{/oidc_provider}}

# CloudWatch Log Group for role activity (if needed)
resource "aws_cloudwatch_log_group" "{{name}}_activity_logs" {
  name              = "/aws/iam/\${var.environment}/\${var.application_name}/{{name}}-activity"
  retention_in_days = 30

  tags = {
    Name        = "\${var.environment}-\${var.application_name}-{{name}}-activity-logs"
    Environment = var.environment
    Terraform   = "true"
  }
}`,
    examples: [
      `resource "aws_iam_role" "api_lambda_role" {
  name = "\${var.environment}-\${var.application_name}-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"
  ]

  tags = {
    Name        = "api-lambda-role"
    Environment = var.environment
    ManagedBy   = "Zenith Ai"
    Terraform   = "true"
    Application = var.application_name
  }
}

resource "aws_iam_role_policy" "api_lambda_policy" {
  name = "\${var.environment}-\${var.application_name}-api-lambda-policy"
  role = aws_iam_role.api_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.main.arn
      }
    ]
  })
}`
    ],
    bestPractices: [
      'Use managed policies when possible',
      'Implement least-privilege access',
      'Use inline policies for specific custom permissions',
      'Tag IAM resources properly',
      'Use service-linked roles when available',
      'Enable IAM access analyzer for security monitoring',
      'Use IAM roles instead of long-term access keys',
      'Implement proper role boundaries and trust policies',
      'Use permission boundaries for organizational controls',
      'Enable CloudTrail logging for IAM activity'
    ],
    requiredFields: ['name', 'assume_role_policy'],
    optionalFields: ['managed_policy_arns', 'inline_policies', 'tags', 'path', 'description']
  }
};

// Simple similarity function to find the best matching resource template
const findBestMatch = (resourceType: string): string | null => {
  // Direct match first
  if (knowledgeBase[resourceType]) {
    return resourceType;
  }

  // Try to find a partial match
  const keys = Object.keys(knowledgeBase);
  for (const key of keys) {
    if (resourceType.includes(key) || key.includes(resourceType.split('_')[1])) {
      return key;
    }
  }

  return null;
};

// Simple template engine to replace placeholders
const renderTemplate = (template: string, data: any): string => {
  let result = template;

  // Replace simple placeholders
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, String(value));
  });

  // Handle conditional blocks (simple implementation)
  const conditionalRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
  result = result.replace(conditionalRegex, (match, condition, content) => {
    const conditionValue = data[condition];
    if (conditionValue) {
      // Replace values within the conditional block
      let renderedContent = content;
      Object.entries(data).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        renderedContent = renderedContent.replace(placeholder, String(value));
      });
      return renderedContent;
    }
    return '';
  });

  return result;
};

/**
 * Generates Terraform code using Zenith Ai logic
 * @param nodes - The nodes from the ReactFlow diagram
 * @returns Generated Terraform code
 */
import { Edge } from 'reactflow';

export const generateTerraformWithRag = async (nodes: Node[], edges?: Edge[]): Promise<string> => {
  if (nodes.length === 0) {
    return '';
  }

  let terraformCode = `# Generated by Zenith Ai
# Zenith Ai - Terraform Configuration
# Modern Infrastructure as Code Practices (2026)

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
  
  required_version = ">= 1.8"
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Application = var.application_name
      ManagedBy   = "Zenith Ai"
      Terraform   = "true"
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
  default     = "dev"
}

variable "application_name" {
  description = "Application name"
  type        = string
  default     = "myapp"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "public_key" {
  description = "Public key for SSH access"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "vpc_id" {
  description = "VPC ID for Lambda function"
  type        = string
  # default     = ""  # This should be provided when deploying
}

variable "vpc_cidr_block" {
  description = "VPC CIDR block for Lambda security group"
  type        = string
  # default     = "10.0.0.0/16"  # This should be provided when deploying
}

`;

  // First, handle VPC resources (as they are typically dependencies)
  const vpcNodes = nodes.filter(node =>
    node.data?.terraformType === 'aws_vpc' ||
    node.data?.type === 'vpc' ||
    node.type === 'vpcGroup'
  );

  for (const node of vpcNodes) {
    const resourceData = node.data as any;
    const resourceName = resourceData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const config = resourceData.config || {};

    const matchedType = findBestMatch(resourceData.terraformType || 'aws_vpc');
    if (matchedType) {
      const templateData = {
        name: resourceName,
        cidr_block: config.cidr_block || '10.0.0.0/16',
        secondary_cidr_block: config.secondary_cidr_block || '10.1.0.0/16',
        enable_dns_hostnames: config.enable_dns_hostnames ?? true,
        enable_dns_support: config.enable_dns_support ?? true,
        assign_ipv6_cidr_block: config.assign_ipv6_cidr_block ?? false,
        public_cidr_block_1: config.public_cidr_block_1 || '10.0.1.0/24',
        public_cidr_block_2: config.public_cidr_block_2 || '10.0.2.0/24',
        private_cidr_block_1: config.private_cidr_block_1 || '10.0.3.0/24',
        private_cidr_block_2: config.private_cidr_block_2 || '10.0.4.0/24',
      };

      const resourceCode = renderTemplate(knowledgeBase[matchedType].terraformTemplate, templateData);
      terraformCode += resourceCode + '\n\n';
    }
  }

  // Then handle other resources
  const otherNodes = nodes.filter(node =>
    node.data?.terraformType !== 'aws_vpc' &&
    node.data?.type !== 'vpc' &&
    node.type !== 'vpcGroup'
  );

  for (const node of otherNodes) {
    const resourceData = node.data as any;
    const resourceName = resourceData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const config = resourceData.config || {};

    const matchedType = findBestMatch(resourceData.terraformType);
    if (matchedType) {
      // Prepare data for template
      let templateData: any = {
        name: resourceName,
        ...config
      };

      // Add default values for required fields if not present
      const requiredFields = knowledgeBase[matchedType].requiredFields;
      for (const field of requiredFields) {
        if (templateData[field] === undefined) {
          switch (field) {
            case 'ami':
              templateData[field] = 'ami-0c55b159cbfafe1f0';
              break;
            case 'instance_type':
              templateData[field] = 't3.micro';
              break;
            case 'engine':
              templateData[field] = 'postgres';
              break;
            case 'instance_class':
              templateData[field] = 'db.t3.micro';
              break;
            case 'username':
              templateData[field] = 'admin';
              break;
            case 'password':
              templateData[field] = 'CHANGEME';
              break;
            case 'allocated_storage':
              templateData[field] = 20;
              break;
            case 'bucket':
              templateData[field] = `${resourceName}-bucket-${Date.now()}`;
              break;
            case 'identifier':
              templateData[field] = resourceName;
              break;
            case 'db_name':
              templateData[field] = 'mydb';
              break;
            case 'versioning_status':
              templateData[field] = 'Enabled';
              break;
            case 'filename':
              templateData[field] = 'lambda_function.zip';
              break;
            case 'function_name':
              templateData[field] = resourceName;
              break;
            case 'handler':
              templateData[field] = 'index.handler';
              break;
            case 'runtime':
              templateData[field] = 'python3.13';  // Updated to latest Python runtime for 2026
              break;
            case 'timeout':
              templateData[field] = 30;
              break;
            case 'memory_size':
              templateData[field] = 128;
              break;
            case 'assume_role_action':
              templateData[field] = 'sts:AssumeRole';
              break;
            case 'assume_role_service':
              templateData[field] = 'ec2.amazonaws.com';
              break;
            case 'default_managed_policy':
              templateData[field] = 'arn:aws:iam::aws:policy/PowerUserAccess';
              break;
            case 'allowed_actions':
              templateData[field] = 's3:GetObject';
              break;
            case 'allowed_resources':
              templateData[field] = '*';
              break;
            case 'backup_retention_period':
              templateData[field] = 7;
              break;
            case 'backup_window':
              templateData[field] = '03:00-04:00';
              break;
            case 'maintenance_window':
              templateData[field] = 'sun:04:00-sun:05:00';
              break;
            case 'skip_final_snapshot':
              templateData[field] = false;
              break;
            case 'deletion_protection':
              templateData[field] = true;
              break;
            case 'multi_az':
              templateData[field] = false;
              break;
            case 'performance_insights_enabled':
              templateData[field] = true;
              break;
            case 'performance_insights_retention_period':
              templateData[field] = 7;
              break;
            case 'tracing_mode':
              templateData[field] = 'Active';  // Default to Active for production monitoring
              break;
            case 'reserved_concurrent_executions':
              templateData[field] = -1;  // Default to unlimited (-1) for production
              break;
            case 'ami_type':
              templateData[field] = 'amazon_linux';
              break;
            case 'associate_public_ip':
              templateData[field] = false;
              break;
            case 'root_volume_size':
              templateData[field] = 20;
              break;
            case 'ebs_volume_size':
              templateData[field] = 100;
              break;
            case 'url_auth_type':
              templateData[field] = 'AWS_IAM';  // Default to AWS_IAM for security
              break;
            case 'url_cors_allow_credentials':
              templateData[field] = false;  // Default to false for security
              break;
            case 'parameter_group_family':
              templateData[field] = 'postgres15';
              break;
            case 'major_engine_version':
              templateData[field] = '15';
              break;
            default:
              templateData[field] = '';
          }
        }
      }

      // Add VPC dependencies if applicable
      if (node.parentNode) {
        const parentVpc = nodes.find(n => n.id === node.parentNode);
        if (parentVpc) {
          const parentResourceName = parentVpc.data?.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (matchedType === 'aws_instance') {
            templateData.vpc_security_group_ids = `aws_security_group.${parentResourceName}_sg.id`;
            templateData.subnet_id = `aws_subnet.${parentResourceName}_subnet.id`;
          } else if (matchedType === 'aws_db_instance') {
            templateData.vpc_security_group_ids = `aws_security_group.${parentResourceName}_sg.id`;
          } else if (matchedType === 'aws_lambda_function') {
            templateData.parentNode = parentResourceName; // Reference to the parent VPC resource name
          }
        }
      }

      const resourceCode = renderTemplate(knowledgeBase[matchedType].terraformTemplate, templateData);
      terraformCode += resourceCode + '\n\n';
    } else {
      // Fallback for unknown resource types
      terraformCode += `# Resource: ${resourceData.label}
# Type: ${resourceData.terraformType || resourceData.type}
# Configuration: ${JSON.stringify(config, null, 2)}
# TODO: Add proper Terraform configuration

`;
    }
  }

  // Add outputs at the end
  terraformCode += `# Outputs
output "lambda_function_arns" {
  description = "ARNs of the Lambda functions"
  value       = [for lambda in aws_lambda_function.* : lambda.arn]
}

output "lambda_function_names" {
  description = "Names of the Lambda functions"
  value       = [for lambda in aws_lambda_function.* : lambda.function_name]
}

`;

  // Process edges to generate networking resources
  if (edges && edges.length > 0) {
    terraformCode += '\n# Networking Resources based on Connections\n';

    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        const sourceData = sourceNode.data as any;
        const targetData = targetNode.data as any;

        // Determine the type of connection and generate appropriate networking resources
        const connectionResources = generateNetworkingResources(
          sourceData,
          targetData,
          sourceNode.id,
          targetNode.id
        );

        terraformCode += connectionResources + '\n';
      }
    }
  }

  return terraformCode;
};

/**
 * Generates networking resources based on the connection between two nodes
 */
const generateNetworkingResources = (
  sourceData: any,
  targetData: any,
  sourceNodeId: string,
  targetNodeId: string
): string => {
  const sourceType = sourceData.terraformType || sourceData.type;
  const targetType = targetData.terraformType || targetData.type;

  // Normalize node IDs to resource names
  const sourceResourceName = sourceData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const targetResourceName = targetData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');

  let networkingCode = '';

  // Define connection mapping to determine necessary networking resources
  if ((sourceType === 'aws_lambda_function' || sourceType === 'lambda') &&
    (targetType === 'aws_instance' || targetType === 'ec2' || targetType === 'aws_db_instance' || targetType === 'rds')) {
    // Lambda to EC2/RDS connection - need security group rules
    networkingCode += '# Security Group Rules for connection from ' + sourceResourceName + ' to ' + targetResourceName + '\n';

    // Inbound rule on target (EC2/RDS) to allow traffic from Lambda
    networkingCode += 'resource "aws_security_group_rule" "' + targetResourceName + '_from_' + sourceResourceName + '_ingress" {\n';
    networkingCode += '  type                     = "ingress"\n';
    networkingCode += '  security_group_id        = aws_security_group.' + targetResourceName + '_sg.id\n';
    networkingCode += '  source_security_group_id = aws_security_group.' + sourceResourceName + '_sg.id\n';
    networkingCode += '  protocol                 = "tcp"\n';
    networkingCode += '  from_port                = 8080  # Assuming common application port\n';
    networkingCode += '  to_port                  = 8080\n';
    networkingCode += '  description              = "Allow traffic from ' + sourceResourceName + ' to ' + targetResourceName + '"\n';
    networkingCode += '}\n\n';

    // If target is RDS, we might need a different port
    if (targetType === 'aws_db_instance' || targetType === 'rds') {
      networkingCode += 'resource "aws_security_group_rule" "' + targetResourceName + '_from_' + sourceResourceName + '_ingress_db" {\n';
      networkingCode += '  type                     = "ingress"\n';
      networkingCode += '  security_group_id        = aws_security_group.' + targetResourceName + '_sg.id\n';
      networkingCode += '  source_security_group_id = aws_security_group.' + sourceResourceName + '_sg.id\n';
      networkingCode += '  protocol                 = "tcp"\n';
      networkingCode += '  from_port                = 5432  # PostgreSQL default\n';
      networkingCode += '  to_port                  = 5432\n';
      networkingCode += '  description              = "Allow DB traffic from ' + sourceResourceName + '"\n';
      networkingCode += '}\n\n';
    }
  } else if ((sourceType === 'aws_instance' || sourceType === 'ec2') &&
    (targetType === 'aws_db_instance' || targetType === 'rds')) {
    // EC2 to RDS connection
    networkingCode += '# Security Group Rules for connection from ' + sourceResourceName + ' to ' + targetResourceName + '\n';
    networkingCode += 'resource "aws_security_group_rule" "' + targetResourceName + '_from_' + sourceResourceName + '_ingress" {\n';
    networkingCode += '  type                     = "ingress"\n';
    networkingCode += '  security_group_id        = aws_security_group.' + targetResourceName + '_sg.id\n';
    networkingCode += '  source_security_group_id = aws_security_group.' + sourceResourceName + '_sg.id\n';
    networkingCode += '  protocol                 = "tcp"\n';
    networkingCode += '  from_port                = 5432  # PostgreSQL default\n';
    networkingCode += '  to_port                  = 5432\n';
    networkingCode += '  description              = "Allow DB traffic from ' + sourceResourceName + '"\n';
    networkingCode += '}\n\n';
  } else if ((sourceType === 'aws_lb' || sourceType === 'load_balancer') &&
    (targetType === 'aws_instance' || targetType === 'ec2')) {
    // Load Balancer to EC2 connection
    networkingCode += '# Security Group Rules for connection from load balancer to ' + targetResourceName + '\n';
    networkingCode += 'resource "aws_security_group_rule" "' + targetResourceName + '_from_lb_ingress" {\n';
    networkingCode += '  type                     = "ingress"\n';
    networkingCode += '  security_group_id        = aws_security_group.' + targetResourceName + '_sg.id\n';
    networkingCode += '  source_security_group_id = aws_lb.this.security_group_id\n';
    networkingCode += '  protocol                 = "tcp"\n';
    networkingCode += '  from_port                = 80\n';
    networkingCode += '  to_port                  = 80\n';
    networkingCode += '  description              = "Allow HTTP traffic from load balancer"\n';
    networkingCode += '}\n\n';
  } else {
    // Generic connection - add comment for manual review
    networkingCode += '# Connection from ' + sourceResourceName + ' to ' + targetResourceName + ' - Manual configuration may be needed\n';
    networkingCode += '# Connection type: ' + sourceType + ' -> ' + targetType + '\n\n';
  }

  return networkingCode;
};

/**
 * Simulates calling an LLM for more advanced Terraform generation
 * In a real implementation, this would call an actual LLM API
 */
export const generateTerraformWithLLM = async (
  nodes: Node[],
  llmEndpoint?: string,
  llmApiKey?: string
): Promise<string> => {
  // In a real implementation, this would:
  // 1. Convert nodes to a structured format
  // 2. Call an LLM API with the structured data and context
  // 3. Process the LLM response to generate Terraform

  // For now, we'll use the RAG approach as the foundation
  // but in a real implementation, this would be replaced with actual LLM call
  return await generateTerraformWithRag(nodes);
};

/**
 * Gets relevant examples from the knowledge base for a given resource type
 */
export const getTerraformExamples = (resourceType: string): string[] => {
  const matchedType = findBestMatch(resourceType);
  if (matchedType && knowledgeBase[matchedType]) {
    return knowledgeBase[matchedType].examples;
  }
  return [];
};

/**
 * Gets best practices for a given resource type
 */
export const getBestPractices = (resourceType: string): string[] => {
  const matchedType = findBestMatch(resourceType);
  if (matchedType && knowledgeBase[matchedType]) {
    return knowledgeBase[matchedType].bestPractices;
  }
  return [];
};