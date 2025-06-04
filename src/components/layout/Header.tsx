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
import { useCallback } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const awsStatus = "healthy";

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

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleStatusBadgeClick = useCallback(() => {
    console.log("settings clicked");
  }, []);

  return (
    <div className="sticky top-4 z-50 px-4">
      <header className="flex h-16 shrink-0 items-center gap-2 border px-4 bg-background/80 backdrop-blur-md rounded-full shadow-lg mx-auto max-w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div onClick={handleSidebarTrigger}>
                <SidebarTrigger className="-ml-1" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Sidebar (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1
              className="text-lg font-semibold cursor-pointer"
              onClick={() =>
                logClick("Header", "title_clicked", { currentTheme: theme })
              }
            >
              AWS Scraper Dashboard
            </h1>
            <div onClick={handleStatusBadgeClick}>
              <Badge
                variant={statusConfig.variant}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {statusConfig.text}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleThemeToggle}
                    className="h-9 w-9"
                  >
                    {theme === "light" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>
    </div>
  );
}
