// src/components/dashboard/ScraperVisualization.tsx
import { useAWSConfig } from "@/hooks/useAWSConfig";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw } from "lucide-react";

export function ScraperVisualization() {
  const { isConfigured } = useAWSConfig();

  const handleLoadAWSData = () => {
    console.log("Load AWS data functionality not implemented");
  };

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-lg border relative overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-40 flex gap-2">
        <Button
          onClick={handleLoadAWSData}
          disabled={!isConfigured}
          size="sm"
          variant="outline"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70 gap-2"
        >
          <Database className="h-4 w-4" />
          Load AWS Data
        </Button>
      </div>

      {/* Placeholder Content */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-white text-center p-4">
          <div className="mb-4">
            <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Visualization Placeholder</h3>
          <p className="text-sm text-white/70 mb-4">
            Connect to AWS to visualize website structures
          </p>
          <div className="text-xs text-white/50">
            AWS configuration required to display data
          </div>
        </div>
      </div>
    </div>
  );
}

// Export for compatibility
export { ScraperVisualization as ObsidianScraperVisualization };
