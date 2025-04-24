import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AwsMetricsChart from "@/components/charts/AwsMetricsChart";
import ResourceCard from "@/components/aws/ResourceCard";
import ResourceTable from "@/components/aws/ResourceTable";
import ResourceConfig from "@/components/aws/ResourceConfig";
import { awsService, Resource, ResourceStatus } from "@/lib/aws-service";
import { toast } from "sonner";

// AWS service dashboard configurations
const dashboardData = {
  lambda: {
    title: "Lambda Functions",
    metrics: ["Invocations", "Errors", "Duration", "Throttles"],
    metricNames: ["invocations", "errors", "duration", "throttles"],
  },
  sqs: {
    title: "SQS Queues",
    metrics: ["Messages Available", "Messages In Flight", "Age of Oldest Message"],
    metricNames: ["messagesAvailable", "messagesInFlight", "oldestMessageAge"],
  },
  apigateway: {
    title: "API Gateway",
    metrics: ["Requests", "Latency", "4XX Errors", "5XX Errors"],
    metricNames: ["requests", "latency", "4xxErrors", "5xxErrors"],
  },
  dynamodb: {
    title: "DynamoDB",
    metrics: ["Read Capacity", "Write Capacity", "Throttled Requests", "System Errors"],
    metricNames: ["readCapacity", "writeCapacity", "throttledRequests", "systemErrors"],
  },
  cloudwatch: {
    title: "CloudWatch",
    metrics: ["Alarms", "Logs", "Events", "Metrics"],
    metricNames: ["alarms", "logs", "events", "metrics"],
  },
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceParam = searchParams.get("service") || "lambda";
  const service = dashboardData[serviceParam as keyof typeof dashboardData] || dashboardData.lambda;
  
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Load resources on component mount and when service changes
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const allResources = await awsService.getResources();
        const filteredResources = allResources.filter(
          r => r.type.toLowerCase() === serviceParam.toLowerCase()
        );
        setResources(filteredResources);
        
        // Select the first resource by default
        if (filteredResources.length > 0 && !selectedResource) {
          setSelectedResource(filteredResources[0]);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast.error("Failed to load resources");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [serviceParam]);
  
  // Handle service tab change
  const handleServiceChange = (value: string) => {
    setSearchParams({ service: value });
    setSelectedResource(null);
  };
  
  // Handle resource selection
  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{service.title} Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Tabs value={serviceParam} onValueChange={handleServiceChange} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="lambda">Lambda</TabsTrigger>
              <TabsTrigger value="sqs">SQS</TabsTrigger>
              <TabsTrigger value="apigateway">API GW</TabsTrigger>
              <TabsTrigger value="dynamodb">DynamoDB</TabsTrigger>
              <TabsTrigger value="cloudwatch">CloudWatch</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <ResourceConfig onConfigSave={(config) => {
            toast.success(`Added ${config.name} to monitoring`);
          }}>
            <Button>Add Resource</Button>
          </ResourceConfig>
        </div>
      </div>

      {/* Resource Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              title={resource.name}
              resourceType={resource.type}
              resourceId={resource.id}
              status={resource.status as ResourceStatus}
              metrics={[
                {
                  name: service.metrics[0],
                  value: Math.floor(Math.random() * 100),
                  change: "+12%",
                  trend: "up",
                },
                {
                  name: service.metrics[1],
                  value: Math.floor(Math.random() * 10),
                  change: "-5%",
                  trend: "down",
                },
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No {service.title} Configured</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            You haven't added any {service.title.toLowerCase()} to monitor yet.
          </p>
          <ResourceConfig>
            <Button>Add Your First {service.title.slice(0, -1)}</Button>
          </ResourceConfig>
        </div>
      )}

      {/* Detailed chart and table section */}
      {resources.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Real-time metrics for your {service.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AwsMetricsChart 
                title={service.title}
                resourceType={serviceParam as any}
                resourceName={selectedResource?.name}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource List</CardTitle>
              <CardDescription>
                All monitored {service.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceTable 
                resources={resources}
                onResourceSelect={handleResourceSelect}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}