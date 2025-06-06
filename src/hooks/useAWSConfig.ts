// src/hooks/useAWSConfig.ts
import { useEffect, useState, useRef } from "react";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

export interface CognitoConfig {
  region: string;
  identityPoolId: string;
  tableName: string;
}

interface UseAWSConfigReturn {
  dynamoClient: DynamoDBDocumentClient | null;
  isConfigured: boolean;
  isConnecting: boolean;
  error: string | null;
  config: CognitoConfig | null;
  testConnection: () => Promise<boolean>;
  getConnectionStatus: () => Promise<string>;
  refreshConnection: () => Promise<void>;
}

const DEFAULT_CONFIG: CognitoConfig = {
  region: import.meta.env.VITE_AWS_REGION || "us-west-2",
  identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID || "",
  tableName: import.meta.env.VITE_SITEMAP_TABLE_NAME || "website-sitemaps",
};

export function useAWSConfig(): UseAWSConfigReturn {
  const [dynamoClient, setDynamoClient] =
    useState<DynamoDBDocumentClient | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef<CognitoConfig>(DEFAULT_CONFIG);

  const parseAWSError = (error: Error): string => {
    if (error?.name === "ExpiredTokenException") {
      return "AWS session token has expired. Refreshing credentials...";
    }
    if (error?.name === "InvalidIdentityPoolConfigurationException") {
      return "Invalid Cognito Identity Pool configuration. Please check your Identity Pool ID.";
    }
    if (error?.name === "NotAuthorizedException") {
      return "Access denied. The Identity Pool may not allow unauthenticated access.";
    }
    if (error?.name === "AccessDeniedException") {
      return "AWS access denied. Please check IAM permissions for the Identity Pool role.";
    }
    if (error?.name === "ResourceNotFoundException") {
      return "DynamoDB table or Identity Pool not found. Please check your configuration.";
    }
    if (error?.name === "UnknownEndpoint") {
      return "Invalid AWS region. Please check your region configuration.";
    }
    if (error?.message?.includes("Cannot read property")) {
      return "Configuration error. Please check that all required environment variables are set.";
    }
    if (error?.message?.includes("Network")) {
      return "Network error. Please check your internet connection.";
    }

    return error?.message || "Unknown AWS error occurred";
  };

  const validateConfig = (config: CognitoConfig): boolean => {
    if (!config.region) {
      setError("AWS region is required");
      return false;
    }
    if (!config.identityPoolId) {
      setError("Cognito Identity Pool ID is required");
      return false;
    }
    if (!config.tableName) {
      setError("DynamoDB table name is required");
      return false;
    }
    return true;
  };

  const initializeAWSClient = async (
    config: CognitoConfig,
  ): Promise<boolean> => {
    try {
      setError(null);
      setIsConnecting(true);

      // Create credentials using Cognito Identity Pool
      const credentials = fromCognitoIdentityPool({
        identityPoolId: config.identityPoolId,
        clientConfig: {
          region: config.region,
        },
      });

      // Create DynamoDB client with Cognito credentials
      const dbClient = new DynamoDBClient({
        region: config.region,
        credentials,
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

      // Test the connection with a simple scan
      const testCommand = new ScanCommand({
        TableName: config.tableName,
        Limit: 1,
      });

      await docClient.send(testCommand);

      setDynamoClient(docClient);
      setIsConfigured(true);

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMessage = parseAWSError(error);
      setError(errorMessage);
      setIsConfigured(false);
      setDynamoClient(null);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const testConnection = async (): Promise<boolean> => {
    if (!dynamoClient || !configRef.current) {
      return false;
    }

    try {
      const command = new ScanCommand({
        TableName: configRef.current.tableName,
        Limit: 1,
      });
      await dynamoClient.send(command);
      return true;
    } catch {
      return false;
    }
  };

  const getConnectionStatus = async (): Promise<string> => {
    if (!dynamoClient) {
      return "Not configured";
    }

    if (isConnecting) {
      return "Connecting...";
    }

    try {
      const isConnected = await testConnection();
      return isConnected ? "Connected" : "Connection failed";
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return `Error: ${parseAWSError(error)}`;
    }
  };

  const refreshConnection = async (): Promise<void> => {
    if (configRef.current && validateConfig(configRef.current)) {
      await initializeAWSClient(configRef.current);
    }
  };

  // Auto-configure on mount if environment variables are available
  useEffect(() => {
    if (!isConfigured && validateConfig(DEFAULT_CONFIG)) {
      configRef.current = DEFAULT_CONFIG;
      initializeAWSClient(DEFAULT_CONFIG);
    } else if (!DEFAULT_CONFIG.identityPoolId) {
      setError(
        "Cognito Identity Pool ID not found. Please check your environment variables.",
      );
    }
  }, [isConfigured]);

  return {
    dynamoClient,
    isConfigured,
    isConnecting,
    error,
    config: configRef.current,
    testConnection,
    getConnectionStatus,
    refreshConnection,
  };
}
