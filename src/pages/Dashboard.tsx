// src/pages/Dashboard.tsx
import { PageTemplate } from "@/components/layout/PageTemplate";
import { ScraperVisualization } from "@/components/dashboard/ScraperVisualization";
import { ScrapingTrigger } from "@/components/dashboard/ScrapingTrigger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  TestTube,
  Database,
  Zap,
} from "lucide-react";

// Quick stats cards component
function QuickStats() {
  // Mock data - replace with real data
  const stats = {
    activeProcesses: 3,
    completedToday: 1247,
    failedToday: 12,
    avgProcessTime: "2.3s",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Processes
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProcesses}</div>
          <p className="text-xs text-muted-foreground">Currently scraping</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedToday}</div>
          <p className="text-xs text-muted-foreground">+12% from yesterday</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.failedToday}</div>
          <p className="text-xs text-muted-foreground">-3% from yesterday</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Process Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgProcessTime}</div>
          <p className="text-xs text-muted-foreground">-0.5s from last hour</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Development tools info section
function DevelopmentInfo() {
  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Development Mode Active
          <Badge variant="secondary">Dev Tools</Badge>
        </CardTitle>
        <CardDescription>
          Mock data generator is available in the sidebar under "Development" to
          help with frontend development and testing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Mock Data
            </h4>
            <p className="text-xs text-muted-foreground">
              Generate realistic artist website data with 30-70 pages per site.
              Configurable artist profiles and link structures.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Live Simulation
            </h4>
            <p className="text-xs text-muted-foreground">
              Toggle timing simulation to watch pages being discovered and
              scraped in real-time in the visualization.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Unified Data
            </h4>
            <p className="text-xs text-muted-foreground">
              Both mock and AWS data feed into the same visualization. Session
              persistence keeps your generated data available.
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground">
            <strong>How to use:</strong> Expand the "Mock Data" section in the
            sidebar to generate test data. Use "Generate" for instant data or
            "Simulate" to watch the scraping process in real-time. Generated
            data persists in your browser session.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  return (
    <PageTemplate
      title="Dashboard Overview"
      description="Monitor your AWS scraping processes and system health in real-time"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <QuickStats />

        {/* Development Tools Info */}
        <DevelopmentInfo />

        {/* Live Scraper Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Live Scraper Visualization
              <Badge variant="secondary" className="animate-pulse">
                LIVE
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time view of website structure discovery and scraping
              progress. Use the sidebar controls to generate mock data or load
              from AWS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScraperVisualization />
          </CardContent>
        </Card>

        {/* Scraping Trigger */}
        <ScrapingTrigger />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest scraping processes and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Mock recent activity - replace with real data */}
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">example.com scraping</p>
                  <p className="text-sm text-muted-foreground">
                    Started 5 minutes ago
                  </p>
                </div>
                <Badge variant="default">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">store.website.com scraping</p>
                  <p className="text-sm text-muted-foreground">
                    Completed 12 minutes ago
                  </p>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">blog.site.org scraping</p>
                  <p className="text-sm text-muted-foreground">
                    Failed 20 minutes ago
                  </p>
                </div>
                <Badge variant="destructive">Failed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
