import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";

// Define types for our cost data
interface CostDataRecord {
  name: string;
  total: number;
  Lambda: number;
  "API Gateway": number;
  S3: number;
  DynamoDB: number;
  CloudWatch: number;
  SQS: number;
  [key: string]: number | string; // Index signature for any other properties
}

interface CostData {
  monthlyData: CostDataRecord[];
  dailyData: CostDataRecord[];
}

// Generate mock cost data
const generateMockCostData = (): CostData => {
  // Monthly cost data for the past 12 months
  const monthlyData: CostDataRecord[] = [];
  const now = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Services to track
  const services = ["Lambda", "API Gateway", "S3", "DynamoDB", "CloudWatch", "SQS"];
  
  // Generate data for each month
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now);
    month.setMonth(now.getMonth() - i);
    
    // Base monthly cost (slightly increasing trend)
    const baseCost = 800 + (i * 50);
    
    // Service breakdown with some randomization
    const serviceData: Record<string, number> = {};
    let totalCost = 0;
    
    services.forEach((service) => {
      // Each service gets a portion of the base cost
      let serviceCost = 0;
      
      switch (service) {
        case "Lambda":
          serviceCost = baseCost * (0.25 + Math.random() * 0.1);
          break;
        case "API Gateway":
          serviceCost = baseCost * (0.2 + Math.random() * 0.05);
          break;
        case "S3":
          serviceCost = baseCost * (0.15 + Math.random() * 0.07);
          break;
        case "DynamoDB":
          serviceCost = baseCost * (0.18 + Math.random() * 0.08);
          break;
        case "CloudWatch":
          serviceCost = baseCost * (0.1 + Math.random() * 0.03);
          break;
        case "SQS":
          serviceCost = baseCost * (0.05 + Math.random() * 0.02);
          break;
      }
      
      // Round to 2 decimal places
      serviceCost = Math.round(serviceCost * 100) / 100;
      serviceData[service] = serviceCost;
      totalCost += serviceCost;
    });
    
    // Add some seasonal fluctuation
    const seasonalFactor = i % 3 === 0 ? 1.1 : 1;
    totalCost *= seasonalFactor;
    totalCost = Math.round(totalCost * 100) / 100;
    
    monthlyData.push({
      name: months[month.getMonth()],
      total: totalCost,
      Lambda: serviceData["Lambda"],
      "API Gateway": serviceData["API Gateway"],
      S3: serviceData["S3"],
      DynamoDB: serviceData["DynamoDB"],
      CloudWatch: serviceData["CloudWatch"],
      SQS: serviceData["SQS"]
    });
  }
  
  // Generate daily data for current month (last 30 days)
  const dailyData: CostDataRecord[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    
    // Daily fluctuations around the current monthly average
    const currentMonthAvg = monthlyData[monthlyData.length - 1].total / 30;
    const dayFactor = 0.7 + Math.random() * 0.6; // 70-130% of average
    let dayCost = currentMonthAvg * dayFactor;
    
    // Weekends typically have lower costs
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    if (isWeekend) {
      dayCost *= 0.7;
    }
    
    dayCost = Math.round(dayCost * 100) / 100;
    
    // Service breakdown
    const serviceData: Record<string, number> = {};
    services.forEach((service) => {
      // Each service gets a portion of the daily cost, similar to monthly breakdown
      const portion = monthlyData[monthlyData.length - 1][service as keyof CostDataRecord] as number / monthlyData[monthlyData.length - 1].total;
      serviceData[service] = Math.round(dayCost * portion * 100) / 100;
    });
    
    dailyData.push({
      name: day.getDate().toString(),
      total: dayCost,
      Lambda: serviceData["Lambda"],
      "API Gateway": serviceData["API Gateway"],
      S3: serviceData["S3"],
      DynamoDB: serviceData["DynamoDB"],
      CloudWatch: serviceData["CloudWatch"],
      SQS: serviceData["SQS"]
    });
  }
  
  return { monthlyData, dailyData };
};

