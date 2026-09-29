"use client";

import { useId, useState } from "react";
import { CalendarDays, ChevronDown, CircleCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExperienceItem } from "@/lib/types";

function formatRange(start: string, end: string | null) {
  return `${start} — ${end ?? "Present"}`;
}

/** Collapsible experience entry — header always visible, contributions and stack revealed on click. */
export function ExperienceCard({ item, defaultOpen = false }: { item: ExperienceItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const hasDetails = item.responsibilities.length > 0 || item.technologies.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm transition-colors duration-300",
        open ? "border-primary/40" : "border-border hover:border-primary/30"
      )}
    >
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        aria-expanded={hasDetails ? open : undefined}
        aria-controls={hasDetails ? panelId : undefined}
        disabled={!hasDetails}
        className="flex w-full flex-col gap-3 rounded-xl p-6 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:cursor-pointer"
      >
        <div className="flex w-full flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{item.role}</h3>
            <p className="text-sm font-medium text-primary">{item.organization}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {item.location}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary">
              <CalendarDays className="size-3" />
              {formatRange(item.startDate, item.endDate)}
            </span>
            {hasDetails && (
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
                  open && "rotate-180 text-primary"
                )}
                aria-hidden="true"
              >
                <ChevronDown className="size-4" />
              </span>
            )}
          </div>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Type: {item.employmentType} · {item.locationType}
        </p>

        {item.summary && (
          <p className="text-pretty text-sm leading-relaxed text-foreground/85">{item.summary}</p>
        )}

        {hasDetails && !open && (
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
            Show contributions & stack
          </span>
        )}
      </button>

      {hasDetails && (
        <div
          id={panelId}
          role="region"
          aria-label={`${item.role} at ${item.organization} — details`}
          hidden={!open}
          className="flex flex-col gap-4 px-6 pb-6"
        >
          {item.responsibilities.length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="flex flex-col gap-2.5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Key Contributions
                </p>
                <ul className="flex flex-col gap-2">
                  {item.responsibilities.map((r) => (
                    <li key={r} className="flex gap-2.5 text-sm text-foreground/85">
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-pretty leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {item.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.technologies.map((t) => (
                <Badge key={t} variant="secondary" className="font-mono text-[11px] font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {item.isPlaceholder && (
        <p className="px-6 pb-6 font-mono text-[11px] text-muted-foreground/70">
          Organization name and dates are placeholders — update in data/experience.ts
        </p>
      )}
    </div>
  );
}
