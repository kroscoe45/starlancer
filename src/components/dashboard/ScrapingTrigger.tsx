// src/components/dashboard/ScrapingTrigger.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Play } from "lucide-react";

interface ScrapingTriggerProps {
  apiEndpoint?: string;
  apiKey?: string;
}

export function ScrapingTrigger({ apiEndpoint, apiKey }: ScrapingTriggerProps) {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    timestamp: Date;
  } | null>(null);

  const [configuredApiEndpoint, setConfiguredApiEndpoint] = useState(
    apiEndpoint || import.meta.env.VITE_API_ENDPOINT || "",
  );
  const [configuredApiKey, setConfiguredApiKey] = useState(
    apiKey || import.meta.env.VITE_API_KEY || "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setLastResult({
        success: false,
        message: "Please enter a valid URL",
        timestamp: new Date(),
      });
      return;
    }

    if (!configuredApiEndpoint || !configuredApiKey) {
      setLastResult({
        success: false,
        message: "Please configure API endpoint and key",
        timestamp: new Date(),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(configuredApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": configuredApiKey,
        },
        body: JSON.stringify({
          page_url: url.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastResult({
          success: true,
          message: `Scraping initiated successfully! Request ID: ${result.requestId || "N/A"}`,
          timestamp: new Date(),
        });
        setUrl(""); // Clear the input on success
      } else {
        const errorText = await response.text();
        setLastResult({
          success: false,
          message: `Failed to initiate scraping: ${response.status} ${response.statusText}. ${errorText}`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidUrl = url.trim() === "" || validateUrl(url.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Trigger Website Scraping
        </CardTitle>
        <CardDescription>
          Start scraping a website to populate the dashboard with real-time
          data. Results will appear in the visualization above.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Configuration */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="apiEndpoint" className="text-sm font-medium">
              API Endpoint
            </label>
            <Input
              id="apiEndpoint"
              placeholder="https://your-api.execute-api.us-west-2.amazonaws.com/prod/scrape"
              value={configuredApiEndpoint}
              onChange={(e) => setConfiguredApiEndpoint(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your API Gateway key"
              value={configuredApiKey}
              onChange={(e) => setConfiguredApiKey(e.target.value)}
            />
          </div>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Website URL to Scrape
            </label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
                className={!isValidUrl ? "border-destructive" : ""}
              />
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !isValidUrl ||
                  !url.trim() ||
                  !configuredApiEndpoint ||
                  !configuredApiKey
                }
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Scraping
                  </>
                )}
              </Button>
            </div>
            {!isValidUrl && url.trim() && (
              <p className="text-sm text-destructive">
                Please enter a valid URL
              </p>
            )}
          </div>
        </form>

        {/* Last Result Display */}
        {lastResult && (
          <div
            className={`p-3 rounded-md border ${
              lastResult.success
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
            }`}
          >
            <div className="flex items-start gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    lastResult.success
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {lastResult.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lastResult.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables Info */}
        <div className="bg-muted/50 rounded-md p-3">
          <h4 className="font-medium text-sm mb-2">
            Environment Variables (Alternative)
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              <code>VITE_API_ENDPOINT</code> - Your API Gateway endpoint URL
            </div>
            <div>
              <code>VITE_API_KEY</code> - Your API Gateway key
            </div>
          </div>
        </div>

        {/* Process Info */}
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">
            What happens when you trigger scraping:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>URL is added to the SQS queue</li>
            <li>Lambda function processes the queue and scrapes the website</li>
            <li>Sitemap data is stored in DynamoDB</li>
            <li>
              Results appear in the visualization above (refresh to see updates)
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
