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
  const statusColor = {
    healthy: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  };

  const trendColor = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-slate-500",
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
            <Badge variant={status === 'healthy' ? 'outline' : 'secondary'}>
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