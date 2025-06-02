// src/components/dashboard/MockDataSidebarControls.tsx
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  TestTube,
  ChevronDown,
  ChevronRight,
  Play,
  Settings,
  Shuffle,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  MockDataGenerator,
  MockDataConfig,
  UnifiedWebsiteData,
} from "@/lib/mockDataGenerator";

interface MockDataSidebarControlsProps {
  onDataGenerated: (data: UnifiedWebsiteData[]) => void;
  onProgressUpdate?: (data: UnifiedWebsiteData[], isComplete: boolean) => void;
  isGenerating?: boolean;
}

export function MockDataSidebarControls({
  onDataGenerated,
  onProgressUpdate,
  isGenerating = false,
}: MockDataSidebarControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<MockDataConfig>({
    websiteCount: 1,
    minPagesPerWebsite: 30,
    maxPagesPerWebsite: 70,
    simulateProgress: false,
    progressSpeed: 500,
  });

  const [customArtists, setCustomArtists] = useState<string>("");
  const [customMediums, setCustomMediums] = useState<string>("");
  const [customThemes, setCustomThemes] = useState<string>("");
  const [customDomains, setCustomDomains] = useState<string>("");

  // Load config from session storage on mount
  useEffect(() => {
    const savedConfig = MockDataGenerator.loadConfigFromSession();
    if (savedConfig) {
      setConfig((prev) => ({ ...prev, ...savedConfig }));
    }

    // Try to load existing mock data
    const savedData = MockDataGenerator.loadDataFromSession();
    if (savedData && savedData.length > 0) {
      onDataGenerated(savedData);
    }
  }, [onDataGenerated]);

  // Save config to session storage when it changes
  useEffect(() => {
    MockDataGenerator.saveConfigToSession(config);
  }, [config]);

  const parseCustomList = (text: string): string[] => {
    return text
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const generateData = useCallback(
    async (useProgress: boolean = false) => {
      const finalConfig = {
        ...config,
        simulateProgress: useProgress,
        ...(customArtists.trim() && {
          artistNames: parseCustomList(customArtists),
        }),
        ...(customMediums.trim() && {
          artMediums: parseCustomList(customMediums),
        }),
        ...(customThemes.trim() && {
          artThemes: parseCustomList(customThemes),
        }),
        ...(customDomains.trim() && {
          domains: parseCustomList(customDomains),
        }),
      };

      const generator = new MockDataGenerator(finalConfig);

      if (useProgress && onProgressUpdate) {
        await generator.generateProgressiveData((progressData, isComplete) => {
          onProgressUpdate(progressData, isComplete);
          // Save final data to session
          if (isComplete) {
            MockDataGenerator.saveDataToSession(progressData);
          }
        });
      } else {
        const apiData = generator.generateStaticData();
        const data = generator.transformToUnifiedFormat(apiData);
        onDataGenerated(data);
        MockDataGenerator.saveDataToSession(data);
      }
    },
    [
      config,
      customArtists,
      customMediums,
      customThemes,
      customDomains,
      onDataGenerated,
      onProgressUpdate,
    ],
  );

  const clearData = useCallback(() => {
    try {
      sessionStorage.removeItem("mockWebsiteData");
      onDataGenerated([]);
    } catch (error) {
      console.warn("Failed to clear mock data from session:", error);
    }
  }, [onDataGenerated]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-8 px-2"
          disabled={isGenerating}
        >
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span className="text-sm">Mock Data</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="h-4 text-xs px-1">
              {config.websiteCount}
            </Badge>
            {isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 px-2 pb-2">
        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => generateData(false)}
            disabled={isGenerating}
            size="sm"
            className="w-full gap-2 h-7"
          >
            <Shuffle className="h-3 w-3" />
            Generate
          </Button>

          <Button
            variant="outline"
            onClick={() => generateData(true)}
            disabled={isGenerating || !onProgressUpdate}
            size="sm"
            className="w-full gap-2 h-7"
          >
            {isGenerating ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            Simulate
          </Button>

          <Button
            variant="outline"
            onClick={clearData}
            disabled={isGenerating}
            size="sm"
            className="w-full gap-2 h-7"
          >
            Clear Data
          </Button>
        </div>

        <Separator />

        {/* Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-3 w-3" />
            <span className="text-xs font-medium">Configuration</span>
          </div>

          {/* Website Count */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Websites</label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    websiteCount: Math.max(1, prev.websiteCount - 1),
                  }))
                }
                disabled={config.websiteCount <= 1}
                className="h-6 w-6 p-0"
              >
                -
              </Button>
              <Input
                type="number"
                value={config.websiteCount}
                onChange={(e) => {
                  const value = Math.max(
                    1,
                    Math.min(10, parseInt(e.target.value) || 1),
                  );
                  setConfig((prev) => ({ ...prev, websiteCount: value }));
                }}
                min={1}
                max={10}
                className="h-6 text-xs text-center flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    websiteCount: Math.min(10, prev.websiteCount + 1),
                  }))
                }
                disabled={config.websiteCount >= 10}
                className="h-6 w-6 p-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Pages Per Site */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Pages per site
            </label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={config.minPagesPerWebsite}
                onChange={(e) => {
                  const value = Math.max(1, parseInt(e.target.value) || 1);
                  setConfig((prev) => ({ ...prev, minPagesPerWebsite: value }));
                }}
                placeholder="Min"
                className="h-6 text-xs flex-1"
              />
              <Input
                type="number"
                value={config.maxPagesPerWebsite}
                onChange={(e) => {
                  const value = Math.max(
                    config.minPagesPerWebsite,
                    parseInt(e.target.value) || config.minPagesPerWebsite,
                  );
                  setConfig((prev) => ({ ...prev, maxPagesPerWebsite: value }));
                }}
                placeholder="Max"
                className="h-6 text-xs flex-1"
              />
            </div>
          </div>

          {/* Timing Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Simulate Timing</span>
            </div>
            <Button
              variant={config.simulateProgress ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  simulateProgress: !prev.simulateProgress,
                }))
              }
              className="h-5 px-2 text-xs"
            >
              {config.simulateProgress ? "ON" : "OFF"}
            </Button>
          </div>

          <Separator />

          {/* Custom Lists */}
          <div className="space-y-2">
            <label className="text-xs font-medium">
              Custom Data (optional)
            </label>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Artist Names
              </label>
              <textarea
                value={customArtists}
                onChange={(e) => setCustomArtists(e.target.value)}
                placeholder="Elena Rodriguez, Marcus Chen..."
                className="w-full h-12 px-2 py-1 text-xs border rounded-md bg-background resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Art Mediums
              </label>
              <textarea
                value={customMediums}
                onChange={(e) => setCustomMediums(e.target.value)}
                placeholder="Oil Painting, Digital Art..."
                className="w-full h-12 px-2 py-1 text-xs border rounded-md bg-background resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Art Themes
              </label>
              <textarea
                value={customThemes}
                onChange={(e) => setCustomThemes(e.target.value)}
                placeholder="Abstract, Landscape..."
                className="w-full h-12 px-2 py-1 text-xs border rounded-md bg-background resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Domain Names
              </label>
              <textarea
                value={customDomains}
                onChange={(e) => setCustomDomains(e.target.value)}
                placeholder="artgallery, creative-studio..."
                className="w-full h-12 px-2 py-1 text-xs border rounded-md bg-background resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-muted/50 rounded-md p-2">
          <div className="text-xs text-muted-foreground">
            {config.websiteCount} website{config.websiteCount !== 1 ? "s" : ""},{" "}
            {config.minPagesPerWebsite}-{config.maxPagesPerWebsite} pages each
            {config.simulateProgress && ", with timing simulation"}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
