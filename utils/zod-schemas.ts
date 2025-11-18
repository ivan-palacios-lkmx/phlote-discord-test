import { z } from "zod";

export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const visibilitySchema = z.enum(["public", "private"]).optional();

export const contactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  twitterHandle: z.string().optional(),
  discordHandle: z.string().optional(),
  discordUserID: z.string().optional(),
  dmChannel: z.string().optional(),
});
