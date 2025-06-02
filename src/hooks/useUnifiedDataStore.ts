// src/hooks/useUnifiedDataStore.ts
import { useState, useCallback, useEffect } from 'react';
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { useAWSConfig } from "@/hooks/useAWSConfig";
import { UnifiedWebsiteData } from '@/lib/mockDataGenerator';

interface UseUnifiedDataStoreReturn {
  websites: UnifiedWebsiteData[];
  loading: boolean;
  error: string | null;
  loadAWSData: () => Promise<void>;
  setMockData: (data: UnifiedWebsiteData[]) => void;
  clearData: () => void;
  refreshData: () => Promise<void>;
}

export function useUnifiedDataStore(): UseUnifiedDataStoreReturn {
  const [websites, setWebsites] = useState<UnifiedWebsiteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dynamoClient, isConfigured, error: configError } = useAWSConfig();

  // Transform DynamoDB data to unified format
  const transformDynamoData = useCallback((dynamoItems: any[]): UnifiedWebsiteData[] => {
    return dynamoItems.map((item) => ({
      website_domain: item.website_domain,
      sitemap: item.sitemap || {},
      last_updated: item.last_updated,
      artist_name: item.artist_name || '',
      art_mediums: item.art_mediums || [],
      art_themes: item.art_themes || [],
      source: 'aws' as const
    }));
  }, []);

  // Load data from AWS DynamoDB
  const loadAWSData = useCallback(async () => {
    if (!dynamoClient || !isConfigured) {
      setError("AWS not configured. Please configure your AWS settings.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const command = new ScanCommand({
        TableName: "website-sitemaps",
      });

      const response = await dynamoClient.send(command);
      const items = response.Items || [];

      console.log("Loaded DynamoDB items:", items);

      if (items.length === 0) {
        setError("No website data found in DynamoDB");
        setWebsites([]);
        return;
      }

      // Transform and set data
      const unifiedData = transformDynamoData(items);
      setWebsites(unifiedData);
    } catch (err) {
      console.error("Error loading AWS data:", err);
      setError(err instanceof Error ? err.message : "Failed to load AWS data");
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  }, [dynamoClient, isConfigured, transformDynamoData]);

  // Set mock data (replaces any existing data)
  const setMockData = useCallback((data: UnifiedWebsiteData[]) => {
    setWebsites(data);
    setError(null);
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setWebsites([]);
    setError(null);
  }, []);

  // Refresh current data (re-load AWS if we have AWS data, or do nothing for mock data)
  const refreshData = useCallback(async () => {
    const hasAWSData = websites.some(w => w.source === 'aws');
    if (hasAWSData && dynamoClient && isConfigured) {
      await loadAWSData();
    }
  }, [websites, dynamoClient, isConfigured, loadAWSData]);

  // Set error from config issues
  useEffect(() => {
    if (configError) {
      setError(configError);
    }
  }, [configError]);

  return {
    websites,
    loading,
    error,
    loadAWSData,
    setMockData,
    clearData,
    refreshData
  };
}
