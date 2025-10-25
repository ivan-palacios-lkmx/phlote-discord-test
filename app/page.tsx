import { SliceZone } from "@prismicio/react";
import { createClient } from "../prismicio";
import { components } from "@/components/slices";

export default async function Home() {
  const client = createClient();
  const settings = await client.getSingle("settings");


  return (
    <div className="front-page pb-[150px]">
      <SliceZone slices={settings.data.body} components={components} />
    </div>
  );
}
