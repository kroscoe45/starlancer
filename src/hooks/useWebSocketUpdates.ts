// src/hooks/useWebSocketUpdates.ts
import { useEffect, useRef, useCallback, useState } from 'react';

export interface WebSocketUpdate {
  type: 'sitemap_update' | 'scraping_status';
  website_domain: string;
  data: any;
  timestamp: number;
}

interface UseWebSocketUpdatesReturn {
  isConnected: boolean;
  lastUpdate: WebSocketUpdate | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WEBSOCKET_ENDPOINT = import.meta.env.VITE_WEBSOCKET_ENDPOINT || '';
const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocketUpdates(onUpdate?: (update: WebSocketUpdate) => void): UseWebSocketUpdatesReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<WebSocketUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const update: WebSocketUpdate = JSON.parse(event.data);
      
      if (update.type && update.website_domain) {
        setLastUpdate(update);
        setError(null);
        onUpdate?.(update);
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  }, [onUpdate]);

  const connect = useCallback(() => {
    if (!WEBSOCKET_ENDPOINT) {
      setError('WebSocket endpoint not configured');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    clearReconnectTimeout();
    setError(null);

    try {
      const ws = new WebSocket(WEBSOCKET_ENDPOINT);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        setError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        
        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... attempt ${reconnectAttemptsRef.current}`);
            connect();
          }, RECONNECT_INTERVAL);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError('Max reconnection attempts reached');
        }
      };

    } catch (err) {
      setError(`Failed to create WebSocket connection: ${err}`);
    }
  }, [clearReconnectTimeout, handleMessage]);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    reconnectAttemptsRef.current = 0;

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setError(null);
  }, [clearReconnectTimeout]);

  // Auto-connect on mount if endpoint is available
  useEffect(() => {
    if (WEBSOCKET_ENDPOINT) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    error,
    connect,
    disconnect,
  };
}
