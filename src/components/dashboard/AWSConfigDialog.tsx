// src/components/dashboard/AWSConfigDialog.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink,
} from "lucide-react";
import { useAWSConfig } from "@/hooks/useAWSConfig";

interface AWSConfigDialogProps {
  triggerClassName?: string;
}

export function AWSConfigDialog({
  triggerClassName = "",
}: AWSConfigDialogProps) {
  const {
    isConfigured,
    isConnecting,
    error,
    config,
    testConnection,
    getConnectionStatus,
    refreshConnection,
  } = useAWSConfig();

  const [isOpen, setIsOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Checking...");

  // Update connection status when dialog opens or configuration changes
  useEffect(() => {
    if (isOpen) {
      updateConnectionStatus();
    }
  }, [isOpen, isConfigured, error]);

  const updateConnectionStatus = async () => {
    try {
      const status = await getConnectionStatus();
      setConnectionStatus(status);
    } catch {
      setConnectionStatus("Error checking status");
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? "Connected" : "Connection failed");
    } catch (err) {
      setConnectionStatus("Test failed");
      console.error("Connection test failed:", err);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRefreshConnection = async () => {
    await refreshConnection();
    await updateConnectionStatus();
  };

  const getStatusIcon = () => {
    if (isConnecting || isTestingConnection) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (isConfigured && !error) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isConnecting) return "Connecting";
    if (isConfigured && !error) return "Connected";
    if (error) return "Error";
    return "Not Configured";
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" => {
    if (isConnecting || isTestingConnection) return "secondary";
    if (isConfigured && !error) return "default";
    return "destructive";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${triggerClassName}`}
              >
                <Database className="h-4 w-4" />
                AWS
                <Badge variant={getStatusVariant()} className="ml-1">
                  {getStatusIcon()}
                  {getStatusText()}
                </Badge>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isConfigured
                ? "AWS Cognito authentication active"
                : "Configure AWS connection"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            AWS Configuration
          </DialogTitle>
          <DialogDescription>
            Connection status and configuration details for AWS DynamoDB access
            via Amazon Cognito Identity Pools.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Connection Status</h3>
              <Badge variant={getStatusVariant()} className="gap-2">
                {getStatusIcon()}
                {connectionStatus}
              </Badge>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            {isConfigured && !error && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-950 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-200">
                  Successfully connected to AWS DynamoDB using Cognito Identity
                  Pool authentication.
                </p>
              </div>
            )}
          </div>

          {/* Configuration Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">AWS Region:</span>
                <span className="font-mono">{config?.region || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Identity Pool ID:</span>
                <span className="font-mono text-xs">
                  {config?.identityPoolId
                    ? `${config.identityPoolId.substring(0, 20)}...`
                    : "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DynamoDB Table:</span>
                <span className="font-mono">
                  {config?.tableName || "Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={!isConfigured || isTestingConnection}
              variant="outline"
              className="flex-1"
            >
              {isTestingConnection ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              onClick={handleRefreshConnection}
              disabled={isConnecting}
              variant="outline"
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          {/* Help Information */}
          <div className="bg-muted/50 rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h4 className="font-medium text-sm">Configuration Help</h4>
            </div>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                This application uses Amazon Cognito Identity Pools for secure,
                temporary AWS credentials. No permanent access keys required.
              </p>

              <div className="space-y-1">
                <p>
                  <strong>Required Environment Variables:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <code>VITE_AWS_REGION</code> - AWS region (e.g., us-west-2)
                  </li>
                  <li>
                    <code>VITE_AWS_IDENTITY_POOL_ID</code> - Cognito Identity
                    Pool ID
                  </li>
                  <li>
                    <code>VITE_SITEMAP_TABLE_NAME</code> - DynamoDB table name
                  </li>
                </ul>
              </div>

              <p>
                Get these values from your Terraform output by running:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  terraform output dashboard_environment_variables
                </code>
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 p-2 h-auto"
              onClick={() => {
                window.open(
                  "https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html",
                  "_blank",
                );
              }}
            >
              <ExternalLink className="h-3 w-3" />
              Learn about Cognito Identity Pools
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
