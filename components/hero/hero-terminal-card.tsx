import type { ReactNode } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/hero/avatar";
import { site } from "@/data/site";

/** `action` replaces the decorative "LIVE" chip in the window bar (e.g. the "Ask AI" button). */
export function HeroTerminalCard({ action }: { action?: ReactNode }) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-black/5 bg-card shadow-xl shadow-foreground/10 dark:border-white/5">
      <div className="grid grid-cols-3 items-center px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="justify-self-center whitespace-nowrap font-mono text-xs text-muted-foreground">
          irsha.config.ts
        </span>
        {action ? (
          <div className="justify-self-end">{action}</div>
        ) : (
          <span className="justify-self-end rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            LIVE
          </span>
        )}
      </div>
      <div className="mx-4 border-t border-border/50" aria-hidden="true" />

      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar size={56} className="rounded-xl" />
            <span className="absolute -bottom-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
              <ShieldCheck className="size-3" />
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-semibold">{site.name}</p>
            <p className="text-pretty text-xs leading-relaxed text-primary">{site.role}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-chart-4/30 bg-chart-4/10 px-2 py-0.5 font-mono text-[10px] text-chart-4">
              <span className="size-1.5 rounded-full bg-chart-4" />
              {site.statusPill}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-[oklch(0.16_0.01_260)] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[11px]">
            <span className="flex items-center gap-0.5 text-neutral-500">
              <ChevronRight className="size-3" /> system.env
            </span>
            <span className="text-amber-400">TypeScript &middot; Python</span>
          </div>
          <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-neutral-300">
            <code>
              <span className="text-purple-400">const</span> engineer = {"{"}
              {"\n"}
              {"  "}
              <span className="text-neutral-300">domain</span>: <span className="text-green-400">&quot;Artificial Intelligence&quot;</span>,{"\n"}
              {"  "}
              <span className="text-neutral-300">focus</span>: <span className="text-yellow-400">[</span>
              {site.focusAreas.map((area, i) => (
                <span key={area}>
                  <span className="text-yellow-400">&quot;{area}&quot;</span>
                  {i < site.focusAreas.length - 1 ? ", " : ""}
                </span>
              ))}
              <span className="text-yellow-400">]</span>,{"\n"}
              {"  "}
              <span className="text-neutral-300">currently</span>: <span className="text-cyan-400">&quot;{site.currentlyShort}&quot;</span>,{"\n"}
              {"  "}
              <span className="text-neutral-300">status</span>: <span className="text-green-400">&quot;Building &amp; learning&quot;</span>,{"\n"}
              {"}"};
            </code>
          </pre>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0 rounded-lg bg-secondary/60 px-3.5 py-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Focus</p>
            <p className="mt-1 text-sm font-medium">AI &amp; Full-Stack</p>
          </div>
          <div className="min-w-0 rounded-lg bg-secondary/60 px-3.5 py-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Currently</p>
            <p className="mt-1 text-pretty text-sm font-medium leading-snug">{site.currentlyFocus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
