import { prisma } from '@/lib/prisma';
import { sseBroadcaster } from '@/lib/sse-broadcaster';
import type { Prisma } from '@prisma/client';

export type NotificationType =
  | 'comment_reply'
  | 'vote'
  | 'mention'
  | 'poll_end'
  | 'dm'
  | 'report_resolved';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  data: Prisma.InputJsonValue;
}

/**
 * Create a notification and broadcast it via SSE
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, data } = params;

  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      data,
    },
  });

  // Broadcast notification via SSE to the specific user
  sseBroadcaster.broadcast({
    type: 'notification',
    data: notification,
    userId, // Only send to this specific user
  });

  return notification;
}

/**
 * Create notification for comment reply
 */
export async function notifyCommentReply(params: {
  recipientId: string;
  commentId: string;
  postId: string;
  authorName: string;
  content: string;
}) {
  return createNotification({
    userId: params.recipientId,
    type: 'comment_reply',
    data: {
      commentId: params.commentId,
      postId: params.postId,
      authorName: params.authorName,
      content: params.content.substring(0, 100), // Preview
    },
  });
}

/**
 * Create notification for vote on user's content
 */
export async function notifyVote(params: {
  recipientId: string;
  targetType: 'post' | 'comment';
  targetId: string;
  voterName: string;
}) {
  return createNotification({
    userId: params.recipientId,
    type: 'vote',
    data: {
      targetType: params.targetType,
      targetId: params.targetId,
      voterName: params.voterName,
    },
  });
}
