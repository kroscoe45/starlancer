// src/components/dashboard/ScraperVisualization.tsx
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
  LinkObject,
} from "react-force-graph-2d";
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
import {
  logClick,
  logDataOperation,
  logVisualizationInteraction,
  dashboardLogger,
} from "@/lib/logger";

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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>>(undefined);

  // Use unified data store
  const { websites, loading, error, loadAWSData, refreshData } =
    useUnifiedDataStore();

  // Use AWS config for configuration dialog
  const { isConfigured } = useAWSConfig();

  // Log component mount
  useEffect(() => {
    logVisualizationInteraction("ScraperVisualization", "component_mounted", {
      hasAWSConfig: isConfigured,
      websiteCount: websites.length,
    });
  }, [isConfigured, websites.length]);

  // Set initial dimensions
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }, []);

  // Handle container resize
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };

        // Only update if dimensions actually changed significantly (avoid sub-pixel changes)
        setDimensions((currentDims) => {
          const widthDiff = Math.abs(newDimensions.width - currentDims.width);
          const heightDiff = Math.abs(
            newDimensions.height - currentDims.height,
          );

          if (widthDiff > 1 || heightDiff > 1) {
            // Debounce logging to avoid spam
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              logVisualizationInteraction(
                "ScraperVisualization",
                "canvas_resized",
                {
                  oldDimensions: currentDims,
                  newDimensions,
                  triggerType: "resize_observer",
                  widthDiff,
                  heightDiff,
                },
              );
            }, 100);

            return newDimensions;
          }
          return currentDims;
        });
      }
    };

    // Add resize observer for responsive updates
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback resize listener
    const debouncedWindowResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 50);
    };
    window.addEventListener("resize", debouncedWindowResize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", debouncedWindowResize);
    };
  }, []); // No dependencies to prevent infinite loop

  // Transform unified data to internal format (with memoization to prevent unnecessary recalculations)
  const transformToWebsiteSessions = useCallback(
    (unifiedData: UnifiedWebsiteData[]): Map<string, WebsiteSession> => {
      // Skip transformation if data hasn't changed
      if (unifiedData.length === 0) {
        return new Map();
      }

      const startTime = performance.now();
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

      const duration = performance.now() - startTime;
      if (duration > 1) {
        // Only log if it takes more than 1ms
        dashboardLogger.logPerformance(
          "ScraperVisualization",
          "transform_data",
          duration,
          {
            inputDataCount: unifiedData.length,
            outputWebsiteCount: websiteMap.size,
            totalPages: Array.from(websiteMap.values()).reduce(
              (sum, ws) => sum + ws.pages.size,
              0,
            ),
          },
        );
      }

      return websiteMap;
    },
    [dashboardLogger],
  );

  // Convert unified data to website sessions (memoized)
  const websiteSessions = useMemo(
    () => transformToWebsiteSessions(websites),
    [websites, transformToWebsiteSessions],
  );

  // Auto-select first website when data changes
  useEffect(() => {
    if (websiteSessions.size > 0 && !selectedWebsite) {
      const firstWebsite = websiteSessions.keys().next().value;
      if (firstWebsite) {
        setSelectedWebsite(firstWebsite);
        logVisualizationInteraction(
          "ScraperVisualization",
          "auto_select_website",
          {
            selectedWebsite: firstWebsite,
            totalWebsites: websiteSessions.size,
          },
        );
      }
    } else if (websiteSessions.size === 0) {
      setSelectedWebsite(null);
    }
  }, [websiteSessions, selectedWebsite]);

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

  // Convert website pages to force graph data (memoized)
  const getGraphData = useCallback(
    (website: WebsiteSession): GraphData => {
      const startTime = performance.now();
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

      const duration = performance.now() - startTime;
      // Only log performance for meaningful processing times or large datasets
      if (duration > 5 || nodes.length > 50) {
        dashboardLogger.logPerformance(
          "ScraperVisualization",
          "generate_graph_data",
          duration,
          {
            websiteDomain: website.domain,
            nodeCount: nodes.length,
            linkCount: links.length,
            homepageCount: nodes.filter((n) => n.isHomepage).length,
          },
        );
      }

      return { nodes, links };
    },
    [getStatusColor],
  );

  const graphData = useMemo(
    () =>
      currentWebsite ? getGraphData(currentWebsite) : { nodes: [], links: [] },
    [currentWebsite, getGraphData],
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (node: GraphNode | null) => {
      if (!node) return;

      logVisualizationInteraction("ScraperVisualization", "node_clicked", {
        nodeId: node.id,
        nodeName: node.name,
        nodeStatus: node.status,
        isHomepage: node.isHomepage,
        websiteDomain: currentWebsite?.domain,
      });

      console.log("Clicked node:", node);
    },
    [currentWebsite],
  );

  // Handle button clicks with proper event handling and logging
  const handleButtonClick = useCallback(
    (
      e: React.MouseEvent,
      action: () => void,
      actionName: string,
      actionData?: Record<string, unknown>,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      logClick("ScraperVisualization", actionName, {
        ...actionData,
        hasCurrentWebsite: !!currentWebsite,
        websiteCount: websiteSessions.size,
        isConfigured,
        loading,
      });

      action();
    },
    [currentWebsite, websiteSessions.size, isConfigured, loading],
  );

  // Handle website selection
  const handleWebsiteSelection = useCallback(
    (websiteId: string) => {
      const previousWebsite = selectedWebsite;
      setSelectedWebsite(websiteId);

      logClick("ScraperVisualization", "website_selector", {
        previousWebsite,
        newWebsite: websiteId,
        websiteData: websiteId
          ? {
              domain: websiteSessions.get(websiteId)?.domain,
              pageCount: websiteSessions.get(websiteId)?.pages.size,
              source: websiteSessions.get(websiteId)?.source,
              artistName: websiteSessions.get(websiteId)?.artistName,
            }
          : null,
      });
    },
    [selectedWebsite, websiteSessions],
  );

  // Handle AWS data loading with logging
  const handleLoadAWSData = useCallback(async () => {
    const startTime = performance.now();
    logDataOperation("ScraperVisualization", "load_aws_data_started", {
      isConfigured,
      currentWebsiteCount: websites.length,
    });

    try {
      await loadAWSData();
      const duration = performance.now() - startTime;
      dashboardLogger.logPerformance(
        "ScraperVisualization",
        "load_aws_data_completed",
        duration,
      );
    } catch (error) {
      dashboardLogger.logError(
        "ScraperVisualization",
        "load_aws_data_failed",
        error as Error,
        {
          duration: performance.now() - startTime,
          isConfigured,
        },
      );
    }
  }, [loadAWSData, isConfigured, websites.length]);

  // Handle refresh with logging
  const handleRefreshData = useCallback(async () => {
    const startTime = performance.now();
    logDataOperation("ScraperVisualization", "refresh_data_started", {
      currentWebsiteCount: websites.length,
      hasAWSData: websites.some((w) => w.source === "aws"),
      hasMockData: websites.some((w) => w.source === "mock"),
    });

    try {
      await refreshData();
      const duration = performance.now() - startTime;
      dashboardLogger.logPerformance(
        "ScraperVisualization",
        "refresh_data_completed",
        duration,
      );
    } catch (error) {
      dashboardLogger.logError(
        "ScraperVisualization",
        "refresh_data_failed",
        error as Error,
        {
          duration: performance.now() - startTime,
        },
      );
    }
  }, [refreshData, websites]);

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

  // Log graph engine events
  const handleEngineStop = useCallback(() => {
    logVisualizationInteraction(
      "ScraperVisualization",
      "graph_engine_stopped",
      {
        nodeCount: graphData.nodes.length,
        linkCount: graphData.links.length,
        websiteDomain: currentWebsite?.domain,
      },
    );

    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
      logVisualizationInteraction("ScraperVisualization", "auto_zoom_to_fit", {
        zoomPadding: 400,
      });
    }
  }, [graphData, currentWebsite]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] bg-slate-900 rounded-lg border relative overflow-hidden"
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30">
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
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30">
          <div className="text-white text-center p-4">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <div className="flex gap-2 justify-center">
              {!isConfigured && <AWSConfigDialog />}
              {isConfigured && (
                <Button
                  onClick={(e) =>
                    handleButtonClick(
                      e,
                      handleLoadAWSData,
                      "retry_aws_button",
                      { error },
                    )
                  }
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry AWS
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls - Higher z-index and proper event handling */}
      <div className="absolute top-4 left-4 z-40 flex gap-2 pointer-events-auto">
        {/* AWS Configuration */}
        <div onClick={(e) => e.stopPropagation()}>
          <AWSConfigDialog triggerClassName="bg-black/50 border-white/20 text-white hover:bg-black/70" />
        </div>

        {/* Load AWS Data Button */}
        <Button
          onClick={(e) =>
            handleButtonClick(e, handleLoadAWSData, "load_aws_button", {
              isConfigured,
              currentDataSource: dataSourceInfo.type,
            })
          }
          disabled={loading || !isConfigured}
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70 gap-2 pointer-events-auto"
        >
          <Database className="h-4 w-4" />
          Load AWS Data
        </Button>

        {/* Website Selector */}
        <select
          value={selectedWebsite || ""}
          onChange={(e) => handleWebsiteSelection(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="bg-black/50 text-white border border-white/20 rounded px-3 py-1 text-sm backdrop-blur-sm pointer-events-auto"
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
          onClick={(e) =>
            handleButtonClick(e, handleRefreshData, "refresh_button", {
              dataSourceInfo,
            })
          }
          disabled={loading}
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70 pointer-events-auto"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Data Source Info */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center gap-2 bg-black/50 text-white rounded px-2 py-1 text-sm backdrop-blur-sm pointer-events-auto"
                onClick={() =>
                  logClick("ScraperVisualization", "data_source_info_clicked", {
                    dataSourceInfo,
                  })
                }
              >
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
      <div className="absolute bottom-4 right-4 z-40 bg-black/50 text-white rounded p-3 text-sm backdrop-blur-sm pointer-events-auto">
        {currentWebsite && (
          <div
            className="space-y-1"
            onClick={() =>
              logClick("ScraperVisualization", "stats_overlay_clicked", {
                websiteDomain: currentWebsite.domain,
                stats: {
                  pages: currentWebsite.pages.size,
                  status: currentWebsite.status,
                  source: currentWebsite.source,
                },
              })
            }
          >
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
      <div className="absolute bottom-4 left-4 z-40 bg-black/50 text-white rounded p-3 text-xs backdrop-blur-sm pointer-events-auto">
        <div
          className="space-y-1"
          onClick={() =>
            logClick("ScraperVisualization", "legend_clicked", {
              dataSourceInfo,
            })
          }
        >
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

      {/* Force Graph - Lower z-index, responsive dimensions */}
      {!loading && !error && websiteSessions.size > 0 && (
        <div className="absolute inset-0 z-10">
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
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
            // Ensure graph fits properly within bounds
            cooldownTicks={100}
            onEngineStop={handleEngineStop}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && websiteSessions.size === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
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
