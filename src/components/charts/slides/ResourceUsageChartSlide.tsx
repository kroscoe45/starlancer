import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Generate mock data with a natural pattern
const generateMockData = (days = 7, type: string) => {
  const data = [];
  const now = new Date();
  
  // Base values for different resource types
  const patterns: Record<string, { base: number, daytime: number, variance: number, trend: number }> = {
    "cpu": { base: 35, daytime: 25, variance: 10, trend: 0.2 },
    "memory": { base: 40, daytime: 15, variance: 8, trend: 0.1 },
    "network": { base: 25, daytime: 35, variance: 15, trend: 0.3 },
    "storage": { base: 60, daytime: 10, variance: 5, trend: 0.05 },
  };
  
  const pattern = patterns[type] || patterns.cpu;
  
  for (let i = 0; i < days * 24; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - (days * 24 - i - 1));
    
    // Hour of day (0-23)
    const hour = date.getHours();
    
    // Create a natural daily pattern (higher during working hours)
    const isDaytime = hour >= 8 && hour <= 18;
    const daytimeValue = isDaytime ? pattern.daytime : 0;
    
    // Day of week factor (lower on weekends)
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
    
    // Slight upward/downward trend over time
    const trendFactor = 1 + (pattern.trend * (i / (days * 24)));
    
    // Random variance
    const randomFactor = (Math.random() * pattern.variance * 2) - pattern.variance;
    
    // Calculate the value with all factors
    const value = Math.min(100, Math.max(0, 
      (pattern.base + daytimeValue) * weekendFactor * trendFactor + randomFactor
    ));
    
    data.push({
      timestamp: date.toISOString(),
      time: `${hour}:00`,
      date: date.toLocaleDateString(),
      value: Math.round(value * 10) / 10, // Round to 1 decimal place
    });
  }
  
  return data;
};

export default function ResourceUsageChartSlide() {
  const [cpuData] = useState(() => generateMockData(3, "cpu"));
  const [memoryData] = useState(() => generateMockData(3, "memory"));
  const [networkData] = useState(() => generateMockData(3, "network"));
  
  // Get CSS variables for chart colors
  const getChartColors = (type: string) => {
    const rootStyles = getComputedStyle(document.documentElement);
    const colorIndex = type === 'cpu' ? '1' : type === 'memory' ? '2' : '3';
    return {
      line: rootStyles.getPropertyValue(`--color-chart-${colorIndex}`).trim() || '#488fdf',
      fill: rootStyles.getPropertyValue(`--color-chart-${colorIndex}`).trim() || '#488fdf',
      gridLines: rootStyles.getPropertyValue('--color-border').trim() || 'rgba(100, 100, 100, 0.2)',
      text: rootStyles.getPropertyValue('--color-muted-foreground').trim() || '#64748b'
    };
  };

  const chartHeight = 180;
  
  const renderChart = (data: any[], title: string, type: string) => {
    const chartColors = getChartColors(type);
    // Show every 4 hours for cleaner chart
    const formattedData = data.filter((_, index) => index % 4 === 0);
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pl-2">
          <div style={{ height: chartHeight }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartColors.gridLines}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: chartColors.text, fontSize: 10 }}
                  tickLine={{ stroke: chartColors.gridLines }}
                  tickMargin={5}
                  minTickGap={20}
                  stroke={chartColors.gridLines}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: chartColors.text, fontSize: 10 }}
                  tickLine={{ stroke: chartColors.gridLines }}
                  tickMargin={5}
                  domain={[0, 100]}
                  stroke={chartColors.gridLines}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-card p-2 shadow-sm text-xs">
                          <div className="font-medium">{payload[0].payload.date} {label}</div>
                          <div className="text-muted-foreground mt-1">
                            {title}: {payload[0].value}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColors.line}
                  fill={chartColors.fill}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resource Usage</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderChart(cpuData, "CPU Usage", "cpu")}
        {renderChart(memoryData, "Memory Usage", "memory")}
        {renderChart(networkData, "Network Traffic", "network")}
      </div>
    </div>
  );
}