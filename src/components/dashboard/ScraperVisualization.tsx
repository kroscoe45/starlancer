// src/components/dashboard/ScraperVisualization.tsx
import { useCallback, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useUnifiedDataStore } from "@/hooks/useUnifiedDataStore";
import { useAWSConfig } from "@/hooks/useAWSConfig";
import { AWSConfigDialog } from "./AWSConfigDialog";
import { UnifiedWebsiteData } from "@/lib/mockDataGenerator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Database, TestTube, RefreshCw, Info } from "lucide-react";

// Types for scraper data
interface ScrapedPage {
  url: string;
  status: "pending" | "scraping" | "completed" | "failed";
  title?: string;
  isHomepage: boolean;
  discoveredAt: Date;
  completedAt?: Date;
  websiteId: string;
  linksTo: string[];
}

interface WebsiteSession {
  id: string;
  domain: string;
  homepageUrl: string;
  startTime: Date;
  status: "active" | "completed" | "paused";
  pages: Map<string, ScrapedPage>;
  artistName?: string;
  artMediums?: string[];
  artThemes?: string[];
  source: "aws" | "mock";
}

// Types for force graph data
interface GraphNode {
  id: string;
  name: string;
  status: string;
  isHomepage: boolean;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function ScraperVisualization() {
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const fgRef = useRef<any>(null);

  // Use unified data store
  const { websites, loading, error, loadAWSData, refreshData } =
    useUnifiedDataStore();

  // Use AWS config for configuration dialog
  const { isConfigured, error: configError, configure } = useAWSConfig();

  // Transform unified data to internal format
  const transformToWebsiteSessions = useCallback(
    (unifiedData: UnifiedWebsiteData[]): Map<string, WebsiteSession> => {
      const websiteMap = new Map<string, WebsiteSession>();

      unifiedData.forEach((websiteData) => {
        const domain = websiteData.website_domain;
        const sitemap = websiteData.sitemap || {};
        const lastUpdated = new Date(websiteData.last_updated * 1000);

        // Create pages map from sitemap
        const pagesMap = new Map<string, ScrapedPage>();

        // Determine homepage (shortest path or contains domain root)
        const urls = Object.keys(sitemap);
        const homepage =
          urls.find((url) => {
            try {
              const path = new URL(url).pathname;
              return path === "/" || path === "";
            } catch {
              return false;
            }
          }) || urls[0]; // fallback to first URL

        // Create ScrapedPage objects from sitemap
        Object.entries(sitemap).forEach(([url, linkedUrls]) => {
          const isHomepage = url === homepage;
          let title = "Page";

          try {
            const urlObj = new URL(url);
            title =
              urlObj.pathname === "/"
                ? "Homepage"
                : urlObj.pathname
                    .split("/")
                    .filter((p) => p)
                    .pop() || "Page";
          } catch {
            title = "Page";
          }

          pagesMap.set(url, {
            url,
            status: "completed", // All stored data is completed
            title,
            isHomepage,
            discoveredAt: lastUpdated,
            completedAt: lastUpdated,
            websiteId: domain,
            linksTo: Array.isArray(linkedUrls) ? linkedUrls : [],
          });
        });

        // Create WebsiteSession
        const websiteSession: WebsiteSession = {
          id: domain,
          domain,
          homepageUrl: homepage || `https://${domain}`,
          startTime: lastUpdated,
          status: "completed",
          pages: pagesMap,
          artistName: websiteData.artist_name,
          artMediums: websiteData.art_mediums,
          artThemes: websiteData.art_themes,
          source: websiteData.source,
        };

        websiteMap.set(domain, websiteSession);
      });

      return websiteMap;
    },
    [],
  );

  // Convert unified data to website sessions
  const websiteSessions = transformToWebsiteSessions(websites);

  // Auto-select first website when data changes
  useState(() => {
    if (websiteSessions.size > 0 && !selectedWebsite) {
      const firstWebsite = websiteSessions.keys().next().value;
      if (firstWebsite) {
        setSelectedWebsite(firstWebsite);
      }
    } else if (websiteSessions.size === 0) {
      setSelectedWebsite(null);
    }
  });

  // Get current website data for visualization
  const currentWebsite = selectedWebsite
    ? websiteSessions.get(selectedWebsite)
    : null;

  // Status-based colors (professional palette)
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "pending":
        return "#94a3b8"; // Cool gray
      case "scraping":
        return "#3b82f6"; // Blue
      case "completed":
        return "#10b981"; // Emerald green
      case "failed":
        return "#ef4444"; // Red
      default:
        return "#6b7280";
    }
  }, []);

  // Convert website pages to force graph data
  const getGraphData = useCallback(
    (website: WebsiteSession): GraphData => {
      const pages = Array.from(website.pages.values());

      const nodes: GraphNode[] = pages.map((page) => ({
        id: page.url,
        name: page.title || new URL(page.url).pathname,
        status: page.status,
        isHomepage: page.isHomepage,
        val: page.isHomepage ? 15 : 8,
        color: getStatusColor(page.status),
      }));

      const links: GraphLink[] = pages.flatMap((page) =>
        page.linksTo
          .filter((linkedUrl) => website.pages.has(linkedUrl))
          .map((linkedUrl) => ({
            source: page.url,
            target: linkedUrl,
          })),
      );

      return { nodes, links };
    },
    [getStatusColor],
  );

  const graphData = currentWebsite
    ? getGraphData(currentWebsite)
    : { nodes: [], links: [] };

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode | null) => {
    if (!node) return;
    console.log("Clicked node:", node);
  }, []);

  // Get data source info
  const getDataSourceInfo = () => {
    if (websites.length === 0) return { type: "none", count: 0 };

    const awsCount = websites.filter((w) => w.source === "aws").length;
    const mockCount = websites.filter((w) => w.source === "mock").length;

    if (awsCount > 0 && mockCount > 0)
      return { type: "mixed", count: websites.length, awsCount, mockCount };
    if (awsCount > 0) return { type: "aws", count: awsCount };
    if (mockCount > 0) return { type: "mock", count: mockCount };

    return { type: "none", count: 0 };
  };

  const dataSourceInfo = getDataSourceInfo();

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-lg border relative overflow-hidden">
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2">
              <RefreshCw className="h-8 w-8" />
            </div>
            <p>Loading website data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
          <div className="text-white text-center p-4">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <div className="flex gap-2 justify-center">
              {!isConfigured && (
                <AWSConfigDialog
                  isConfigured={isConfigured}
                  error={configError}
                  onConfigure={configure}
                />
              )}
              {isConfigured && (
                <Button onClick={loadAWSData} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry AWS
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {/* AWS Configuration */}
        <AWSConfigDialog
          isConfigured={isConfigured}
          error={configError}
          onConfigure={configure}
        />

        {/* Load AWS Data Button */}
        <Button
          onClick={loadAWSData}
          disabled={loading || !isConfigured}
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70 gap-2"
        >
          <Database className="h-4 w-4" />
          Load AWS Data
        </Button>

        {/* Website Selector */}
        <select
          value={selectedWebsite || ""}
          onChange={(e) => setSelectedWebsite(e.target.value)}
          className="bg-black/50 text-white border border-white/20 rounded px-3 py-1 text-sm backdrop-blur-sm"
          disabled={loading || websiteSessions.size === 0}
        >
          <option value="">Select website...</option>
          {Array.from(websiteSessions.entries()).map(([id, website]) => (
            <option key={id} value={id}>
              {website.domain} {website.source === "mock" ? "(Mock)" : "(AWS)"}
            </option>
          ))}
        </select>

        {/* Refresh Button */}
        <Button
          onClick={refreshData}
          disabled={loading}
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Data Source Info */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 bg-black/50 text-white rounded px-2 py-1 text-sm backdrop-blur-sm">
                {dataSourceInfo.type === "aws" && (
                  <Database className="h-4 w-4" />
                )}
                {dataSourceInfo.type === "mock" && (
                  <TestTube className="h-4 w-4" />
                )}
                {dataSourceInfo.type === "mixed" && (
                  <Info className="h-4 w-4" />
                )}
                {dataSourceInfo.type === "none" && <Info className="h-4 w-4" />}

                <span>
                  {dataSourceInfo.type === "aws" &&
                    `AWS Data (${dataSourceInfo.count})`}
                  {dataSourceInfo.type === "mock" &&
                    `Mock Data (${dataSourceInfo.count})`}
                  {dataSourceInfo.type === "mixed" &&
                    `Mixed (${dataSourceInfo.awsCount} AWS, ${dataSourceInfo.mockCount} Mock)`}
                  {dataSourceInfo.type === "none" && "No Data"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {dataSourceInfo.type === "aws" &&
                  "Data loaded from AWS DynamoDB"}
                {dataSourceInfo.type === "mock" &&
                  "Generated mock data for development"}
                {dataSourceInfo.type === "mixed" && "Mix of AWS and mock data"}
                {dataSourceInfo.type === "none" &&
                  "Load AWS data or generate mock data to begin"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/50 text-white rounded p-3 text-sm backdrop-blur-sm">
        {currentWebsite && (
          <div className="space-y-1">
            <div>Domain: {currentWebsite.domain}</div>
            <div>Pages: {currentWebsite.pages.size}</div>
            <div>Status: {currentWebsite.status}</div>
            {currentWebsite.artistName && (
              <div>Artist: {currentWebsite.artistName}</div>
            )}
            {currentWebsite.artMediums &&
              currentWebsite.artMediums.length > 0 && (
                <div>
                  Mediums: {currentWebsite.artMediums.slice(0, 2).join(", ")}
                  {currentWebsite.artMediums.length > 2 ? "..." : ""}
                </div>
              )}
            <div className="text-xs opacity-75">
              Source: {currentWebsite.source.toUpperCase()}
            </div>
            <div className="text-xs opacity-75">
              Updated: {currentWebsite.startTime.toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 text-white rounded p-3 text-xs backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Scraping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Pending</span>
          </div>
          <div className="text-xs opacity-75 mt-2">
            {dataSourceInfo.count > 0
              ? `${dataSourceInfo.count} website${dataSourceInfo.count !== 1 ? "s" : ""} loaded`
              : "No data loaded"}
          </div>
        </div>
      </div>

      {/* Force Graph */}
      {!loading && !error && websiteSessions.size > 0 && (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={800}
          height={600}
          backgroundColor="#0f172a"
          enablePointerInteraction={true}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          d3VelocityDecay={0.4}
          nodeColor={(node: GraphNode) => node.color}
          nodeVal={(node: GraphNode) => node.val}
          nodeLabel={(node: GraphNode) => node.name}
          linkColor={() => "#ffffff25"}
          linkWidth={2}
          onNodeClick={handleNodeClick}
        />
      )}

      {/* Empty State */}
      {!loading && !error && websiteSessions.size === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white text-center p-4">
            <div className="mb-4">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-white/70 mb-4">
              Load AWS data or generate mock data to visualize website
              structures
            </p>
            <div className="text-xs text-white/50">
              Use the sidebar or controls above to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export for compatibility
export { ScraperVisualization as ObsidianScraperVisualization };
