// src/hooks/useAWSConfig.ts
import { useEffect, useState, useRef } from "react";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  dashboardLogger,
  logConfigChange,
  logDataOperation,
} from "@/lib/logger";

interface AWSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  // Legacy Cognito support (optional)
  identityPoolId?: string;
  userPoolId?: string;
  userPoolWebClientId?: string;
}

interface UseAWSConfigReturn {
  dynamoClient: DynamoDBDocumentClient | null;
  isConfigured: boolean;
  error: string | null;
  configure: (config: AWSConfig) => Promise<void>;
  testConnection: () => Promise<boolean>;
  getConnectionStatus: () => Promise<string>;
}

// Default configuration - you can override these via environment variables or the configure method
const DEFAULT_CONFIG: AWSConfig = {
  region: import.meta.env.VITE_AWS_REGION || "us-west-2",
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
  identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID,
  userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
};

export function useAWSConfig(): UseAWSConfigReturn {
  const [dynamoClient, setDynamoClient] =
    useState<DynamoDBDocumentClient | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef<AWSConfig>(DEFAULT_CONFIG);

  const parseAWSError = (error: any): string => {
    if (error?.name === "ExpiredTokenException") {
      return "AWS session token has expired. Please refresh your temporary credentials.";
    }
    if (error?.name === "InvalidSignatureException") {
      return "AWS credentials are invalid. Please check your Access Key ID and Secret Access Key.";
    }
    if (error?.name === "SignatureDoesNotMatchException") {
      return "AWS signature mismatch. Please verify your Secret Access Key is correct.";
    }
    if (error?.name === "TokenRefreshRequiredException") {
      return "AWS token needs to be refreshed. Please update your session token.";
    }
    if (error?.name === "UnrecognizedClientException") {
      return "AWS credentials not recognized. Please check your Access Key ID.";
    }
    if (error?.name === "AccessDeniedException") {
      return "AWS access denied. Please check your IAM permissions for DynamoDB access.";
    }
    if (error?.name === "CredentialsProviderError") {
      return "AWS credentials provider error. Please check your credential configuration.";
    }
    if (error?.message?.includes("Unable to locate credentials")) {
      return "No AWS credentials found. Please configure your Access Key and Secret Key.";
    }
    if (error?.message?.includes("expired")) {
      return "AWS credentials have expired. Please update your credentials.";
    }

    return error?.message || "Unknown AWS error occurred";
  };

  const testConnection = async (): Promise<boolean> => {
    if (!dynamoClient) {
      logDataOperation("useAWSConfig", "test_connection_no_client");
      return false;
    }

    try {
      logDataOperation("useAWSConfig", "test_connection_started");

      // Try to list tables or scan a small amount from a known table
      const command = new ScanCommand({
        TableName: "website-sitemaps",
        Limit: 1, // Just get one item to test connection
      });

      await dynamoClient.send(command);

      logDataOperation("useAWSConfig", "test_connection_success");
      return true;
    } catch (err) {
      const errorMessage = parseAWSError(err);
      dashboardLogger.logError(
        "useAWSConfig",
        "test_connection_failed",
        err as Error,
        {
          parsedError: errorMessage,
          configRegion: configRef.current.region,
          hasAccessKeyId: !!configRef.current.accessKeyId,
          hasSecretKey: !!configRef.current.secretAccessKey,
          hasSessionToken: !!configRef.current.sessionToken,
        },
      );
      return false;
    }
  };

  const getConnectionStatus = async (): Promise<string> => {
    if (!dynamoClient) {
      return "Not configured";
    }

    try {
      const isConnected = await testConnection();
      return isConnected ? "Connected" : "Connection failed";
    } catch (err) {
      return `Error: ${parseAWSError(err)}`;
    }
  };

  const configure = async (config: AWSConfig) => {
    try {
      setError(null);
      const oldConfig = { ...configRef.current };
      configRef.current = { ...DEFAULT_CONFIG, ...config };

      logConfigChange(
        "useAWSConfig",
        "credentials_updated",
        {
          region: configRef.current.region,
          hasAccessKeyId: !!configRef.current.accessKeyId,
          hasSecretKey: !!configRef.current.secretAccessKey,
          hasSessionToken: !!configRef.current.sessionToken,
          configurationMethod: configRef.current.accessKeyId
            ? "static_credentials"
            : "default_chain",
        },
        {
          region: oldConfig.region,
          hasAccessKeyId: !!oldConfig.accessKeyId,
          hasSecretKey: !!oldConfig.secretAccessKey,
          hasSessionToken: !!oldConfig.sessionToken,
        },
      );

      // Create credentials provider
      let credentials;

      if (configRef.current.accessKeyId && configRef.current.secretAccessKey) {
        // Use static credentials (Access Key + Secret + optional Session Token)
        credentials = {
          accessKeyId: configRef.current.accessKeyId,
          secretAccessKey: configRef.current.secretAccessKey,
          sessionToken: configRef.current.sessionToken, // Optional, for temporary credentials
        };

        logDataOperation("useAWSConfig", "using_static_credentials", {
          hasSessionToken: !!configRef.current.sessionToken,
          credentialType: configRef.current.sessionToken
            ? "temporary"
            : "permanent",
        });
      } else {
        // Fallback to environment variables or IAM role (for development)
        credentials = undefined; // Will use default credential chain
        logDataOperation("useAWSConfig", "using_default_credential_chain");
      }

      // Create DynamoDB client
      const dbClient = new DynamoDBClient({
        region: configRef.current.region,
        credentials,
        // Add retry configuration for better error handling
        maxAttempts: 3,
        retryMode: "adaptive",
      });

      const docClient = DynamoDBDocumentClient.from(dbClient, {
        marshallOptions: {
          convertEmptyValues: false,
          removeUndefinedValues: true,
          convertClassInstanceToMap: false,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      });

      setDynamoClient(docClient);

      // Test the connection immediately
      logDataOperation("useAWSConfig", "testing_new_configuration");
      const testResult = await testConnection();

      if (testResult) {
        setIsConfigured(true);
        logDataOperation("useAWSConfig", "configuration_successful");
      } else {
        setIsConfigured(false);
        setError(
          "Configuration saved but connection test failed. Please check your credentials and permissions.",
        );
      }
    } catch (err) {
      const errorMessage = parseAWSError(err);
      setError(errorMessage);
      setIsConfigured(false);

      dashboardLogger.logError(
        "useAWSConfig",
        "configuration_failed",
        err as Error,
        {
          parsedError: errorMessage,
          configRegion: configRef.current.region,
          hasAccessKeyId: !!configRef.current.accessKeyId,
          hasSecretKey: !!configRef.current.secretAccessKey,
          hasSessionToken: !!configRef.current.sessionToken,
        },
      );
    }
  };

  // Auto-configure on mount if we have the required environment variables
  useEffect(() => {
    logDataOperation("useAWSConfig", "hook_mounted", {
      hasEnvAccessKeyId: !!DEFAULT_CONFIG.accessKeyId,
      hasEnvSecretKey: !!DEFAULT_CONFIG.secretAccessKey,
      hasEnvSessionToken: !!DEFAULT_CONFIG.sessionToken,
      hasEnvIdentityPoolId: !!DEFAULT_CONFIG.identityPoolId,
      region: DEFAULT_CONFIG.region,
    });

    if (
      !isConfigured &&
      (DEFAULT_CONFIG.accessKeyId ||
        DEFAULT_CONFIG.identityPoolId ||
        import.meta.env.DEV)
    ) {
      logDataOperation("useAWSConfig", "auto_configuration_started");
      configure(DEFAULT_CONFIG);
    }
  }, [isConfigured]);

  return {
    dynamoClient,
    isConfigured,
    error,
    configure,
    testConnection,
    getConnectionStatus,
  };
}
