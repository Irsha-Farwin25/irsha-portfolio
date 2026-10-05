"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
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
  if (!available) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant={variant}
              size={size}
              className={cn("cursor-not-allowed opacity-60", className)}
              aria-disabled="true"
            >
              <FileDown data-icon="inline-start" /> {label}
            </Button>
          }
        />
        <TooltipContent>{t.resume.soon}</TooltipContent>
      </Tooltip>
    );
  }

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
