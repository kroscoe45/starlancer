import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Using shadcn-ui Progress component
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Shell,
} from "lucide-react";

// Mock service health data for AWS services
const generateMockHealthData = () => {
  const services = [
    {
      id: "lambda",
      name: "Lambda",
      health:
        Math.random() > 0.8
          ? "degraded"
          : Math.random() > 0.9
            ? "outage"
            : "operational",
      uptime:
        Math.random() > 0.8
          ? 97 + Math.random() * 2
          : 99 + Math.random() * 0.999,
      incidents: Math.floor(Math.random() * 3),
      latency:
        Math.random() > 0.7
          ? 110 + Math.random() * 100
          : 50 + Math.random() * 60,
      throughput: 1000 + Math.floor(Math.random() * 500),
      regions: [
        {
          name: "us-east-1",
          status: Math.random() > 0.9 ? "degraded" : "operational",
        },
        {
          name: "us-west-2",
          status: Math.random() > 0.95 ? "degraded" : "operational",
        },
        { name: "eu-west-1", status: "operational" },
        {
          name: "ap-southeast-1",
          status: Math.random() > 0.95 ? "outage" : "operational",
        },
      ],
    },
    {
      id: "apigateway",
      name: "API Gateway",
      health: Math.random() > 0.9 ? "degraded" : "operational",
      uptime:
        Math.random() > 0.9
          ? 98 + Math.random() * 1
          : 99.5 + Math.random() * 0.499,
      incidents: Math.floor(Math.random() * 2),
      latency:
        Math.random() > 0.8
          ? 150 + Math.random() * 150
          : 70 + Math.random() * 80,
      throughput: 2000 + Math.floor(Math.random() * 1000),
      regions: [
        { name: "us-east-1", status: "operational" },
        {
          name: "us-west-2",
          status: Math.random() > 0.9 ? "degraded" : "operational",
        },
        { name: "eu-west-1", status: "operational" },
        { name: "ap-southeast-1", status: "operational" },
      ],
    },
    {
      id: "dynamodb",
      name: "DynamoDB",
      health: Math.random() > 0.95 ? "degraded" : "operational",
      uptime:
        Math.random() > 0.95
          ? 99 + Math.random() * 0.5
          : 99.8 + Math.random() * 0.199,
      incidents: Math.random() > 0.8 ? 1 : 0,
      latency:
        Math.random() > 0.9 ? 25 + Math.random() * 15 : 10 + Math.random() * 15,
      throughput: 5000 + Math.floor(Math.random() * 2000),
      regions: [
        { name: "us-east-1", status: "operational" },
        { name: "us-west-2", status: "operational" },
        { name: "eu-west-1", status: "operational" },
        {
          name: "ap-southeast-1",
          status: Math.random() > 0.9 ? "degraded" : "operational",
        },
      ],
    },
    {
      id: "sqs",
      name: "SQS",
      health: "operational",
      uptime: 99.95 + Math.random() * 0.049,
      incidents: 0,
      latency: 5 + Math.random() * 10,
      throughput: 8000 + Math.floor(Math.random() * 3000),
      regions: [
        { name: "us-east-1", status: "operational" },
        { name: "us-west-2", status: "operational" },
        { name: "eu-west-1", status: "operational" },
        { name: "ap-southeast-1", status: "operational" },
      ],
    },
    {
      id: "cloudwatch",
      name: "CloudWatch",
      health: Math.random() > 0.9 ? "degraded" : "operational",
      uptime: 99.5 + Math.random() * 0.499,
      incidents: Math.random() > 0.7 ? 1 : 0,
      latency:
        Math.random() > 0.8 ? 60 + Math.random() * 60 : 30 + Math.random() * 30,
      throughput: 500 + Math.floor(Math.random() * 200),
      regions: [
        {
          name: "us-east-1",
          status: Math.random() > 0.9 ? "degraded" : "operational",
        },
        { name: "us-west-2", status: "operational" },
        { name: "eu-west-1", status: "operational" },
        { name: "ap-southeast-1", status: "operational" },
      ],
    },
    {
      id: "s3",
      name: "S3",
      health: Math.random() > 0.95 ? "degraded" : "operational",
      uptime:
        Math.random() > 0.95
          ? 99.5 + Math.random() * 0.4
          : 99.9 + Math.random() * 0.099,
      incidents: Math.random() > 0.9 ? 1 : 0,
      latency:
        Math.random() > 0.9 ? 80 + Math.random() * 70 : 40 + Math.random() * 40,
      throughput: 3000 + Math.floor(Math.random() * 1500),
      regions: [
        { name: "us-east-1", status: "operational" },
        { name: "us-west-2", status: "operational" },
        {
          name: "eu-west-1",
          status: Math.random() > 0.95 ? "degraded" : "operational",
        },
        { name: "ap-southeast-1", status: "operational" },
      ],
    },
  ];

  // Calculate overall health status
  const overallStatus = {
    operational: services.filter((s) => s.health === "operational").length,
    degraded: services.filter((s) => s.health === "degraded").length,
    outage: services.filter((s) => s.health === "outage").length,
  };

  return { services, overallStatus };
};

