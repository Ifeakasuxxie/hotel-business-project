import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
});
