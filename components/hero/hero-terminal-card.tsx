import type { ReactNode } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/hero/avatar";
import { getI18n } from "@/lib/i18n/server";

/** The card's `irsha.config.ts` snippet: facts the hero beside it doesn't already state. */
const CONFIG: { key: string; value: string | string[] }[] = [
  { key: "stack", value: ["TypeScript", "Python"] },
  { key: "research", value: "Honest AI decision support" },
  { key: "shipped", value: "GovTech & public platforms" },
  { key: "values", value: ["grounded", "reliable", "calibrated"] },
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
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-semibold">{site.name}</p>
            <p className="text-pretty text-xs leading-relaxed text-primary">{site.role}</p>
          </div>
        </div>

        <div className="rounded-xl bg-[oklch(0.16_0.01_260)] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[11px]">
            <span className="flex items-center gap-0.5 text-neutral-500">
              <ChevronRight className="size-3" /> system.env
            </span>
            <span className="text-amber-400">TypeScript &middot; Python</span>
          </div>
          <pre dir="ltr" className="overflow-x-auto text-left font-mono text-[12px] leading-relaxed text-neutral-300">
            <code>
              <span className="text-purple-400">const</span> irsha = {"{"}
              {"\n"}
              {CONFIG.map(({ key, value }) => (
                <span key={key}>
                  {"  "}
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
                  ,{"\n"}
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
