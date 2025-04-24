import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// This would come from AWS CloudWatch metrics
const generateMockData = (days = 7) => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    
    data.push({
      date: date.toISOString().split('T')[0],
      invocations: Math.floor(Math.random() * 100) + 50,
      errors: Math.floor(Math.random() * 10),
      throttles: Math.floor(Math.random() * 5),
    });
  }
  return data;
};

const data = generateMockData();

type AwsMetricsChartProps = {
  title?: string;
  resourceType?: 'lambda' | 'sqs' | 'apigateway' | 'dynamodb';
  resourceName?: string;
};

export default function AwsMetricsChart({ 
  title = "Lambda Function Metrics",
  resourceType = "lambda",
  resourceName = "example-function" 
}: AwsMetricsChartProps) {
  return (
    <div className="w-full h-[350px]">
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      {resourceName && (
        <p className="text-sm text-muted-foreground mb-4">
          {resourceType}: {resourceName}
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
            tick={{ fill: 'currentColor' }}
            axisLine={{ stroke: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fill: 'currentColor' }}
            axisLine={{ stroke: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {label}
                        </span>
                      </div>
                      {payload.map((item: any, index: number) => (
                        <div key={index} className="flex flex-col">
                          <span
                            className="text-[0.70rem] uppercase text-muted-foreground"
                            style={{ color: item.color }}
                          >
                            {item.name}
                          </span>
                          <span className="font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="invocations"
            strokeWidth={2}
            stroke="#3b82f6"
            activeDot={{ r: 6 }}
            name="Invocations"
          />
          <Line
            type="monotone"
            dataKey="errors"
            strokeWidth={2}
            stroke="#ef4444"
            activeDot={{ r: 6 }}
            name="Errors"
          />
          <Area
            type="monotone"
            dataKey="throttles"
            fill="#f59e0b"
            stroke="#f59e0b"
            fillOpacity={0.2}
            strokeWidth={2}
            name="Throttles"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}