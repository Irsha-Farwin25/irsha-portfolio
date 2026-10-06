"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";
import { useT } from "@/components/i18n/locale-provider";

export function ResumeLink({
  available,
  variant = "outline",
  size,
  label,
  className,
}: {
  available: boolean;
  variant?: "outline" | "default" | "ghost";
  size?: "default" | "sm" | "lg";
  /** Defaults to "Resume" in the visitor's language. */
  label?: string;
  className?: string;
}) {
  const t = useT();
  label ??= t.resume.label;
  // No resume PDF yet: show nothing rather than a disabled "coming soon" button.
  if (!available) return null;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      nativeButton={false}
      render={
        <a href={site.resumeUrl} download>
          <FileDown data-icon="inline-start" /> {label}
        </a>
      }
    />
  );
}
