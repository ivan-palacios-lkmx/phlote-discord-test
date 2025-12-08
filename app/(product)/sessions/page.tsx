import OnlyMembers from "@/components/OnlyMembers/OnlyMembers";
import SessionsPageClient from "@/components/session/SessionsPageClient/SessionsPageClient";
import { createClient } from "@/prismicio";

export default async function SessionsPage() {
  const client = createClient();
  let prismicPage = null;

  try {
    prismicPage = await client.getSingle("sessions");
  } catch (error) {
    console.error("Error fetching sessions page from Prismic:", error);
  }

  return (
    <OnlyMembers>
      <SessionsPageClient prismicPage={prismicPage} />
    </OnlyMembers>
  );
}
