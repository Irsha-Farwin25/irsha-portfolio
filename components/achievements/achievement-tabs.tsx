"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AchievementTab {
  value: string;
  label: string;
  icon: ReactNode;
  count: number;
  content: ReactNode;
}

/** Pill tab bar with a sliding highlight and animated panel transitions. */
export function AchievementTabs({ tabs }: { tabs: AchievementTab[] }) {
  const [active, setActive] = useState(tabs[0]?.value);
  const reduceMotion = useReducedMotion();
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs.find((t) => t.value === active) ?? tabs[0];

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + tabs.length) % tabs.length;
    setActive(tabs[next].value);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="Achievements"
          className="inline-flex gap-1 rounded-full border border-border bg-secondary/40 p-1"
        >
          {tabs.map((t, i) => {
            const selected = t.value === current.value;
            return (
              <button
                key={t.value}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`${id}-tab-${t.value}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.value)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  "relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4",
                  selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId={`${id}-pill`}
                    className="absolute inset-0 rounded-full bg-primary shadow-sm"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {t.icon}
                  {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 font-mono text-[10px] leading-4 tabular-nums",
                      selected ? "bg-primary-foreground/20" : "bg-border/60"
                    )}
                  >
                    {t.count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.value}
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${current.value}`}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {current.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
