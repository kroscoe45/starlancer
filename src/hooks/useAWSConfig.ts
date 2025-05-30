// src/hooks/useAWSConfig.ts
import { useEffect, useState, useRef } from "react";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

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

  const configure = async (config: AWSConfig) => {
    try {
      setError(null);
      configRef.current = { ...DEFAULT_CONFIG, ...config };

      // Create credentials provider
      let credentials;

      if (configRef.current.accessKeyId && configRef.current.secretAccessKey) {
        // Use static credentials (Access Key + Secret + optional Session Token)
        credentials = {
          accessKeyId: configRef.current.accessKeyId,
          secretAccessKey: configRef.current.secretAccessKey,
          sessionToken: configRef.current.sessionToken, // Optional, for temporary credentials
        };
      } else {
        // Fallback to environment variables or IAM role (for development)
        credentials = undefined; // Will use default credential chain
      }

      // Create DynamoDB client
      const dbClient = new DynamoDBClient({
        region: configRef.current.region,
        credentials,
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
      setIsConfigured(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error configuring AWS";
      setError(errorMessage);
      console.error("AWS configuration error:", err);
    }
  };

  // Auto-configure on mount if we have the required environment variables
  useEffect(() => {
    if (
      !isConfigured &&
      (DEFAULT_CONFIG.accessKeyId ||
        DEFAULT_CONFIG.identityPoolId ||
        process.env.NODE_ENV === "development")
    ) {
      configure(DEFAULT_CONFIG);
    }
  }, [isConfigured]);

  return {
    dynamoClient,
    isConfigured,
    error,
    configure,
  };
}
