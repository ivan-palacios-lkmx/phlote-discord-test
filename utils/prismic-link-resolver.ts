import type { FilledContentRelationshipField } from "@prismicio/client";

export default function linkResolver(doc: FilledContentRelationshipField): string {
  if (!doc || doc === null || doc === undefined) {
    return "/not-found";
  }

  if (doc.isBroken) {
    return "/not-found";
  }

  if (doc.type === "settings" || doc.type === "navigation") {
    return "/";
  }

  const identifier = doc.uid || doc.slug || null;

  if (identifier && typeof identifier === "string") {
    return `/${identifier}`;
  }

  return "/not-found";
}
