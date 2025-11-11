import SessionDetailClient from "@/components/session/SessionDetailClient/SessionDetailClient";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { pick } from "lodash";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface SessionDetailPageProps {
  params: Promise<{
    sessionID: string;
  }>;
}

export async function generateMetadata({ params }: SessionDetailPageProps): Promise<Metadata> {
  const { sessionID } = await params;

  try {
    const sessionDoc = await getDoc(doc(db, `sessions/${sessionID}`));
    const sessionData = sessionDoc.data();

    if (!sessionData?.name) {
      return {
        title: "Session Not Found | Phlote",
      };
    }

    const title = `${sessionData.name} | Phlote`;
    const ogImage = sessionData.ogImage || "";

    return {
      title,
      openGraph: {
        title,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Session | Phlote",
    };
  }
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { sessionID } = await params;

  try {
    const sessionDoc = await getDoc(doc(db, `sessions/${sessionID}`));
    const sessionData = sessionDoc.data();

    if (!sessionData?.name) {
      notFound();
    }

    const pickedData = pick(sessionData, ["name", "ogImage"]);

    return (
      <SessionDetailClient
        sessionID={sessionID}
        initialSessionName={pickedData.name as string | undefined}
        initialOgImage={pickedData.ogImage as string | undefined}
      />
    );
  } catch (error) {
    console.error("Error fetching session:", error);
    notFound();
  }
}
