import { z } from 'zod';

export const contactSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable(),
  lastInteraction: z.date().nullable(),
  lastInteractionType: z.string().nullable(),
  notes: z.string().nullable(),
});

export type Contact = z.infer<typeof contactSchema>;