export function HealthMonitor() {
  const [healthData, setHealthData] = useState(() => generateMockHealthData());
  const [serviceHealthFilter, setServiceHealthFilter] = useState([
    "operational",
    "degraded",
    "outage",
  ]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update data randomly to simulate real-time changes
      if (Math.random() > 0.7) {
        setHealthData(generateMockHealthData());
        setLastUpdated(new Date());
      }
    }, 15000); // Check for updates every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Get status icon based on health status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "outage":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shell className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Get status badge variant based on health status
  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "operational":
        return "default";
      case "degraded":
        return "secondary";
      case "outage":
        return "destructive";
      default:
        return "default";
    }
  };

  // Format the timestamp
  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Handle toggle changes
  const handleServiceHealthFilter = (value: string[]) => {
    setServiceHealthFilter(value);
  };

  return (
    <div className="space-y-4">
      <ToggleGroup
        size={"sm"}
        type="multiple"
        variant="outline"
        value={serviceHealthFilter}
        onValueChange={handleServiceHealthFilter}
      >
        <ToggleGroupItem value="degraded">Degraded</ToggleGroupItem>
        <ToggleGroupItem value="operational">Operational</ToggleGroupItem>
        <ToggleGroupItem value="outage">Outage</ToggleGroupItem>
      </ToggleGroup>
      <div className="flex flex-col md:flex-row justify-center md:items-center mb-2">
        <h2 className="text-xl font-semibold">Service Health Status</h2>
        <div className="flex items-center text-xs text-muted-foreground mt-1 md:mt-0">
          <Clock className="h-3 w-3 mr-1" />
          <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
        </div>
      </div>

      {/* Overall health status */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4 flex items-center justify-center flex-col">
            <div className="text-4xl font-bold text-green-500">
              {healthData.overallStatus.operational}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Operational
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 flex items-center justify-center flex-col">
            <div className="text-4xl font-bold text-amber-500">
              {healthData.overallStatus.degraded}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Degraded
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 flex items-center justify-center flex-col">
            <div className="text-4xl font-bold text-red-500">
              {healthData.overallStatus.outage}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Outage
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service status table */}
      <Card className="overflow-hidden">
        <div className="rounded-none border-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/80">
                <th className="text-left font-medium text-xs text-muted-foreground py-3 px-3">
                  Service
                </th>
                <th className="text-left font-medium text-xs text-muted-foreground py-3 px-3">
                  Status
                </th>
                <th className="text-left font-medium text-xs text-muted-foreground py-3 px-3 hidden md:table-cell">
                  Uptime
                </th>
                <th className="text-left font-medium text-xs text-muted-foreground py-3 px-3 hidden lg:table-cell">
                  Latency
                </th>
                <th className="text-left font-medium text-xs text-muted-foreground py-3 px-3 hidden lg:table-cell">
                  Throughput
                </th>
              </tr>
            </thead>
            <tbody>
              {healthData.services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-border/40 hover:bg-muted/30"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      {getStatusIcon(service.health)}
                      <span className="ml-2 font-medium">{service.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={getStatusBadgeVariant(service.health)}>
                      {service.health.charAt(0).toUpperCase() +
                        service.health.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex flex-col space-y-1">
                      <div className="text-xs font-medium">
                        {service.uptime.toFixed(3)}%
                      </div>
                      <Progress
                        value={service.uptime}
                        className={
                          service.uptime >= 99.9
                            ? "bg-green-500/20"
                            : service.uptime >= 99
                              ? "bg-amber-500/20"
                              : "bg-red-500/20"
                        }
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-xs">
                        {service.latency.toFixed(0)} ms
                      </span>
                      {service.latency > 100 && (
                        <ArrowUpRight className="h-3 w-3 ml-1 text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <div className="flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-xs">
                        {service.throughput.toLocaleString()} req/s
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent incidents */}
      {healthData.services.some((s) => s.incidents > 0) && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium">
              Recent Incidents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3 text-sm">
              {healthData.services
                .filter((s) => s.incidents > 0)
                .map((service) => (
                  <div
                    key={`incident-${service.id}`}
                    className="flex items-start space-x-2"
                  >
                    {service.health === "outage" ? (
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">
                        {service.name} -{" "}
                        {service.health === "outage"
                          ? "Service Disruption"
                          : "Performance Degradation"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {service.health === "outage"
                          ? `Service is experiencing an outage in ${
                              service.regions.find((r) => r.status === "outage")
                                ?.name || "some regions"
                            }. Our team is investigating.`
                          : `Performance degradation detected with increased latency (${service.latency.toFixed(0)} ms). 
                          Monitoring and resolving.`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
