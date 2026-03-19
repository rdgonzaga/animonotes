import { z } from "zod";

// Report management
export const updateReportStatusSchema = z.object({
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]),
  action: z
    .enum(["delete_post", "delete_comment", "ban_user", "warn_user", "none"])
    .optional(),
  reason: z.string().min(10).max(500).optional(),
});
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;

// User management
export const setUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "moderator", "admin"]),
});
export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;

export const banUserSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(10).max(500),
  duration: z.number().positive().optional(), // days; omit for permanent
});
export type BanUserInput = z.infer<typeof banUserSchema>;

// Category management
export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().max(200).optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const mergeCategoriesSchema = z
  .object({
    sourceId: z.string().min(1),
    targetId: z.string().min(1),
  })
  .refine((data) => data.sourceId !== data.targetId, {
    message: "Source and target categories must be different",
  });
export type MergeCategoriesInput = z.infer<typeof mergeCategoriesSchema>;

// Announcement management
export const createAnnouncementSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(500),
  type: z.enum(["info", "warning", "urgent"]),
  endsAt: z.string().datetime().optional(),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(10).max(500).optional(),
  type: z.enum(["info", "warning", "urgent"]).optional(),
  isActive: z.boolean().optional(),
  endsAt: z.string().datetime().optional().nullable(),
});
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

// Post pinning
export const pinPostSchema = z.object({
  postId: z.string().cuid(),
  isPinned: z.boolean(),
});
export type PinPostInput = z.infer<typeof pinPostSchema>;

// Trash management
export const hardDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50),
  type: z.enum(["post", "comment", "user"]),
});
export type HardDeleteInput = z.infer<typeof hardDeleteSchema>;

export const restoreItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["post", "comment", "user"]),
});
export type RestoreItemInput = z.infer<typeof restoreItemSchema>;

// Audit log filtering
export const auditLogFilterSchema = z.object({
  action: z.string().optional(),
  actorId: z.string().optional(),
  targetType: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;
