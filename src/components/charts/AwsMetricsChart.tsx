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
  
  // Get CSS variables for chart colors that match the current theme
  const getChartColors = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    return {
      invocations: rootStyles.getPropertyValue('--color-chart-1').trim() || '#488fdf',
      errors: rootStyles.getPropertyValue('--color-chart-2').trim() || '#ef4444',
      throttles: rootStyles.getPropertyValue('--color-chart-3').trim() || '#f59e0b',
      gridLines: rootStyles.getPropertyValue('--color-border').trim() || 'rgba(100, 100, 100, 0.2)',
      text: rootStyles.getPropertyValue('--color-muted-foreground').trim() || '#64748b'
    };
  };

  const chartColors = getChartColors();

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
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridLines} />
          <XAxis
            dataKey="date"
            tick={{ fill: chartColors.text }}
            stroke={chartColors.text}
          />
          <YAxis
            tick={{ fill: chartColors.text }}
            stroke={chartColors.text}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-card p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-foreground">
                          {label}
                        </span>
                      </div>
                      {payload.map((item: any, index: number) => (
                        <div key={index} className="flex flex-col">
                          <span
                            className="text-[0.70rem] uppercase"
                            style={{ color: item.color }}
                          >
                            {item.name}
                          </span>
                          <span className="font-bold text-foreground">{item.value}</span>
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
            stroke={chartColors.invocations}
            activeDot={{ r: 6, fill: chartColors.invocations }}
            name="Invocations"
          />
          <Line
            type="monotone"
            dataKey="errors"
            strokeWidth={2}
            stroke={chartColors.errors}
            activeDot={{ r: 6, fill: chartColors.errors }}
            name="Errors"
          />
          <Area
            type="monotone"
            dataKey="throttles"
            fill={chartColors.throttles}
            stroke={chartColors.throttles}
            fillOpacity={0.2}
            strokeWidth={2}
            name="Throttles"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}