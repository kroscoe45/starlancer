// src/components/layout/Header.tsx
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "../ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  // Mock AWS status - replace with real data
  const awsStatus = "healthy"; // 'healthy' | 'warning' | 'error'

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return {
          text: "All Systems Operational",
          variant: "default" as const,
        };
      case "warning":
        return {
          text: "Minor Issues Detected",
          variant: "secondary" as const,
        };
      case "error":
        return {
          text: "Service Disruption",
          variant: "destructive" as const,
        };
      default:
        return {
          text: "Status Unknown",
          variant: "outline" as const,
        };
    }
  };

  const statusConfig = getStatusConfig(awsStatus);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="-ml-1" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Sidebar (Ctrl+B)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">AWS Scraper Dashboard</h1>
          <Badge variant={statusConfig.variant}>{statusConfig.text}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
