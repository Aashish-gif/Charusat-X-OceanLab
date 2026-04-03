/**
 * AWS Cost Estimator Service
 * Provides cost estimation for AWS resources based on their configuration
 */

export interface ResourceCost {
  monthly: number;
  hourly: number;
  breakdown: Record<string, number>;
}

export interface CostConfig {
  // EC2 instance costs (per hour)
  ec2: Record<string, number>;
  // S3 costs (per GB/month)
  s3: {
    storage: number;
    requests: number;
    dataTransfer: number;
  };
  // RDS costs (per hour)
  rds: Record<string, number>;
  // Lambda costs (per 1M requests)
  lambda: {
    requests: number;
    duration: number; // per GB-second
  };
  // EBS costs (per GB/month)
  ebs: Record<string, number>;
}

// Default cost configuration (based on us-east-1 pricing, approximate values)
const defaultCostConfig: CostConfig = {
  ec2: {
    't2.micro': 0.0116,
    't2.small': 0.023,
    't2.medium': 0.0464,
    't3.micro': 0.0104,
    't3.small': 0.0208,
    't3.medium': 0.0416,
    't3.large': 0.0832,
    'm5.large': 0.096,
    'm5.xlarge': 0.192,
    'c5.large': 0.085,
    'r5.large': 0.126,
  },
  s3: {
    storage: 0.023, // $0.023 per GB per month for standard storage
    requests: 0.0000004, // $0.0000004 per 1000 requests
    dataTransfer: 0.09, // $0.09 per GB for first 10TB
  },
  rds: {
    'db.t3.micro': 0.017,
    'db.t3.small': 0.034,
    'db.t3.medium': 0.068,
    'db.t2.micro': 0.019,
    'db.t2.small': 0.037,
    'db.m5.large': 0.123,
    'db.r5.large': 0.155,
  },
  lambda: {
    requests: 0.20, // $0.20 per 1M requests
    duration: 0.0000166667, // $16.6667 per 1M GB-seconds
  },
  ebs: {
    'gp2': 0.08, // $0.08 per GB per month
    'gp3': 0.08, // $0.08 per GB per month
    'io1': 0.125, // $0.125 per GB per month
    'st1': 0.045, // $0.045 per GB per month
    'sc1': 0.015, // $0.015 per GB per month
  },
};

export const estimateResourceCost = (resourceType: string, config: any): ResourceCost => {
  let hourlyCost = 0;
  let breakdown: Record<string, number> = {};

  switch (resourceType) {
    case 'ec2':
      const instanceType = config.instance_type || 't3.micro';
      const ec2Hourly = defaultCostConfig.ec2[instanceType] || defaultCostConfig.ec2['t3.micro'];
      hourlyCost = ec2Hourly;
      breakdown = { 'Instance': ec2Hourly };
      break;

    case 's3':
      // Base storage cost (1GB as default)
      const storageSize = config.allocated_storage || 1; // in GB
      const storageMonthly = defaultCostConfig.s3.storage * storageSize;
      const storageHourly = storageMonthly / 730; // 730 hours in a month
      
      hourlyCost = storageHourly;
      breakdown = { 'Storage': storageHourly };
      break;

    case 'rds':
      const dbInstanceType = config.instance_class || 'db.t3.micro';
      const rdsHourly = defaultCostConfig.rds[dbInstanceType] || defaultCostConfig.rds['db.t3.micro'];
      hourlyCost = rdsHourly;
      breakdown = { 'Instance': rdsHourly };
      break;

    case 'lambda':
      // Default: 1M requests per month, 128MB memory, 100ms average duration
      const requestsPerMonth = config.monthly_requests || 1000000;
      const memorySize = config.memory_size || 128; // in MB
      const avgDuration = config.avg_duration || 100; // in ms
      
      // Lambda pricing: requests + duration
      const requestCost = (requestsPerMonth / 1000000) * defaultCostConfig.lambda.requests;
      const durationCost = (requestsPerMonth * (memorySize / 1024) * (avgDuration / 1000)) * defaultCostConfig.lambda.duration;
      
      const lambdaMonthly = requestCost + durationCost;
      const lambdaHourly = lambdaMonthly / 730;
      
      hourlyCost = lambdaHourly;
      breakdown = {
        'Requests': (requestCost / 730),
        'Duration': (durationCost / 730)
      };
      break;

    case 'ebs':
      const volumeType = config.volume_type || 'gp2';
      const volumeSize = config.size || 8; // in GB
      const ebsMonthly = (defaultCostConfig.ebs[volumeType] || defaultCostConfig.ebs['gp2']) * volumeSize;
      const ebsHourly = ebsMonthly / 730;
      
      hourlyCost = ebsHourly;
      breakdown = { 'Storage': ebsHourly };
      break;

    default:
      // Default cost for unknown resources
      hourlyCost = 0;
      breakdown = { 'Estimate': 0 };
  }

  const monthlyCost = hourlyCost * 24 * 30.44; // Average hours in a month

  return {
    hourly: parseFloat(hourlyCost.toFixed(6)),
    monthly: parseFloat(monthlyCost.toFixed(2)),
    breakdown
  };
};

export const estimateTotalCost = (resources: Array<{ type: string; config: any }>): ResourceCost => {
  let totalHourly = 0;
  const totalBreakdown: Record<string, number> = {};

  resources.forEach(resource => {
    const cost = estimateResourceCost(resource.type, resource.config);
    totalHourly += cost.hourly;

    // Aggregate breakdown by resource type
    Object.entries(cost.breakdown).forEach(([key, value]) => {
      if (totalBreakdown[key]) {
        totalBreakdown[key] += value;
      } else {
        totalBreakdown[key] = value;
      }
    });
  });

  const totalMonthly = totalHourly * 24 * 30.44;

  return {
    hourly: parseFloat(totalHourly.toFixed(6)),
    monthly: parseFloat(totalMonthly.toFixed(2)),
    breakdown: Object.fromEntries(
      Object.entries(totalBreakdown).map(([key, value]) => [key, parseFloat(value.toFixed(6))])
    )
  };
};

export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(2)}`;
};

export const formatCostWithDetails = (cost: ResourceCost): string => {
  return `${formatCost(cost.monthly)}/mo (${formatCost(cost.hourly)}/hr)`;
};