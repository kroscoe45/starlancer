// src/components/dashboard/Visualization3D.tsx
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import ForceGraph3D, { ForceGraphMethods, NodeObject, LinkObject } from "react-force-graph-3d";
import { useAWSData, WebsiteData } from "@/hooks/useAWSData";
import { AWSConfigDialog } from "./AWSConfigDialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Database,
  RefreshCw,
  Settings,
  Move3D,
  Camera,
  ZoomIn,
  RotateCcw,
} from "lucide-react";
import * as THREE from "three";

interface GraphNode {
  id: string;
  name: string;
  url: string;
  isHomepage: boolean;
  val: number;
  color: string;
  websiteDomain: string;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  width: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface VisualizationSettings {
  nodeSize: number;
  linkWidth: number;
  nodeOpacity: number;
  linkOpacity: number;
  enableNodeLabels: boolean;
  forceStrength: number;
  cameraDistance: number;
}

export function Visualization3D() {
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>>(undefined);

  const [settings, setSettings] = useState<VisualizationSettings>({
    nodeSize: 8,
    linkWidth: 2,
    nodeOpacity: 0.9,
    linkOpacity: 0.4,
    enableNodeLabels: true,
    forceStrength: -300,
    cameraDistance: 300,
  });

  const { data: websites, loading, error, isConfigured, loadData, refreshData } = useAWSData();

  // Handle resize
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Auto-select first website
  useEffect(() => {
    if (websites.length > 0 && !selectedWebsite) {
      setSelectedWebsite(websites[0].website_domain);
    } else if (websites.length === 0) {
      setSelectedWebsite(null);
    }
  }, [websites, selectedWebsite]);

  const currentWebsite = useMemo(
    () => websites.find(w => w.website_domain === selectedWebsite),
    [websites, selectedWebsite]
  );

  // Convert website data to graph data
  const getGraphData = useCallback((website: WebsiteData): GraphData => {
    const sitemap = website.sitemap || {};
    const urls = Object.keys(sitemap);

    // Determine homepage
    const homepage = urls.find(url => {
      try {
        const path = new URL(url).pathname;
        return path === "/" || path === "";
      } catch {
        return false;
      }
    }) || urls[0];

    // Create nodes
    const nodes: GraphNode[] = urls.map(url => {
      const isHomepage = url === homepage;
      let name = "Page";

      try {
        const urlObj = new URL(url);
        name = urlObj.pathname === "/" ? "Homepage" : 
               urlObj.pathname.split("/").filter(p => p).pop() || "Page";
      } catch {
        name = "Page";
      }

      return {
        id: url,
        name,
        url,
        isHomepage,
        val: isHomepage ? settings.nodeSize * 2 : settings.nodeSize,
        color: isHomepage ? "#10b981" : "#3b82f6",
        websiteDomain: website.website_domain,
      };
    });

    // Create links
    const links: GraphLink[] = [];
    Object.entries(sitemap).forEach(([sourceUrl, targetUrls]) => {
      targetUrls.forEach(targetUrl => {
        if (urls.includes(targetUrl)) {
          links.push({
            source: sourceUrl,
            target: targetUrl,
            color: `rgba(255, 255, 255, ${settings.linkOpacity})`,
            width: settings.linkWidth,
          });
        }
      });
    });

    return { nodes, links };
  }, [settings]);

  const graphData = useMemo(
    () => currentWebsite ? getGraphData(currentWebsite) : { nodes: [], links: [] },
    [currentWebsite, getGraphData]
  );

  // Camera controls
  const handleCameraReset = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.cameraPosition({ x: 0, y: 0, z: settings.cameraDistance });
    }
  }, [settings.cameraDistance]);

  const handleZoomToFit = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  }, []);

  // Node interactions
  const handleNodeClick = useCallback((node: GraphNode | null) => {
    if (!node) return;
    console.log("Clicked node:", node);
    
    // Center camera on clicked node
    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: (node as any).x || 0, y: (node as any).y || 0, z: ((node as any).z || 0) + 100 },
        { x: (node as any).x || 0, y: (node as any).y || 0, z: (node as any).z || 0 },
        1000
      );
    }
  }, []);

  // Settings update
  const updateSetting = useCallback(
    <K extends keyof VisualizationSettings>(key: K, value: VisualizationSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Controls Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Move3D className="h-5 w-5" />
                3D Website Structure Visualization
                <Badge variant="secondary">Live</Badge>
              </CardTitle>
              <CardDescription>
                Interactive 3D visualization of website sitemap data from DynamoDB
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showControls ? "Hide" : "Show"} Controls
            </Button>
          </div>
        </CardHeader>

        {showControls && (
          <CardContent className="pt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Node Size: {settings.nodeSize}</label>
                <Slider
                  value={[settings.nodeSize]}
                  onValueChange={([value]) => updateSetting("nodeSize", value)}
                  min={2}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link Width: {settings.linkWidth}</label>
                <Slider
                  value={[settings.linkWidth]}
                  onValueChange={([value]) => updateSetting("linkWidth", value)}
                  min={0.5}
                  max={5}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Node Opacity: {settings.nodeOpacity}</label>
                <Slider
                  value={[settings.nodeOpacity]}
                  onValueChange={([value]) => updateSetting("nodeOpacity", value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link Opacity: {settings.linkOpacity}</label>
                <Slider
                  value={[settings.linkOpacity]}
                  onValueChange={([value]) => updateSetting("linkOpacity", value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Force Strength: {Math.abs(settings.forceStrength)}</label>
                <Slider
                  value={[Math.abs(settings.forceStrength)]}
                  onValueChange={([value]) => updateSetting("forceStrength", -value)}
                  min={50}
                  max={500}
                  step={50}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Camera Distance: {settings.cameraDistance}</label>
                <Slider
                  value={[settings.cameraDistance]}
                  onValueChange={([value]) => updateSetting("cameraDistance", value)}
                  min={100}
                  max={800}
                  step={50}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.enableNodeLabels}
                  onChange={(e) => updateSetting("enableNodeLabels", e.target.checked)}
                />
                <span className="text-sm">Show Node Labels</span>
              </label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 3D Visualization Container */}
      <div
        ref={containerRef}
        className="w-full h-[600px] bg-slate-900 rounded-lg border relative overflow-hidden"
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30">
            <div className="text-white text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading AWS data...</p>
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
                  <Button onClick={loadData} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-4 left-4 z-40 flex gap-2">
          <AWSConfigDialog triggerClassName="bg-black/50 border-white/20 text-white hover:bg-black/70" />
          
          <Button
            onClick={loadData}
            disabled={loading || !isConfigured}
            size="sm"
            variant="outline"
            className="bg-black/50 border-white/20 text-white hover:bg-black/70 gap-2"
          >
            <Database className="h-4 w-4" />
            Load Data
          </Button>

          <select
            value={selectedWebsite || ""}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="bg-black/50 text-white border border-white/20 rounded px-3 py-1 text-sm backdrop-blur-sm"
            disabled={loading || websites.length === 0}
          >
            <option value="">Select website...</option>
            {websites.map((website) => (
              <option key={website.website_domain} value={website.website_domain}>
                {website.website_domain}
              </option>
            ))}
          </select>

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

        {/* Camera Controls */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCameraReset}
                  size="sm"
                  variant="outline"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Camera</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleZoomToFit}
                  size="sm"
                  variant="outline"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom to Fit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 right-4 z-40 bg-black/50 text-white rounded p-3 text-sm backdrop-blur-sm">
          {currentWebsite && (
            <div className="space-y-1">
              <div>Domain: {currentWebsite.website_domain}</div>
              <div>Pages: {Object.keys(currentWebsite.sitemap).length}</div>
              {currentWebsite.artist_name && (
                <div>Artist: {currentWebsite.artist_name}</div>
              )}
              <div className="text-xs opacity-75">
                Updated: {new Date(currentWebsite.last_updated * 1000).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* 3D Graph */}
        {!loading && !error && websites.length > 0 && (
          <div className="absolute inset-0 z-10">
            <ForceGraph3D
              ref={fgRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#0f172a"
              enablePointerInteraction={true}
              enableNodeDrag={true}
              enableNavigationControls={true}
              controlType="orbit"
              nodeVal={(node: GraphNode) => node.val}
              nodeColor={(node: GraphNode) => node.color}
              nodeOpacity={settings.nodeOpacity}
              nodeLabel={settings.enableNodeLabels ? (node: GraphNode) => node.name : undefined}
              linkColor={(link: GraphLink) => link.color}
              linkWidth={(link: GraphLink) => link.width}
              linkOpacity={settings.linkOpacity}
              onNodeClick={handleNodeClick}
              d3Force="charge"
              d3ForceStrength={settings.forceStrength}
              cooldownTicks={100}
              nodeThreeObject={(node: GraphNode) => {
                const geometry = new THREE.SphereGeometry(node.val);
                const material = new THREE.MeshLambertMaterial({
                  color: node.color,
                  transparent: true,
                  opacity: settings.nodeOpacity,
                });
                return new THREE.Mesh(geometry, material);
              }}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && websites.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-white text-center p-4">
              <Move3D className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-sm text-white/70 mb-4">
                Load AWS data to visualize website structures in 3D
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
