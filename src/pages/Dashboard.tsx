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
import { Activity, Clock, AlertTriangle, CheckCircle } from "lucide-react";

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

export function Dashboard() {
  return (
    <PageTemplate
      title="Dashboard Overview"
      description="Monitor your AWS scraping processes and system health in real-time"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <QuickStats />

        {/* Scraping Trigger */}
        <ScrapingTrigger />

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
              progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScraperVisualization />
          </CardContent>
        </Card>

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
