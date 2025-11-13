import { components } from "@/components/slices";
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";

export default async function Home() {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return <SliceZone slices={settings.data.body} components={components} />;
}
