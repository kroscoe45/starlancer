//import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResourceCardProps {
  title: string;
  resourceType: string;
  resourceId: string;
  status: 'healthy' | 'warning' | 'error';
  metrics: {
    invocations: number;
    invocationsChange: number;
    errors: number;
    errorsChange: number;
  };
}

export default function ResourceCard({
  title,
  resourceType,
  resourceId,
  status,
  metrics
}: ResourceCardProps) {
  
  const statusColors = {
    healthy: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500"
  };
  
  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
  };
  
  const formatChange = (value: number) => {
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value}%`;
  };
  
  return (
    <Card className="overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${statusColors[status]}`} />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs text-muted-foreground mb-4">
          {resourceType} · {resourceId}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-xs">Invocations</div>
            <div className="text-xl font-semibold mt-1">{metrics.invocations}</div>
            <div className={`text-xs ${getChangeColor(metrics.invocationsChange)}`}>
              {formatChange(metrics.invocationsChange)}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-xs">Errors</div>
            <div className="text-xl font-semibold mt-1">{metrics.errors}</div>
            <div className={`text-xs ${getChangeColor(-metrics.errorsChange)}`}>
              {formatChange(metrics.errorsChange)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}