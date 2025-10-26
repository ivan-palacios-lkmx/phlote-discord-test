"use client";

import Input from "@/components/ui/Input";

export default function NewsletterForm() {
  return (
    <div className="newsletter-form mt-10">
      <form className="flex flex-col items-center gap-4 sm:flex-row">
        <Input type="email" placeholder="Email Address" className="w-full" />
        <button
          type="submit"
          className="rounded-lg bg-white px-6 py-2 font-mono uppercase text-black transition-colors hover:bg-gray-200">
          Subscribe
        </button>
      </form>
    </div>
  );
}
