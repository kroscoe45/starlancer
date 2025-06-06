// src/hooks/useAWSData.ts
import { useEffect, useState, useCallback } from 'react';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

export interface WebsiteData {
  website_domain: string;
  sitemap: Record<string, string[]>;
  last_updated: number;
  artist_name?: string;
  art_mediums?: string[];
  art_themes?: string[];
}

interface UseAWSDataReturn {
  data: WebsiteData[];
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-west-2',
  identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID || '',
  tableName: import.meta.env.VITE_SITEMAP_TABLE_NAME || 'website-sitemaps',
};

export function useAWSData(): UseAWSDataReturn {
  const [data, setData] = useState<WebsiteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamoClient, setDynamoClient] = useState<DynamoDBDocumentClient | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const initializeClient = useCallback(async () => {
    try {
      if (!AWS_CONFIG.identityPoolId) {
        throw new Error('AWS Identity Pool ID not configured');
      }

      const credentials = fromCognitoIdentityPool({
        identityPoolId: AWS_CONFIG.identityPoolId,
        clientConfig: { region: AWS_CONFIG.region },
      });

      const dbClient = new DynamoDBClient({
        region: AWS_CONFIG.region,
        credentials,
        maxAttempts: 3,
        retryMode: 'adaptive',
      });

      const docClient = DynamoDBDocumentClient.from(dbClient);

      // Test connection
      await docClient.send(new ScanCommand({
        TableName: AWS_CONFIG.tableName,
        Limit: 1,
      }));

      setDynamoClient(docClient);
      setIsConfigured(true);
      setError(null);
      
      return docClient;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setIsConfigured(false);
      throw error;
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = dynamoClient || await initializeClient();

      const response = await client.send(new ScanCommand({
        TableName: AWS_CONFIG.tableName,
      }));

      const items = response.Items || [];
      const websites: WebsiteData[] = items.map(item => ({
        website_domain: item.website_domain || '',
        sitemap: item.sitemap || {},
        last_updated: item.last_updated || Date.now() / 1000,
        artist_name: item.artist_name,
        art_mediums: item.art_mediums,
        art_themes: item.art_themes,
      }));

      setData(websites);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [dynamoClient, initializeClient]);

  const refreshData = useCallback(async () => {
    if (isConfigured) {
      await loadData();
    }
  }, [isConfigured, loadData]);

  // Initialize on mount
  useEffect(() => {
    if (AWS_CONFIG.identityPoolId && !isConfigured) {
      initializeClient().catch(() => {
        // Error already handled in initializeClient
      });
    }
  }, [AWS_CONFIG.identityPoolId, isConfigured, initializeClient]);

  return {
    data,
    loading,
    error,
    isConfigured,
    loadData,
    refreshData,
  };
}
