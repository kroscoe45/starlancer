// src/components/dashboard/AWSConfigDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  TestTube,
  RefreshCw,
  Info,
} from "lucide-react";
import { logClick, logConfigChange, logDataOperation } from "@/lib/logger";

interface AWSConfigDialogProps {
  isConfigured: boolean;
  error: string | null;
  onConfigure: (config: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    identityPoolId?: string;
    userPoolId?: string;
    userPoolWebClientId?: string;
  }) => Promise<void>;
  testConnection?: () => Promise<boolean>;
  getConnectionStatus?: () => Promise<string>;
}

export function AWSConfigDialog({
  isConfigured,
  error,
  onConfigure,
  testConnection,
  getConnectionStatus,
}: AWSConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    region: "us-west-2",
    accessKeyId: "",
    secretAccessKey: "",
    sessionToken: "",
    identityPoolId: "",
    userPoolId: "",
    userPoolWebClientId: "",
  });
  const [showSecrets, setShowSecrets] = useState({
    secretAccessKey: false,
    sessionToken: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  // Load existing environment variables on mount
  useEffect(() => {
    const envConfig = {
      region: import.meta.env.VITE_AWS_REGION || "us-west-2",
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
      sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN || "",
      identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID || "",
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || "",
      userPoolWebClientId:
        import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID || "",
    };

    setFormData(envConfig);

    logDataOperation("AWSConfigDialog", "loaded_env_config", {
      hasEnvAccessKeyId: !!envConfig.accessKeyId,
      hasEnvSecretKey: !!envConfig.secretAccessKey,
      hasEnvSessionToken: !!envConfig.sessionToken,
      region: envConfig.region,
    });
  }, []);

  // Update connection status when dialog opens
  useEffect(() => {
    if (open && getConnectionStatus) {
      getConnectionStatus().then((status) => {
        setConnectionStatus(status);
        logDataOperation("AWSConfigDialog", "connection_status_checked", {
          status,
        });
      });
    }
  }, [open, getConnectionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    logDataOperation("AWSConfigDialog", "configuration_submit_started", {
      hasAccessKeyId: !!formData.accessKeyId,
      hasSecretKey: !!formData.secretAccessKey,
      hasSessionToken: !!formData.sessionToken,
      region: formData.region,
    });

    try {
      await onConfigure(formData);

      // Update connection status after configuration
      if (getConnectionStatus) {
        const newStatus = await getConnectionStatus();
        setConnectionStatus(newStatus);
      }

      setOpen(false);
      logDataOperation("AWSConfigDialog", "configuration_submit_completed");
    } catch (err) {
      console.error("Configuration failed:", err);
      logDataOperation("AWSConfigDialog", "configuration_submit_failed", {
        error: err,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testConnection) return;

    setIsTesting(true);
    logDataOperation("AWSConfigDialog", "test_connection_started");

    try {
      const result = await testConnection();
      const status = result ? "Connection successful!" : "Connection failed";
      setConnectionStatus(status);

      logDataOperation("AWSConfigDialog", "test_connection_completed", {
        success: result,
        status,
      });
    } catch (err) {
      const errorStatus = `Test failed: ${err}`;
      setConnectionStatus(errorStatus);
      logDataOperation("AWSConfigDialog", "test_connection_error", {
        error: err,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (error) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    }

    if (isConfigured) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1">
        <Settings className="h-3 w-3" />
        Not Configured
      </Badge>
    );
  };

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
    logClick("AWSConfigDialog", `toggle_${field}_visibility`, {
      field,
      nowVisible: !showSecrets[field],
    });
  };

  const getErrorAnalysis = (errorMessage: string) => {
    if (errorMessage.includes("expired")) {
      return {
        type: "expired",
        title: "Credentials Expired",
        suggestions: [
          "If using temporary credentials (session token), generate new ones",
          "Check if your AWS access key has an expiration date in IAM",
          "Verify your system clock is accurate (AWS is sensitive to time skew)",
        ],
      };
    }

    if (
      errorMessage.includes("invalid") ||
      errorMessage.includes("signature")
    ) {
      return {
        type: "invalid",
        title: "Invalid Credentials",
        suggestions: [
          "Double-check your Access Key ID for typos",
          "Verify your Secret Access Key is correct",
          "Make sure you're not mixing credentials from different AWS accounts",
        ],
      };
    }

    if (errorMessage.includes("access denied")) {
      return {
        type: "permissions",
        title: "Permission Denied",
        suggestions: [
          "Check IAM permissions for DynamoDB access",
          'Ensure your user/role has "dynamodb:Scan" permission',
          'Verify the table "website-sitemaps" exists in your region',
        ],
      };
    }

    return {
      type: "unknown",
      title: "Unknown Error",
      suggestions: [
        "Check AWS service status for outages",
        "Verify your region is correct",
        "Try regenerating your access keys",
      ],
    };
  };

  const errorAnalysis = error ? getErrorAnalysis(error) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        logClick(
          "AWSConfigDialog",
          newOpen ? "dialog_opened" : "dialog_closed",
          {
            isConfigured,
            hasError: !!error,
          },
        );
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          AWS Config
          {getStatusBadge()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AWS Configuration
            {connectionStatus && (
              <Badge
                variant={
                  connectionStatus.includes("successful") ||
                  connectionStatus.includes("Connected")
                    ? "default"
                    : "secondary"
                }
                className="text-xs"
              >
                {connectionStatus}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Configure your AWS credentials to access DynamoDB data. You can use
            direct AWS credentials (Access Key + Secret + Session Token) or
            Cognito Identity Pool for secure access.
          </DialogDescription>
        </DialogHeader>

        {/* Connection Status and Test */}
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting || !testConnection}
            className="gap-2"
          >
            {isTesting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            Test Connection
          </Button>
          {connectionStatus && (
            <span className="text-sm text-muted-foreground">
              Status: {connectionStatus}
            </span>
          )}
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="border border-destructive/20 rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                {errorAnalysis?.title || "Configuration Error"}
              </span>
            </div>
            <p className="text-sm text-destructive/80">{error}</p>

            {errorAnalysis && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggested fixes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {errorAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-destructive/60">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="region" className="text-sm font-medium">
              AWS Region *
            </label>
            <Input
              id="region"
              placeholder="e.g., us-west-2"
              value={formData.region}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, region: e.target.value }));
                logConfigChange(
                  "AWSConfigDialog",
                  "region_changed",
                  e.target.value,
                );
              }}
              required
            />
          </div>

          {/* Direct AWS Credentials Section */}
          <div className="border rounded-md p-4 space-y-4">
            <h4 className="font-medium text-sm">
              Option 1: Direct AWS Credentials
            </h4>

            <div className="space-y-2">
              <label htmlFor="accessKeyId" className="text-sm font-medium">
                AWS Access Key ID
              </label>
              <Input
                id="accessKeyId"
                placeholder="AKIA..."
                value={formData.accessKeyId}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    accessKeyId: e.target.value,
                  }));
                  logConfigChange("AWSConfigDialog", "access_key_id_changed", {
                    hasValue: !!e.target.value,
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="secretAccessKey" className="text-sm font-medium">
                AWS Secret Access Key
              </label>
              <div className="relative">
                <Input
                  id="secretAccessKey"
                  type={showSecrets.secretAccessKey ? "text" : "password"}
                  placeholder="Enter your secret access key"
                  value={formData.secretAccessKey}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      secretAccessKey: e.target.value,
                    }));
                    logConfigChange(
                      "AWSConfigDialog",
                      "secret_access_key_changed",
                      { hasValue: !!e.target.value },
                    );
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility("secretAccessKey")}
                >
                  {showSecrets.secretAccessKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="sessionToken"
                className="text-sm font-medium flex items-center gap-2"
              >
                AWS Session Token (for temporary credentials)
                <Info className="h-3 w-3 text-muted-foreground" />
              </label>
              <div className="relative">
                <Input
                  id="sessionToken"
                  type={showSecrets.sessionToken ? "text" : "password"}
                  placeholder="Enter your session token (if applicable)"
                  value={formData.sessionToken}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      sessionToken: e.target.value,
                    }));
                    logConfigChange(
                      "AWSConfigDialog",
                      "session_token_changed",
                      { hasValue: !!e.target.value },
                    );
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility("sessionToken")}
                >
                  {showSecrets.sessionToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required if using temporary credentials (STS, MFA, etc.). These
                typically expire after 1-12 hours.
              </p>
            </div>
          </div>

          {/* Cognito Section (Alternative) */}
          <div className="border rounded-md p-4 space-y-4">
            <h4 className="font-medium text-sm">
              Option 2: Cognito Identity Pool (Alternative)
            </h4>

            <div className="space-y-2">
              <label htmlFor="identityPoolId" className="text-sm font-medium">
                Cognito Identity Pool ID
              </label>
              <Input
                id="identityPoolId"
                placeholder="e.g., us-west-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={formData.identityPoolId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    identityPoolId: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="userPoolId" className="text-sm font-medium">
                Cognito User Pool ID
              </label>
              <Input
                id="userPoolId"
                placeholder="e.g., us-west-2_xxxxxxxxx"
                value={formData.userPoolId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    userPoolId: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="userPoolWebClientId"
                className="text-sm font-medium"
              >
                Cognito App Client ID
              </label>
              <Input
                id="userPoolWebClientId"
                placeholder="e.g., xxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.userPoolWebClientId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    userPoolWebClientId: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Debugging Information */}
          <div className="bg-muted/50 rounded-md p-3">
            <h4 className="font-medium text-sm mb-2">Debugging Information</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Current Region: <code>{formData.region}</code>
              </div>
              <div>Has Access Key: {formData.accessKeyId ? "✓" : "✗"}</div>
              <div>Has Secret Key: {formData.secretAccessKey ? "✓" : "✗"}</div>
              <div>
                Has Session Token:{" "}
                {formData.sessionToken
                  ? "✓ (temporary creds)"
                  : "✗ (permanent creds)"}
              </div>
              <div>
                Configuration Status:{" "}
                {isConfigured ? "Configured" : "Not Configured"}
              </div>
              <div>Connection Status: {connectionStatus || "Unknown"}</div>
            </div>
          </div>

          {/* Environment Variables Info */}
          <div className="bg-muted/50 rounded-md p-3">
            <h4 className="font-medium text-sm mb-2">
              Environment Variables (Alternative)
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                <code>VITE_AWS_REGION</code> - AWS Region
              </div>
              <div>
                <code>VITE_AWS_ACCESS_KEY_ID</code> - AWS Access Key ID
              </div>
              <div>
                <code>VITE_AWS_SECRET_ACCESS_KEY</code> - AWS Secret Access Key
              </div>
              <div>
                <code>VITE_AWS_SESSION_TOKEN</code> - AWS Session Token
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Configuring..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
