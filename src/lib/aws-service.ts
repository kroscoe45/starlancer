// This is a mock AWS service for demonstration purposes
// In a real application, this would use the AWS SDK for JavaScript

import { toast } from "sonner";

// Types
export type ResourceStatus = 'healthy' | 'warning' | 'error';

export interface Resource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: ResourceStatus;
  lastUpdated: string;
}

export interface MetricData {
  timestamp: string;
  value: number;
}

export interface ResourceMetrics {
  resourceId: string;
  metrics: {
    [key: string]: MetricData[];
  };
}

// Mock data
const mockResources: Resource[] = [
  {
    id: 'lambda-1',
    name: 'order-processing',
    type: 'Lambda',
    region: 'us-east-1',
    status: 'healthy',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sqs-1',
    name: 'order-queue',
    type: 'SQS',
    region: 'us-east-1',
    status: 'healthy',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'api-1',
    name: 'checkout-api',
    type: 'API Gateway',
    region: 'us-east-1',
    status: 'warning',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dynamodb-1',
    name: 'users-table',
    type: 'DynamoDB',
    region: 'us-east-1',
    status: 'error',
    lastUpdated: new Date().toISOString(),
  },
];

// Generate mock time-series data
const generateMetricData = (days: number, baseValue: number, variance: number): MetricData[] => {
  const data: MetricData[] = [];
  const now = new Date();
  
  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - (days * 24 - i));
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: baseValue + (Math.random() * variance * 2) - variance,
    });
  }
  
  return data;
};

// AWS service class
export class AwsService {
  private static instance: AwsService;
  private resources: Resource[] = [...mockResources];
  
  private constructor() {
    // Private constructor to enforce singleton
  }
  
  public static getInstance(): AwsService {
    if (!AwsService.instance) {
      AwsService.instance = new AwsService();
    }
    return AwsService.instance;
  }
  
  // Get all resources
  public async getResources(): Promise<Resource[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.resources];
  }
  
  // Get resource by ID
  public async getResource(id: string): Promise<Resource | undefined> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.resources.find(r => r.id === id);
  }
  
  // Get metrics for a resource
  public async getResourceMetrics(resourceId: string, metricNames: string[], period: number = 7): Promise<ResourceMetrics> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const metrics: { [key: string]: MetricData[] } = {};
    
    metricNames.forEach(metricName => {
      // Different base values and variance for different metrics
      let baseValue = 50;
      let variance = 20;
      
      if (metricName === 'errors') {
        baseValue = 5;
        variance = 3;
      } else if (metricName === 'latency') {
        baseValue = 200;
        variance = 50;
      } else if (metricName === 'throttles') {
        baseValue = 2;
        variance = 2;
      }
      
      metrics[metricName] = generateMetricData(period, baseValue, variance);
    });
    
    return {
      resourceId,
      metrics,
    };
  }
  
  // Add a new resource
  public async addResource(resource: Omit<Resource, 'id' | 'lastUpdated' | 'status'>): Promise<Resource> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newResource: Resource = {
      id: `${resource.type.toLowerCase()}-${this.resources.length + 1}`,
      name: resource.name,
      type: resource.type,
      region: resource.region,
      status: 'healthy',
      lastUpdated: new Date().toISOString(),
    };
    
    this.resources.push(newResource);
    toast.success(`Added ${resource.name} to monitoring`);
    
    return newResource;
  }
  
  // Update resource status (for simulation)
  public async updateResourceStatus(id: string, status: ResourceStatus): Promise<Resource | undefined> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const resourceIndex = this.resources.findIndex(r => r.id === id);
    if (resourceIndex === -1) return undefined;
    
    const updatedResource = {
      ...this.resources[resourceIndex],
      status,
      lastUpdated: new Date().toISOString(),
    };
    
    this.resources[resourceIndex] = updatedResource;
    return updatedResource;
  }
  
  // Remove a resource
  public async removeResource(id: string): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const initialLength = this.resources.length;
    this.resources = this.resources.filter(r => r.id !== id);
    
    const removed = initialLength > this.resources.length;
    if (removed) {
      toast.success('Resource removed from monitoring');
    }
    
    return removed;
  }
}

// Export a singleton instance
export const awsService = AwsService.getInstance();