import type { ReactNode } from "react";
import { ChevronRight, FileText, GraduationCap, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/hero/avatar";
import { getI18n } from "@/lib/i18n/server";

/**
 * The card's `irsha.config.ts` snippet: facts the hero beside it doesn't already state. (The
 * intro covers government/public platforms and "grounded" AI; the stat cards cover what shipped.)
 */
const CONFIG: { key: string; value: string | string[] }[] = [
  { key: "role", value: ["Software Engineer", "AI Researcher"] },
  { key: "stack", value: ["TypeScript", "Python"] },
  { key: "research", value: "Honest AI decision support" },
  { key: "exploring", value: "LLM deployment & AI safety" },
  { key: "values", value: ["reliable", "calibrated", "transparent"] },
];

/**
 * `action` replaces the decorative "LIVE" chip in the window bar (e.g. the "Ask AI" button);
 * `footer` sits at the bottom of the card (e.g. the "Ask my AI" prompt).
 */
export async function HeroTerminalCard({ action, footer }: { action?: ReactNode; footer?: ReactNode }) {
  const { site } = (await getI18n()).content;
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
          {/* Beside her photo: name and credentials (her role is the first line of the config below). */}
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
            <p className="font-semibold leading-tight">{site.name}</p>
            <ul className="flex flex-wrap gap-1.5">
              {site.credentials.map(({ icon, label }) => {
                const Icon = icon === "paper" ? FileText : GraduationCap;
                return (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                  >
                    <Icon className="size-3" aria-hidden />
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-[oklch(0.16_0.01_260)] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[11px]">
            <span className="flex items-center gap-0.5 text-neutral-500">
              <ChevronRight className="size-3" /> system.env
            </span>
            {/* A build status rather than a fact, since the card's header already gives the time zone. */}
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" />
              compiled
            </span>
          </div>
          {/* Phones are too narrow for the longest lines (role, values), so there they wrap, with a
              hanging indent so a wrapped value still reads as part of its key. */}
          <pre
            dir="ltr"
            className="overflow-x-auto text-left font-mono text-[10.5px] leading-relaxed whitespace-pre-wrap text-neutral-300 sm:text-[12px] sm:whitespace-pre"
          >
            <code>
              <span className="text-purple-400">const</span> irsha = {"{"}
              {CONFIG.map(({ key, value }) => (
                <span key={key} className="block pl-[4ch] -indent-[2ch]">
                  <span className="text-neutral-300">{key}</span>:{" "}
                  {Array.isArray(value) ? (
                    <>
                      <span className="text-yellow-400">[</span>
                      {value.map((v, i) => (
                        <span key={v}>
                          <span className="text-yellow-400">&quot;{v}&quot;</span>
                          {i < value.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      <span className="text-yellow-400">]</span>
                    </>
                  ) : (
                    <span className="text-green-400">&quot;{value}&quot;</span>
                  )}
                  ,
                </span>
              ))}
              {"}"};
            </code>
          </pre>
        </div>

        {footer}
      </div>
    </div>
  );
}
