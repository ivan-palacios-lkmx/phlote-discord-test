import * as prismic from "@prismicio/client";
import * as prismicNext from "@prismicio/next";

export const repositoryName = process.env.NEXT_PUBLIC_PRISMIC_REPOSITORY ?? "REPLACE_WITH_REPO";

export function createClient(config: prismic.ClientConfig = {}) {
  if (!repositoryName || repositoryName === "REPLACE_WITH_REPO") {
    // Intentionally throw to surface misconfiguration early during dev
    throw new Error("Set NEXT_PUBLIC_PRISMIC_REPOSITORY to your Prismic repo short name.");
  }
  const client = prismic.createClient(repositoryName, { ...config });
  prismicNext.enableAutoPreviews({ client });
  return client;
}
