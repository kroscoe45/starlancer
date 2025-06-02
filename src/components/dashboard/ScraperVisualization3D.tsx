// src/components/dashboard/ScraperVisualization3D.tsx
import { useCallback, useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { useAWSConfig } from "@/hooks/useAWSConfig";
import { AWSConfigDialog } from "./AWSConfigDialog";

// Types for scraper data (keeping the same interface)
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
}

// Types for 3D force graph data
interface GraphNode {
  id: string;
  name: string;
  status: string;
  isHomepage: boolean;
  val: number;
  color: string;
  x?: number;
  y?: number;
  z?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function ScraperVisualization3D() {
  const [websites, setWebsites] = useState<Map<string, WebsiteSession>>(
    new Map(),
  );
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fgRef = useRef<any>(null);

  // Use the AWS configuration hook
  const {
    dynamoClient,
    isConfigured,
    error: configError,
    configure,
  } = useAWSConfig();

  // Transform DynamoDB sitemap data to our WebsiteSession format
  const transformDynamoData = useCallback(
    (dynamoItems: any[]): Map<string, WebsiteSession> => {
      const websiteMap = new Map<string, WebsiteSession>();

      dynamoItems.forEach((item) => {
        const domain = item.website_domain;
        const sitemap = item.sitemap || {};
        const lastUpdated = new Date(item.last_updated * 1000);

        // Create pages map from sitemap
        const pagesMap = new Map<string, ScrapedPage>();

        // Determine homepage (shortest path or contains domain root)
        const urls = Object.keys(sitemap);
        const homepage =
          urls.find((url) => {
            const path = new URL(url).pathname;
            return path === "/" || path === "";
          }) || urls[0]; // fallback to first URL

        // Create ScrapedPage objects from sitemap
        Object.entries(sitemap).forEach(([url, linkedUrls]) => {
          const isHomepage = url === homepage;
          const urlObj = new URL(url);

          pagesMap.set(url, {
            url,
            status: "completed", // All DynamoDB data is completed
            title:
              urlObj.pathname === "/"
                ? "Homepage"
                : urlObj.pathname.split("/").pop() || "Page",
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
        };

        websiteMap.set(domain, websiteSession);
      });

      return websiteMap;
    },
    [],
  );

  // Load data from DynamoDB
  const loadWebsiteData = useCallback(async () => {
    if (!dynamoClient) {
      setError("AWS not configured. Please configure your AWS settings.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const command = new ScanCommand({
        TableName: "website-sitemaps",
      });

      const response = await dynamoClient.send(command);
      const items = response.Items || [];

      console.log("Loaded DynamoDB items:", items);

      if (items.length === 0) {
        setError("No website data found in DynamoDB");
        return;
      }

      // Transform and set data
      const websiteMap = transformDynamoData(items);
      setWebsites(websiteMap);

      // Auto-select first website
      const firstWebsite = websiteMap.keys().next().value;
      if (firstWebsite) {
        setSelectedWebsite(firstWebsite);
      }
    } catch (err) {
      console.error("Error loading website data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [dynamoClient, transformDynamoData]);

  // Load data when AWS client becomes available
  useEffect(() => {
    if (dynamoClient && isConfigured) {
      loadWebsiteData();
    }
  }, [dynamoClient, isConfigured, loadWebsiteData]);

  // Get current website data for visualization
  const currentWebsite = selectedWebsite ? websites.get(selectedWebsite) : null;

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
        val: page.isHomepage ? 25 : 12, // Slightly larger values for 3D
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

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    console.log("Clicked node:", node);

    // Focus camera on clicked node using the ref
    if (
      fgRef.current &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.z !== undefined
    ) {
      const distance = 200;
      fgRef.current.cameraPosition(
        { x: node.x + distance, y: node.y + distance, z: node.z + distance },
        { x: node.x, y: node.y, z: node.z },
        1000,
      );
    }
  }, []);

  // Combined error from configuration or data loading
  const displayError = configError || error;

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-lg border relative overflow-hidden">
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading website data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {displayError && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
          <div className="text-white text-center p-4">
            <p className="text-red-400 mb-4">Error: {displayError}</p>
            <div className="flex gap-2 justify-center">
              {!isConfigured && (
                <AWSConfigDialog
                  isConfigured={isConfigured}
                  error={configError}
                  onConfigure={configure}
                />
              )}
              {isConfigured && (
                <button
                  onClick={loadWebsiteData}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
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

        {/* Website Selector */}
        <select
          value={selectedWebsite || ""}
          onChange={(e) => setSelectedWebsite(e.target.value)}
          className="bg-black/50 text-white border border-white/20 rounded px-3 py-1 text-sm backdrop-blur-sm"
          disabled={loading || !isConfigured}
        >
          <option value="">Select website...</option>
          {Array.from(websites.entries()).map(([id, website]) => (
            <option key={id} value={id}>
              {website.domain}
            </option>
          ))}
        </select>

        {/* Refresh Button */}
        <button
          onClick={loadWebsiteData}
          disabled={loading || !isConfigured}
          className="px-3 py-1 bg-black/50 text-white border border-white/20 rounded text-sm backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
        >
          ↻
        </button>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded p-3 text-sm backdrop-blur-sm">
        {currentWebsite && (
          <div className="space-y-1">
            <div>Domain: {currentWebsite.domain}</div>
            <div>Pages: {currentWebsite.pages.size}</div>
            <div>Status: {currentWebsite.status}</div>
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
          <div className="text-xs opacity-75 mt-2">
            {isConfigured
              ? "3D visualization - Click nodes to focus"
              : "Configure AWS to load data"}
          </div>
        </div>
      </div>

      {/* 3D Force Graph */}
      {!loading && !displayError && isConfigured && currentWebsite && (
        <ForceGraph3D
          ref={fgRef}
          width={800}
          height={600}
          backgroundColor="#0f172a"
          showNavInfo={false}
          enableNodeDrag={true}
          enableNavigationControls={true}
          d3VelocityDecay={0.4}
          graphData={getGraphData(currentWebsite)}
          nodeColor={(node: GraphNode) => node.color}
          nodeVal={(node: GraphNode) => node.val}
          nodeLabel={(node: GraphNode) => node.name}
          linkColor={() => "#ffffff25"}
          linkWidth={2}
          linkOpacity={0.6}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
}
