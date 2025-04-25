import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AwsMetricsChart from "@/components/charts/AwsMetricsChart";
import ResourceCard from "@/components/aws/ResourceCard";

// Mock data for resources - in a real app this would come from an API
const resources = [
  {
    id: "order-processing",
    title: "order-processing",
    resourceType: "Lambda",
    resourceId: "lambda-1",
    status: "healthy" as const,
    metrics: {
      invocations: 15,
      invocationsChange: 12,
      errors: 5,
      errorsChange: -5,
    },
  },
  {
    id: "payment-service",
    title: "payment-service",
    resourceType: "Lambda",
    resourceId: "lambda-2",
    status: "healthy" as const,
    metrics: {
      invocations: 23,
      invocationsChange: 8,
      errors: 2,
      errorsChange: -15,
    },
  },
  {
    id: "inventory-queue",
    title: "inventory-queue",
    resourceType: "SQS",
    resourceId: "sqs-1",
    status: "healthy" as const,
    metrics: {
      invocations: 47,
      invocationsChange: 5,
      errors: 0,
      errorsChange: 0,
    },
  },
  {
    id: "user-api",
    title: "user-api",
    resourceType: "API GW",
    resourceId: "api-1",
    status: "warning" as const,
    metrics: {
      invocations: 108,
      invocationsChange: 22,
      errors: 12,
      errorsChange: 15,
    },
  },
  {
    id: "products-table",
    title: "products-table",
    resourceType: "DynamoDB",
    resourceId: "ddb-1",
    status: "healthy" as const,
    metrics: {
      invocations: 87,
      invocationsChange: 3,
      errors: 1,
      errorsChange: -10,
    },
  },
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const activeService = searchParams.get("service") || "all";
  
  // Filter resources based on active service
  const filteredResources = activeService === "all"
    ? resources
    : resources.filter(r => r.resourceType.toLowerCase().includes(activeService.toLowerCase()));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Lambda Functions Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your AWS resources in real-time
        </p>
      </div>
      
      <Tabs defaultValue={activeService} className="w-full">
        <TabsList className="mb-6 w-full justify-start bg-card">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="lambda">Lambda</TabsTrigger>
          <TabsTrigger value="sqs">SQS</TabsTrigger>
          <TabsTrigger value="api">API GW</TabsTrigger>
          <TabsTrigger value="dynamodb">DynamoDB</TabsTrigger>
          <TabsTrigger value="cloudwatch">CloudWatch</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeService} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                resourceType={resource.resourceType}
                resourceId={resource.resourceId}
                status={resource.status}
                metrics={resource.metrics}
              />
            ))}
          </div>
          
          {filteredResources.length > 0 && (
            <div className="mt-8">
              <AwsMetricsChart 
                title="Resource Metrics (Last 7 Days)"
                resourceType={filteredResources[0].resourceType.toLowerCase() as any}
                resourceName={filteredResources.length === 1 ? filteredResources[0].title : "All Resources"}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}