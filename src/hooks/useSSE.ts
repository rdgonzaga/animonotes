'use client';

import { useEffect, useRef, useCallback } from 'react';

export type SSEEventHandler = (data: unknown) => void;

export interface UseSSEOptions {
  channels?: string[];
  onConnected?: () => void;
  onError?: (error: Event) => void;
  onDisconnected?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  enabled?: boolean;
}

/**
 * Hook for subscribing to Server-Sent Events
 *
 * @param eventType - The event type to listen for (e.g., "vote-update", "comment-new")
 * @param handler - Callback function to handle incoming events
 * @param options - Configuration options
 *
 * @example
 * useSSE('vote-update', (data) => {
 *   console.log('Vote updated:', data);
 * }, { channels: ['post-123'] });
 */
export function useSSE(eventType: string, handler: SSEEventHandler, options: UseSSEOptions = {}) {
  const {
    channels = [],
    onConnected,
    onError,
    onDisconnected,
    reconnect = true,
    reconnectInterval = 3000,
    enabled = true,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualCloseRef = useRef(false);

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Build SSE URL with channels
    const url = new URL('/api/sse', window.location.origin);
    if (channels.length > 0) {
      url.searchParams.set('channels', channels.join(','));
    }

    // Create new EventSource
    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;

    // Handle connection established
    eventSource.addEventListener('connected', () => {
      console.log('[SSE] Connected to server');
      onConnected?.();
    });

    // Handle specific event type
    eventSource.addEventListener(eventType, (event) => {
      try {
        const data = JSON.parse(event.data);
        handler(data);
      } catch (error) {
        console.error('[SSE] Failed to parse event data:', error);
      }
    });

    // Handle errors - suppress noisy logs, only warn once
    let errorLogged = false;
    eventSource.onerror = (error) => {
      if (!errorLogged) {
        console.warn('[SSE] Connection unavailable - real-time updates disabled');
        errorLogged = true;
      }
      onError?.(error);

      if (eventSource.readyState === EventSource.CLOSED) {
        onDisconnected?.();

        // Attempt reconnection if enabled and not manually closed
        // Use exponential backoff: 5s, 10s, 20s, max 60s
        if (reconnect && !isManualCloseRef.current) {
          const backoff = Math.min(reconnectInterval * 2, 60000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoff);
        }
      }
    };

    return eventSource;
  }, [
    eventType,
    handler,
    channels,
    onConnected,
    onError,
    onDisconnected,
    reconnect,
    reconnectInterval,
    enabled,
  ]);

  // Establish connection on mount
  useEffect(() => {
    if (!enabled) {
      isManualCloseRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      return;
    }

    isManualCloseRef.current = false;
    connect();

    // Cleanup on unmount
    return () => {
      isManualCloseRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect, enabled]);

  // Return connection control methods
  return {
    close: () => {
      isManualCloseRef.current = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    },
    reconnect: () => {
      connect();
    },
  };
}
