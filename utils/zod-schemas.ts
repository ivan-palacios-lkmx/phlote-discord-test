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

const bounce = z.string();
export const bounceSchema = bounce;

const stems = z.array(z.string());
export const stemsSchema = stems;

const notes = z.string().optional();
export const notesSchema = notes;

const bpm = z.number();
export const bpmSchema = bpm;

export const sessionDetailsSchema = z.object({
  creator: address,
  name: name,
  bounce: bounce,
  stems: stems,
  notes: notes,
  tags: tags,
  bpm: bpm,
});

export const allowedAudioFileExtensions = z.enum(["audio/wav", "audio/mp3", "audio/mpeg"]);
export const allowedAudioFileExtensionsSchema = allowedAudioFileExtensions;

export const versionDetailsSchema = z.object({
  creator: address,
  name: name,
  bounce: bounce,
  stems: stems,
  notes: notes,
  tags: tags,
  bpm: bpm,
});

const tagCategory = z.enum(["member", "session"]).optional();

export const tagCategorySchema = tagCategory;

const tagName = z.string();
export const createTagSchema = z.object({
  tagName,
  tagCategory,
});

export const updateTagSchema = z.object({
  oldTagName: tagName,
  newTagName: tagName,
  tagCategory,
});

export const deleteTagSchema = z.object({
  tagName,
  tagCategory,
});

const slug = z.string();
export const slugSchema = slug;

export const updateAddressSchema = z.object({
  slug,
  role,
  address,
});

const newVersionName = z.string().min(1, "Name is required");
export const newVersionNameSchema = newVersionName;

const newVersionBpm = z.coerce.number().min(1, "BPM must be at least 1");
export const newVersionBpmSchema = newVersionBpm;

const newVersionNotes = z.string().optional();
export const newVersionNotesSchema = newVersionNotes;

const newVersionSourceVersion = z.string().optional();
export const newVersionSourceVersionSchema = newVersionSourceVersion;

const newVersionCatModels = z.record(z.string()).optional();
export const newVersionCatModelsSchema = newVersionCatModels;

export const newVersionFormSchema = z.object({
  name: newVersionName,
  bpm: newVersionBpm,
  notes: newVersionNotes,
  sourceVersion: newVersionSourceVersion,
  catModels: newVersionCatModels,
});
