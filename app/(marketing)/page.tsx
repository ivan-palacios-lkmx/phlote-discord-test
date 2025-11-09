import { components } from "@/components/slices";
import { SliceZone } from "@prismicio/react";

import { createClient } from "../../prismicio";

export default async function Home() {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return <SliceZone slices={settings.data.body} components={components} />;
}
