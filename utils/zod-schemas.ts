import { z } from "zod";

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const addressSchema = address;

const visibility = z.enum(["public", "private"]).optional();
export const visibilitySchema = visibility;

const name = z.string().optional();
const email = z.string().email().optional();
const twitterHandle = z.string().optional();
const discordHandle = z.string().optional();
const discordUserID = z.string().optional();
const dmChannel = z.string().optional();

export const contactSchema = z.object({
  name,
  email,
  twitterHandle,
  discordHandle,
  discordUserID,
  dmChannel,
});

const audioAction = z.enum(["play", "download"]);
export const audioActionSchema = audioAction;

const activityType = z.enum(["PLAY", "DOWNLOAD"]);
export const activityTypeSchema = activityType;

const isAddressMember = z.boolean();
export const isAddressMemberSchema = isAddressMember;

const addressAvatar = z.string().optional();
export const addressAvatarSchema = addressAvatar;

export const createAddressSchema = z.object({
  address,
  isAddressMember,
  addressAvatar,
});

const role = z.enum(["admin", "creator", "member"]);
export const roleSchema = role;

const title = z.string().optional();
export const titleSchema = title;

const tags = z.array(z.string()).optional();
export const tagsSchema = tags;
