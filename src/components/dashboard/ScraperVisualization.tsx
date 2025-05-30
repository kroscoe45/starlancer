// src/components/dashboard/ScraperVisualization.tsx
//
// DEBUGGING VERSION: Custom rendering is commented out to show default nodes/links
// Once you verify the data is working, uncomment the custom rendering sections
// to enable Obsidian-style hover effects and animations
//
import { useCallback, useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";

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
}

// Types for force graph data
interface GraphNode {
  id: string;
  name: string;
  status: string;
  isHomepage: boolean;
  val: number;
  color: string;
  fx?: number;
  fy?: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function ScraperVisualization() {
  const [websites, setWebsites] = useState<Map<string, WebsiteSession>>(
    new Map(),
  );
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  // const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null); // COMMENTED OUT - not used with default rendering
  const fgRef = useRef<any>(null);

  // Get current website data for visualization
  const currentWebsite = selectedWebsite ? websites.get(selectedWebsite) : null;

  // Status-based colors (professional palette)
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "pending":
        return "#94a3b8"; // Cool gray
      case "scraping":
        return "#3b82f6"; // Blue with pulse effect
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
        val: page.isHomepage ? 15 : 5,
        color: getStatusColor(page.status),
        fx: page.isHomepage ? 0 : undefined,
        fy: page.isHomepage ? 0 : undefined,
      }));

      const links: GraphLink[] = pages.flatMap((page) =>
        page.linksTo
          .filter((linkedUrl) => website.pages.has(linkedUrl))
          .map((linkedUrl) => ({
            source: page.url,
            target: linkedUrl,
            strength: page.isHomepage ? 2 : 1,
          })),
      );

      return { nodes, links };
    },
    [getStatusColor],
  );

  // COMMENTED OUT - Custom node rendering (not used with default rendering)
  /*
  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const typedNode = node as GraphNode;
      const label = typedNode.name;
      const fontSize = 12 / globalScale;
      const isHovered = hoveredNode?.id === typedNode.id;

      // Ensure node has position
      if (typeof typedNode.x !== 'number' || typeof typedNode.y !== 'number') {
        return;
      }

      // Node circle
      const nodeRadius = Math.sqrt(typedNode.val || 1) * 4;
      const displayRadius = isHovered ? nodeRadius * 1.5 : nodeRadius;

      // Draw node circle with status-based styling
      ctx.beginPath();
      ctx.arc(typedNode.x, typedNode.y, displayRadius, 0, 2 * Math.PI);

      // Fill color based on status
      ctx.fillStyle = typedNode.color;
      ctx.fill();

      // Border styling
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = isHovered ? 3 / globalScale : 1 / globalScale;
      ctx.stroke();

      // Pulsing effect for scraping nodes
      if (typedNode.status === 'scraping') {
        const time = Date.now() * 0.005;
        const pulseRadius = displayRadius + Math.sin(time) * 3;
        ctx.beginPath();
        ctx.arc(typedNode.x, typedNode.y, pulseRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      // Show text only on hover with smooth background
      if (isHovered && globalScale > 0.5) {
        ctx.font = `${fontSize}px 'Inter', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Measure text for background
        const textWidth = ctx.measureText(label).width;
        const textHeight = fontSize;
        const padding = 8 / globalScale;

        // Draw text background
        const bgX = typedNode.x - textWidth / 2 - padding;
        const bgY = typedNode.y - displayRadius - textHeight - padding * 2;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = textHeight + padding * 2;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, typedNode.x, bgY + bgHeight / 2);
      }
    },
    [hoveredNode]
  );
  */

  // COMMENTED OUT - Custom link rendering (not used with default rendering)
  /*
  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = link.source;
    const end = link.target;

    // Skip incomplete links
    if (
      typeof start !== 'object' ||
      typeof end !== 'object' ||
      typeof start.x !== 'number' ||
      typeof start.y !== 'number' ||
      typeof end.x !== 'number' ||
      typeof end.y !== 'number'
    ) {
      return;
    }

    // Elastic curve effect
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) return;

    // Draw curved link for organic appearance
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    // Add slight curve for organic feel
    const curvature = 0.1;
    const midX = (start.x + end.x) / 2 + curvature * dy;
    const midY = (start.y + end.y) / 2 - curvature * dx;

    ctx.quadraticCurveTo(midX, midY, end.x, end.y);

    // Link styling
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = Math.max(1, link.strength || 1);
    ctx.stroke();
  }, []);
  */

  // Mock data generation - replace with real webscraper data
  useEffect(() => {
    const mockWebsite: WebsiteSession = {
      id: "example-com",
      domain: "example.com",
      homepageUrl: "https://example.com",
      startTime: new Date(),
      status: "active",
      pages: new Map([
        [
          "https://example.com",
          {
            url: "https://example.com",
            status: "completed",
            title: "Homepage",
            isHomepage: true,
            discoveredAt: new Date(),
            websiteId: "example-com",
            linksTo: [
              "https://example.com/about",
              "https://example.com/products",
            ],
          },
        ],
        [
          "https://example.com/about",
          {
            url: "https://example.com/about",
            status: "completed",
            title: "About Us",
            isHomepage: false,
            discoveredAt: new Date(),
            websiteId: "example-com",
            linksTo: ["https://example.com/team"],
          },
        ],
        [
          "https://example.com/products",
          {
            url: "https://example.com/products",
            status: "scraping",
            title: "Products",
            isHomepage: false,
            discoveredAt: new Date(),
            websiteId: "example-com",
            linksTo: ["https://example.com/contact"],
          },
        ],
        [
          "https://example.com/team",
          {
            url: "https://example.com/team",
            status: "pending",
            title: "Our Team",
            isHomepage: false,
            discoveredAt: new Date(),
            websiteId: "example-com",
            linksTo: [],
          },
        ],
        [
          "https://example.com/contact",
          {
            url: "https://example.com/contact",
            status: "failed",
            title: "Contact",
            isHomepage: false,
            discoveredAt: new Date(),
            websiteId: "example-com",
            linksTo: [],
          },
        ],
      ]),
    };

    console.log("Setting up mock data:", mockWebsite); // Debug log
    setWebsites(new Map([["example-com", mockWebsite]]));
    setSelectedWebsite("example-com");
  }, []);

  const graphData = currentWebsite
    ? getGraphData(currentWebsite)
    : { nodes: [], links: [] };

  // Debug logging
  useEffect(() => {
    console.log("Graph data:", graphData);
    console.log("Current website:", currentWebsite);
  }, [graphData, currentWebsite]);

  // COMMENTED OUT - Handle node hover (not used with default rendering)
  /*
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node as GraphNode | null);
  }, []);
  */

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const typedNode = node as GraphNode;
    console.log("Clicked node:", typedNode);
    // Could open page details, show scraped content, etc.
  }, []);

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-lg border relative overflow-hidden">
      {/* Website Selector */}
      <div className="absolute top-4 left-4 z-10">
        <select
          value={selectedWebsite || ""}
          onChange={(e) => setSelectedWebsite(e.target.value)}
          className="bg-black/50 text-white border border-white/20 rounded px-3 py-1 text-sm backdrop-blur-sm"
        >
          {Array.from(websites.entries()).map(([id, website]) => (
            <option key={id} value={id}>
              {website.domain}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded p-3 text-sm backdrop-blur-sm">
        {currentWebsite && (
          <div className="space-y-1">
            <div>Domain: {currentWebsite.domain}</div>
            <div>Pages: {currentWebsite.pages.size}</div>
            <div>Status: {currentWebsite.status}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 text-white rounded p-3 text-xs backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Scraping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Failed</span>
          </div>
        </div>
      </div>

      {/* Force Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={800}
        height={600}
        backgroundColor="#0f172a"
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.2}
        warmupTicks={100}
        cooldownTicks={200}
        // CURRENTLY using default rendering to verify data works
        nodeColor={(node: any) => (node as GraphNode).color}
        nodeVal={(node: any) => (node as GraphNode).val}
        nodeLabel={(node: any) => (node as GraphNode).name}
        linkColor={() => "#ffffff40"}
        linkWidth={2}
        // COMMENTED OUT - Custom rendering (uncomment for Obsidian-style effects)
        // nodeCanvasObject={drawNode}
        // linkCanvasObject={drawLink}
        // nodeVisibility={() => false}
        // linkVisibility={() => false}
        // onNodeHover={handleNodeHover}

        onNodeClick={handleNodeClick}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}

// Export for compatibility
export { ScraperVisualization as ObsidianScraperVisualization };

/*
TO ENABLE CUSTOM OBSIDIAN-STYLE RENDERING:

1. Uncomment the hoveredNode state:
   const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

2. Uncomment the drawNode and drawLink functions

3. Uncomment the handleNodeHover function

4. In ForceGraph2D component, uncomment:
   nodeCanvasObject={drawNode}
   linkCanvasObject={drawLink}
   nodeVisibility={() => false}
   linkVisibility={() => false}
   onNodeHover={handleNodeHover}

5. Remove the default rendering props:
   nodeColor, nodeVal, nodeLabel, linkColor, linkWidth
*/
