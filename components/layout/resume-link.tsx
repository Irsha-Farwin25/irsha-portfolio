import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function ResumeLink({
  available,
  variant = "outline",
  size,
  label = "Resume",
  className,
}: {
  available: boolean;
  variant?: "outline" | "default" | "ghost";
  size?: "default" | "sm" | "lg";
  label?: string;
  className?: string;
}) {
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
        <TooltipContent>Resume coming soon</TooltipContent>
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
