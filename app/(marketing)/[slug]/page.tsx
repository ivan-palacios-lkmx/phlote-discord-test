import { components } from "@/components/slices";
import { SliceZone } from "@prismicio/react";
import { notFound } from "next/navigation";

import { createClient } from "../../../prismicio";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const client = createClient();

  try {
    const page = await client.getByUID("page", params.slug);

    const slices = page.data.body || [];

    return (
      <div className="page">
        <SliceZone slices={slices} components={components} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
