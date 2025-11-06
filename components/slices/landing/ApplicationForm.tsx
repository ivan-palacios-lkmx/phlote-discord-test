"use client";

import type { ApplicationFormSlice } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";

export default function ApplicationForm({ slice }: SliceComponentProps<ApplicationFormSlice>) {
  return (
    <section className="slice-application-form mx-auto px-4 max-w-[1600px] my-24">
      <div className="mx-auto max-w-[1000px]">
        {/* Application form content will be implemented here */}
        <div className="p-6 border border-white/20 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Application Form</h2>
          <p className="text-gray-400">Form implementation coming soon...</p>
        </div>
      </div>
    </section>
  );
}
