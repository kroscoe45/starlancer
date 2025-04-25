import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ResourceStatus = 'healthy' | 'warning' | 'error';

interface ResourceCardProps {
  title: string;
  resourceType: string;
  resourceId: string;
  status: ResourceStatus;
  metrics: {
    name: string;
    value: string | number;
    change?: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

export default function ResourceCard({
  title,
  resourceType,
  resourceId,
  status,
  metrics,
}: ResourceCardProps) {
  // Status colors using shadcn/ui colors
  const statusColor = {
    healthy: "bg-green-500 text-green-50",
    warning: "bg-amber-500 text-amber-50",
    error: "bg-red-500 text-red-50",
  };

  const statusVariant = {
    healthy: "outline",
    warning: "secondary",
    error: "destructive",
  };

  const trendColor = {
    up: "text-green-500 dark:text-green-400",
    down: "text-red-500 dark:text-red-400",
    stable: "text-muted-foreground",
  };

  const trendArrow = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {resourceType} · {resourceId}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${statusColor[status]}`} />
            <Badge variant={statusVariant[status] as "outline" | "secondary" | "destructive"}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric.name}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold">{metric.value}</p>
                {metric.trend && (
                  <p className={`text-sm ${trendColor[metric.trend]}`}>
                    {trendArrow[metric.trend]} {metric.change}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}