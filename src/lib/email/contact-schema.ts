import { z } from "zod";

export const contactSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(30).regex(/^[+\d\s().-]*$/),
  subject: z.string().trim().max(150),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional().default(""),
});
