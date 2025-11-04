"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface NewsletterFormProps {
  buttonText?: string;
}

export default function NewsletterForm({ buttonText = "Subscribe" }: NewsletterFormProps) {
  return (
    <div className="newsletter-form mt-10">
      <form className="flex flex-col items-center gap-4 sm:flex-row">
        <Input type="email" placeholder="Email Address" className="w-full" />
        <Button type="submit" variant="mono">
          {buttonText}
        </Button>
      </form>
    </div>
  );
}
