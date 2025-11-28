import { z } from "zod";

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const addressSchema = address;

const visibility = z.enum(["public", "private"]).optional();
export const visibilitySchema = visibility;

const name = z.string().nullable().optional();
const email = z.string().email().optional();
const twitterHandle = z.string().nullable().optional();
const discordHandle = z.string().nullable().optional();
const discordUserID = z.string().nullable().optional();
const dmChannel = z.string().nullable().optional();
const title = z.string().optional();

export const contactSchema = z.object({
  name,
  email,
  twitterHandle,
  discordHandle,
  discordUserID,
  dmChannel,
});

export const memberCardSchema = z.object({
  isPublic: z.boolean().optional(),
  name,
  title,
  twitterHandle,
  email,
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

const audioProcessingStatus = z.enum(["pending", "processing", "ready", "failed"]);
const audioProcessingStatusResponse = z.object({
  id: z.string(),
  status: audioProcessingStatus,
});
const newVersionStems = z.array(audioProcessingStatusResponse).optional();
export const newVersionStemsSchema = newVersionStems;

const newVersionBounce = audioProcessingStatusResponse.optional();
export const newVersionBounceSchema = newVersionBounce;

export const newVersionFormSchema = z.object({
  name: newVersionName,
  bpm: newVersionBpm,
  notes: newVersionNotes,
  sourceVersion: newVersionSourceVersion,
  catModels: newVersionCatModels,
  stems: newVersionStems,
  bounce: newVersionBounce,
});

const newsletterEmail = z.string().email();
export const newsletterFormSchema = z.object({
  email: newsletterEmail,
});

const firstName = z.string().min(1, "First name is required");
const lastName = z.string().min(1, "Last name is required");
const city = z.string().min(1, "City is required");
const info = z.string().optional();
const workLink = z.string().optional();
const ethAddress = addressSchema;
const tracks = z.array(
  z.object({
    name: z.string().min(1, "Name is required"),
    id: z.string().min(1, "ID is required"),
  }),
);

const applicationEmail = z.string().email().min(1, "Email is required");

export const applicationFormSchema = z.object({
  firstName,
  lastName,
  email: applicationEmail,
  city,
  info,
  workLink,
  ethAddress,
  tracks,
});

export const addAdminSchema = z.object({
  address: addressSchema,
});
