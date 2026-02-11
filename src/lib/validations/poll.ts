import { z } from "zod";

export const createPollSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters").max(200, "Question too long"),
  options: z
    .array(z.string().min(1, "Option cannot be empty").max(100, "Option too long"))
    .min(2, "Poll must have at least 2 options")
    .max(10, "Poll cannot have more than 10 options"),
  endsAt: z.string().datetime().optional(),
});

export const votePollSchema = z.object({
  optionId: z.string().cuid("Invalid option ID"),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type VotePollInput = z.infer<typeof votePollSchema>;
