import { SliceZone } from "@prismicio/react";
import { createClient } from "../../prismicio";
import { components } from "@/components/slices";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const client = createClient();

  try {
    // MIGRATED: Get prismic data by UID (equivalent to getByUID in Vue)
    const page = await client.getByUID("page", params.slug);

    // MIGRATED: Extract slices from page body (equivalent to computed slices)
    const slices = page.data.body || [];

    return (
      <main className="page">
        {/* MIGRATED: Prismic slices rendering */}
        <SliceZone slices={slices} components={components} />
      </main>
    );
  } catch (error) {
    // MIGRATED: 404 handling (equivalent to createError in Vue)
    notFound();
  }
}
