// src/components/layout/Header.tsx
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "../ThemeProvider";
import { Moon, Sun, Plus, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const awsStatus = "healthy";
  const [urlInput, setUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Get API Gateway endpoint from environment variables
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
      const apiKey = import.meta.env.VITE_API_KEY;
      
      if (!apiEndpoint) {
        throw new Error("API Gateway endpoint not configured");
      }

      // Clean the API key by removing any non-ASCII characters
      const cleanApiKey = apiKey?.replace(/[^\x00-\x7F]/g, "").trim();

      console.log('Submitting URL:', urlInput.trim());
      console.log('API Endpoint:', apiEndpoint);
      console.log('API Key (first 10 chars):', cleanApiKey?.substring(0, 10) + '...');

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cleanApiKey && { 'x-api-key': cleanApiKey }),
        },
        body: JSON.stringify({
          page_url: urlInput.trim()
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      console.log('URL submitted successfully:', result);
      
      // Clear input after successful submission
      setUrlInput("");
      
      // TODO: Add toast notification or success feedback
      
    } catch (error) {
      console.error('Error submitting URL:', error);
      // TODO: Add error toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };


  return (
    <div className="sticky top-4 z-50 px-4">
      <header className="flex h-16 shrink-0 items-center gap-2 border px-4 bg-background/80 backdrop-blur-md rounded-full shadow-lg mx-auto max-w-full">
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
            <h1 className="text-lg font-semibold">
              AWS Scraper Dashboard
            </h1>
            <Badge variant={statusConfig.variant}>
              {statusConfig.text}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 max-w-md">
              <Input
                type="url"
                placeholder="Enter website URL to scrape..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
                className="min-w-[300px]"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleUrlSubmit}
                      disabled={isSubmitting || !urlInput.trim()}
                      size="icon"
                      className="h-9 w-9"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className="sr-only">Add URL to scraping queue</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add URL to scraping pipeline</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
