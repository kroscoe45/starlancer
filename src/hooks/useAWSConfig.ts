// src/hooks/useAWSConfig.ts
import { useEffect, useState, useRef } from "react";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  dashboardLogger,
  logConfigChange,
  logDataOperation,
} from "@/lib/logger";

export interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface UseAWSConfigReturn {
  dynamoClient: DynamoDBDocumentClient | null;
  isConfigured: boolean;
  error: string | null;
  configure: (config: AWSConfig) => Promise<void>;
  testConnection: () => Promise<boolean>;
  getConnectionStatus: () => Promise<string>;
}

// Single configuration source - environment variables
const DEFAULT_CONFIG: AWSConfig = {
  region: import.meta.env.VITE_AWS_REGION || "us-west-2",
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
};

export function useAWSConfig(): UseAWSConfigReturn {
  const [dynamoClient, setDynamoClient] =
    useState<DynamoDBDocumentClient | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef<AWSConfig>(DEFAULT_CONFIG);

  const parseAWSError = (error: any): string => {
    if (error?.name === "ExpiredTokenException") {
      return "AWS session token has expired. Please refresh your credentials.";
    }
    if (error?.name === "InvalidSignatureException") {
      return "AWS credentials are invalid. Please check your Access Key ID and Secret Access Key.";
    }
    if (error?.name === "SignatureDoesNotMatchException") {
      return "AWS signature mismatch. Please verify your Secret Access Key is correct.";
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

      // Try to scan a small amount from the sitemap table
      const tableName =
        import.meta.env.VITE_SITEMAP_TABLE_NAME || "website-sitemaps";
      const command = new ScanCommand({
        TableName: tableName,
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

      // Validate required credentials
      if (
        !configRef.current.accessKeyId ||
        !configRef.current.secretAccessKey
      ) {
        throw new Error("Access Key ID and Secret Access Key are required");
      }

      logConfigChange(
        "useAWSConfig",
        "credentials_updated",
        {
          region: configRef.current.region,
          hasAccessKeyId: !!configRef.current.accessKeyId,
          hasSecretKey: !!configRef.current.secretAccessKey,
          configurationMethod: "static_credentials",
        },
        {
          region: oldConfig.region,
          hasAccessKeyId: !!oldConfig.accessKeyId,
          hasSecretKey: !!oldConfig.secretAccessKey,
        },
      );

      // Create credentials object
      const credentials = {
        accessKeyId: configRef.current.accessKeyId,
        secretAccessKey: configRef.current.secretAccessKey,
      };

      logDataOperation("useAWSConfig", "using_static_credentials", {
        credentialType: "permanent",
      });

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

      // Create a test client to avoid chicken-and-egg with testConnection
      const testCommand = new ScanCommand({
        TableName:
          import.meta.env.VITE_SITEMAP_TABLE_NAME || "website-sitemaps",
        Limit: 1,
      });

      await docClient.send(testCommand);

      setIsConfigured(true);
      logDataOperation("useAWSConfig", "configuration_successful");
    } catch (err) {
      const errorMessage = parseAWSError(err);
      setError(errorMessage);
      setIsConfigured(false);
      setDynamoClient(null);

      dashboardLogger.logError(
        "useAWSConfig",
        "configuration_failed",
        err as Error,
        {
          parsedError: errorMessage,
          configRegion: configRef.current.region,
          hasAccessKeyId: !!configRef.current.accessKeyId,
          hasSecretKey: !!configRef.current.secretAccessKey,
        },
      );
    }
  };

  // Auto-configure on mount if environment variables are available
  useEffect(() => {
    logDataOperation("useAWSConfig", "hook_mounted", {
      hasEnvAccessKeyId: !!DEFAULT_CONFIG.accessKeyId,
      hasEnvSecretKey: !!DEFAULT_CONFIG.secretAccessKey,
      region: DEFAULT_CONFIG.region,
    });

    if (
      !isConfigured &&
      DEFAULT_CONFIG.accessKeyId &&
      DEFAULT_CONFIG.secretAccessKey
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
