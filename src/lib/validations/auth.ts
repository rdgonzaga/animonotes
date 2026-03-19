import { z } from 'zod';

export const dlsuGoogleAuthSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .refine((email) => email.toLowerCase().endsWith('@dlsu.edu.ph'), {
      message: 'Only @dlsu.edu.ph emails are allowed',
    }),
});

export type DlsuGoogleAuthInput = z.infer<typeof dlsuGoogleAuthSchema>;
