import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  CostAnalysis,
  LambdaStatusTable,
  //ResourceUsageChart,
  //HealthMonitor,
} from "@/components/charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <CostAnalysis />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <LambdaStatusTable />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Card className="bg-card/60 border border-primary/10 hover:border-primary/20 transition-colors">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>View all your AWS resources</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Get a real-time overview of all your monitored AWS services in one
            place.
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border border-primary/10 hover:border-primary/20 transition-colors">
        <CardHeader>
          <CardTitle>Add Resources</CardTitle>
          <CardDescription>Configure new AWS resources</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Set up monitoring for new AWS resources with our simple
            configuration wizard.
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link to="/settings">Add Resources</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border border-primary/10 hover:border-primary/20 transition-colors">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Adjust notification settings, appearance, and AWS credentials.
          </p>
          <Button variant="ghost" asChild className="w-full">
            <Link to="/settings">Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
