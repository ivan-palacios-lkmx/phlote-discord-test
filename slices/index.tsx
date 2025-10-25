import type { SliceZoneComponents, SliceComponentProps } from "@prismicio/react";

function DefaultSlice({ slice }: SliceComponentProps) {
  return (
    <section className="p-6">
      <div className="text-sm font-mono opacity-70">{slice.slice_type}</div>
      <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(slice, null, 2)}</pre>
    </section>
  );
}

// Temporary: render all slice types with a default inspector until real components are mapped
export const components: SliceZoneComponents = new Proxy(
  {},
  {
    get: () => DefaultSlice,
  }
) as unknown as SliceZoneComponents;
