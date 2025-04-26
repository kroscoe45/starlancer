import { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  LambdaStatusTable,
  ResourceUsageChart,
  HealthMonitor,
} from "@/components/charts";

const Home = () => {
  // Use state to control initial rendering
  const [mounted, setMounted] = useState(false);

  // Only render the resizable panels after component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a simpler layout until the component is mounted
  if (!mounted) {
    return (
      <div className="space-y-8 w-full p-4">
        <div className="h-64 rounded-lg border bg-card/60 flex items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        {/* added inner padding for the contents of the panel */}
        <ResizablePanel className="p-4">
          <HealthMonitor />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <LambdaStatusTable />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <ResourceUsageChart />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export { Home };