export default function CostAnalysisSlide() {
  const [costData] = useState<CostData>(() => generateMockCostData());
  const [timeRange, setTimeRange] = useState<"daily" | "monthly">("monthly");
  
  // Get current month total and comparison with previous month
  const currentMonthTotal = costData.monthlyData[costData.monthlyData.length - 1].total;
  const previousMonthTotal = costData.monthlyData[costData.monthlyData.length - 2].total;
  const percentChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Get colors from theme
  const getChartColors = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    return {
      lambda: rootStyles.getPropertyValue('--color-chart-1').trim() || '#488fdf',
      apiGateway: rootStyles.getPropertyValue('--color-chart-2').trim() || '#10b981',
      s3: rootStyles.getPropertyValue('--color-chart-3').trim() || '#6366f1',
      dynamodb: rootStyles.getPropertyValue('--color-chart-4').trim() || '#f59e0b',
      cloudwatch: rootStyles.getPropertyValue('--color-chart-5').trim() || '#ef4444',
      sqs: rootStyles.getPropertyValue('--color-chart-1').trim() || '#488fdf',
      gridLines: rootStyles.getPropertyValue('--color-border').trim() || 'rgba(100, 100, 100, 0.2)',
      text: rootStyles.getPropertyValue('--color-muted-foreground').trim() || '#64748b'
    };
  };
  
  const chartColors = getChartColors();
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-semibold">AWS Cost Analysis</h2>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-1 text-primary" />
            <div>
              <div className="text-lg font-semibold">{formatCurrency(currentMonthTotal)}</div>
              <div className="flex items-center text-xs">
                {percentChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                )}
                <span className={percentChange >= 0 ? "text-red-500" : "text-green-500"}>
                  {percentChange >= 0 ? "+" : ""}
                  {percentChange.toFixed(1)}% from last month
                </span>
              </div>
            </div>
          </div>
          
          <Tabs 
            value={timeRange} 
            onValueChange={(value) => setTimeRange(value as "daily" | "monthly")}
            className="ml-auto"
          >
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3">Daily</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="md:col-span-2">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-medium">
              {timeRange === "monthly" ? "Monthly Cost Trend" : "Daily Cost Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeRange === "monthly" ? costData.monthlyData : costData.dailyData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridLines} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: chartColors.text, fontSize: 10 }}
                    stroke={chartColors.gridLines}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: chartColors.text, fontSize: 10 }}
                    stroke={chartColors.gridLines}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Cost"]} 
                    labelFormatter={(label) => 
                      timeRange === "monthly" ? `${label}` : `Day ${label}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Cost"
                    stroke={chartColors.lambda}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-medium">Service Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[timeRange === "monthly" ? 
                    costData.monthlyData[costData.monthlyData.length - 1] : 
                    {
                      name: "Current",
                      total: costData.dailyData.reduce((sum, day) => sum + day.total, 0),
                      Lambda: costData.dailyData.reduce((sum, day) => sum + day.Lambda, 0),
                      "API Gateway": costData.dailyData.reduce((sum, day) => sum + day["API Gateway"], 0),
                      S3: costData.dailyData.reduce((sum, day) => sum + day.S3, 0),
                      DynamoDB: costData.dailyData.reduce((sum, day) => sum + day.DynamoDB, 0),
                      CloudWatch: costData.dailyData.reduce((sum, day) => sum + day.CloudWatch, 0),
                      SQS: costData.dailyData.reduce((sum, day) => sum + day.SQS, 0)
                    }
                  ]}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridLines} />
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: chartColors.text, fontSize: 10 }}
                    stroke={chartColors.gridLines}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    hide 
                    tick={{ fill: chartColors.text, fontSize: 10 }}
                    stroke={chartColors.gridLines}
                  />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                  <Legend 
                    verticalAlign="bottom" 
                    formatter={(value) => <span style={{ fontSize: '10px' }}>{value}</span>}
                  />
                  <Bar dataKey="Lambda" fill={chartColors.lambda} name="Lambda" />
                  <Bar dataKey="API Gateway" fill={chartColors.apiGateway} name="API Gateway" />
                  <Bar dataKey="S3" fill={chartColors.s3} name="S3" />
                  <Bar dataKey="DynamoDB" fill={chartColors.dynamodb} name="DynamoDB" />
                  <Bar dataKey="CloudWatch" fill={chartColors.cloudwatch} name="CloudWatch" />
                  <Bar dataKey="SQS" fill={chartColors.sqs} name="SQS" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-medium">Cost Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs text-white font-bold">!</span>
              </div>
              <div>
                <p className="font-medium">Lambda functions over-provisioned</p>
                <p className="text-muted-foreground text-xs">
                  Several Lambda functions have memory allocations much higher than their actual usage.
                  Consider reducing allocated memory to save costs.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs text-white font-bold">$</span>
              </div>
              <div>
                <p className="font-medium">Reserved instance opportunities</p>
                <p className="text-muted-foreground text-xs">
                  Your consistent DynamoDB usage pattern suggests Reserved Capacity would reduce costs by an estimated 27%.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs text-white font-bold">i</span>
              </div>
              <div>
                <p className="font-medium">CloudWatch logging costs rising</p>
                <p className="text-muted-foreground text-xs">
                  CloudWatch costs increased by 18% since last month. Review log retention policies and
                  debug logging levels.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}