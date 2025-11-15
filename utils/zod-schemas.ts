import { z } from "zod";

export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const visibilitySchema = z.enum(["public", "private"]).optional();
