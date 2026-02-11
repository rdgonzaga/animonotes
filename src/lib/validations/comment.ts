import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
  isAnonymous: z.boolean().optional().default(false),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
