import OnlyCreators from "@/components/OnlyCreators/OnlyCreators";
import CreatorApplicationsClient from "@/components/creator-applications/CreatorApplicationsClient/CreatorApplicationsClient";
import type { Metadata } from "next";

import "./page.scss";

export const metadata: Metadata = {
  title: "Creator Applications | Phlote",
};

export default function CreatorApplicationsPage() {
  return (
    <OnlyCreators className="creator-applications">
      <CreatorApplicationsClient />
    </OnlyCreators>
  );
}
