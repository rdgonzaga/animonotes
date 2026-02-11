import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

export const createConversationSchema = z.object({
  recipientId: z.string().cuid("Invalid user ID"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
