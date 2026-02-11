/**
 * SSE (Server-Sent Events) Broadcaster
 * Manages connections and broadcasts real-time events to clients
 */

type SSEConnection = {
  controller: ReadableStreamDefaultController;
  channels: Set<string>;
  userId?: string;
};

type SSEEvent = {
  type: string;
  data: unknown;
  channel?: string;
  userId?: string;
};

class SSEBroadcaster {
  private connections: Map<string, SSEConnection> = new Map();
  private connectionIdCounter = 0;

  /**
   * Register a new SSE connection
   */
  addConnection(
    controller: ReadableStreamDefaultController,
    channels: string[] = [],
    userId?: string
  ): string {
    const connectionId = `sse-${++this.connectionIdCounter}-${Date.now()}`;
    
    this.connections.set(connectionId, {
      controller,
      channels: new Set(channels),
      userId,
    });

    console.log(`[SSE] New connection: ${connectionId}, channels: ${channels.join(', ')}, userId: ${userId || 'anonymous'}`);
    
    return connectionId;
  }

  /**
   * Remove a connection
   */
  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        connection.controller.close();
      } catch {
        // Controller might already be closed
      }
      this.connections.delete(connectionId);
      console.log(`[SSE] Connection closed: ${connectionId}`);
    }
  }

  /**
   * Subscribe a connection to additional channels
   */
  subscribe(connectionId: string, channels: string[]) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      channels.forEach(channel => connection.channels.add(channel));
      console.log(`[SSE] ${connectionId} subscribed to: ${channels.join(', ')}`);
    }
  }

  /**
   * Unsubscribe a connection from channels
   */
  unsubscribe(connectionId: string, channels: string[]) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      channels.forEach(channel => connection.channels.delete(channel));
      console.log(`[SSE] ${connectionId} unsubscribed from: ${channels.join(', ')}`);
    }
  }

  /**
   * Broadcast an event to all matching connections
   */
  broadcast(event: SSEEvent) {
    const { type, data, channel, userId } = event;
    
    let sentCount = 0;
    
    this.connections.forEach((connection, connectionId) => {
      // Filter by channel if specified
      if (channel && !connection.channels.has(channel)) {
        return;
      }

      // Filter by userId if specified (for user-specific notifications)
      if (userId && connection.userId !== userId) {
        return;
      }

      try {
        const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        connection.controller.enqueue(new TextEncoder().encode(message));
        sentCount++;
      } catch (error) {
        console.error(`[SSE] Failed to send to ${connectionId}:`, error);
        // Remove broken connection
        this.removeConnection(connectionId);
      }
    });

    if (sentCount > 0) {
      console.log(`[SSE] Broadcasted ${type} to ${sentCount} connection(s)${channel ? ` on channel: ${channel}` : ''}${userId ? ` for user: ${userId}` : ''}`);
    }
  }

  /**
   * Send keepalive ping to all connections
   */
  sendKeepalive() {
    this.connections.forEach((connection, connectionId) => {
      try {
        connection.controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
      } catch {
        this.removeConnection(connectionId);
      }
    });
  }

  /**
   * Get connection count for monitoring
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get connections by channel
   */
  getChannelConnections(channel: string): number {
    return Array.from(this.connections.values()).filter(
      conn => conn.channels.has(channel)
    ).length;
  }
}

// Singleton instance
export const sseBroadcaster = new SSEBroadcaster();

// Start keepalive interval (every 30 seconds)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    sseBroadcaster.sendKeepalive();
  }, 30000);
}
