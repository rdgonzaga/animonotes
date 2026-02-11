import { z } from "zod";

// Schema for creating anonymous posts
export const createAnonymousPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
});

// Schema for updating anonymous posts (owner verification via cookie)
export const updateAnonymousPostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
});

// Schema for creating anonymous comments
export const createAnonymousCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  parentId: z.string().optional(), // For threaded replies
});

export type CreateAnonymousPostInput = z.infer<typeof createAnonymousPostSchema>;
export type UpdateAnonymousPostInput = z.infer<typeof updateAnonymousPostSchema>;
export type CreateAnonymousCommentInput = z.infer<typeof createAnonymousCommentSchema>;
