import { z } from "zod";

export const createReportSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason too long"),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  userId: z.string().optional(),
}).refine(
  (data) => data.postId || data.commentId || data.userId,
  { message: "Must report a post, comment, or user" }
);

export type CreateReportInput = z.infer<typeof createReportSchema>;
