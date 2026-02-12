import { NextRequest } from 'next/server';
import { sseBroadcaster } from '@/lib/sse-broadcaster';
import { auth } from '@/features/auth/lib/auth';

/**
 * GET /api/sse - Server-Sent Events endpoint
 * Establishes real-time connection for live updates
 *
 * Query params:
 * - channels: Comma-separated list of channels to subscribe to (e.g., "post-123,comments-123")
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  // Get channels from query params
  const { searchParams } = new URL(request.url);
  const channelsParam = searchParams.get('channels') || '';
  const channels = channelsParam ? channelsParam.split(',').filter(Boolean) : [];

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Register connection with broadcaster
      const connectionId = sseBroadcaster.addConnection(controller, channels, userId);

      // Send initial connection event
      const welcomeMessage = `event: connected\ndata: ${JSON.stringify({
        connectionId,
        channels,
        userId: userId || null,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(welcomeMessage));

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        sseBroadcaster.removeConnection(connectionId);
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
