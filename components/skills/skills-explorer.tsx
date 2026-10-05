"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useContent, useT } from "@/components/i18n/locale-provider";
import { TechGlyph, techColor } from "@/components/icons/tech-icons";
import type { Skill } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};
const tile: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

/**
 * Skills as an explorer: pick an area on the side, and its tools fan into a "terminal" panel as
 * logo tiles whose borders catch a light that follows the cursor. Underneath, the whole stack
 * drifts past in two rows; clicking a tool there jumps to its area.
 */
export function SkillsExplorer() {
  const t = useT();
  const { skillCategories } = useContent();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const category = skillCategories[active];

  const select = (i: number, focus = false) => {
    const next = (i + skillCategories.length) % skillCategories.length;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  // Arrow keys move between areas (mirrored for right-to-left), Home/End jump to the ends.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    if (step) select(i + step, true);
    else if (e.key === "Home") select(0, true);
    else if (e.key === "End") select(skillCategories.length - 1, true);
    else return;
    e.preventDefault();
  };

  // Each tile gets the cursor's position relative to itself, for its border spotlight.
  const onGridMove = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>("[data-tile]")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };

  const all = skillCategories.flatMap((c, i) => c.skills.map((s) => ({ skill: s, area: i })));
  const half = Math.ceil(all.length / 2);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8">
        {/* The areas: a scrolling row of chips on phones, a vertical rail on large screens. */}
        <div
          role="tablist"
          aria-label={t.skills.categories}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {skillCategories.map((c, i) => {
            const selected = i === active;
            return (
              <button
                key={c.key}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`skills-tab-${c.key}`}
                aria-selected={selected}
                aria-controls="skills-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className="group relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-start transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:py-4"
              >
                {selected && (
                  <motion.span
                    layoutId="skills-active-tab"
                    aria-hidden
                    className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/8 shadow-[0_14px_40px_-22px] shadow-primary/70"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={cn(
                    "relative font-mono text-xs tabular-nums transition-colors",
                    selected ? "text-primary" : "text-muted-foreground/70 group-hover:text-muted-foreground",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap transition-colors lg:text-base",
                      selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {c.title}
                  </span>
                  <span className="hidden text-xs text-muted-foreground lg:block">{t.skills.count(c.skills.length)}</span>
                </span>
                {/* A peek at the area's first few logos. */}
                <span aria-hidden className="relative hidden -space-x-2 lg:flex rtl:space-x-reverse">
                  {c.skills.slice(0, 3).map((s) => (
                    <span
                      key={s.name}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border border-border bg-card transition-transform",
                        selected && "group-hover:-translate-y-0.5",
                      )}
                    >
                      <TechGlyph icon={s.icon} className="size-3.5" />
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* The panel: a small terminal window holding the area's tools. */}
        <div
          role="tabpanel"
          id="skills-panel"
          aria-labelledby={`skills-tab-${category.key}`}
          className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-50px] shadow-primary/40"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_80%_70%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 start-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl rtl:translate-x-1/2"
          />

          <div className="relative flex items-center gap-3 border-b border-border px-5 py-3">
            <span aria-hidden className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-primary/60" />
            </span>
            <span dir="ltr" className="truncate font-mono text-xs text-muted-foreground">
              ~/stack/
              {/* Keyed by area, so switching areas types the new folder name from the start. */}
              <TypedWord key={category.key} word={category.key} className="text-primary" />
              <span aria-hidden className="ms-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-primary/70" />
            </span>
            <span className="ms-auto shrink-0 font-mono text-xs text-muted-foreground">
              {t.skills.count(category.skills.length)}
            </span>
          </div>

          <div className="relative p-4 sm:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={category.key}
                variants={grid}
                initial={reduce ? false : "hidden"}
                animate="show"
                exit={reduce ? undefined : "exit"}
                className="flex flex-col gap-5"
              >
                <motion.p variants={tile} className="max-w-xl text-sm text-pretty text-muted-foreground">
                  {category.description}
                </motion.p>
                <ul onPointerMove={onGridMove} className="skill-grid grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                  {category.skills.map((s, i) => (
                    <SkillTile key={s.name} skill={s} index={i} />
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* The whole stack drifting past; hovering pauses it, and a tool opens its area above. */}
      <div aria-label={t.skills.everything} role="group" className="marquee flex flex-col gap-3" dir="ltr">
        <MarqueeRow items={all.slice(0, half)} onPick={select} activeArea={active} />
        <MarqueeRow items={all.slice(half)} onPick={select} activeArea={active} reverse />
      </div>
    </div>
  );
}

/** How long each typed character takes (ms). */
const TYPE_MS = 55;

/**
 * Types a word out one character at a time, like a path being entered at a prompt. Remount it
 * (via `key`) to type a new word. With reduced motion it shows the word straight away; screen
 * readers always get the whole word.
 */
function TypedWord({ word, className }: { word: string; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= word.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [word, reduce]);

  return (
    <span className={className}>
      <span className="sr-only">{word}</span>
      <span aria-hidden>{reduce ? word : word.slice(0, shown)}</span>
    </span>
  );
}

function SkillTile({ skill, index }: { skill: Skill; index: number }) {
  return (
    <motion.li
      variants={tile}
      data-tile
      style={{ "--brand": techColor(skill.icon) } as CSSProperties}
      className="skill-tile group/tile relative flex flex-col gap-4 rounded-xl border border-border bg-background/70 p-3.5 backdrop-blur-sm transition-[translate,box-shadow] duration-300 hover:-translate-y-1 sm:p-4"
    >
      <div className="relative z-10 flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-[color-mix(in_oklch,var(--brand)_12%,transparent)] transition-transform duration-300 group-hover/tile:scale-110 group-hover/tile:-rotate-6">
          <TechGlyph icon={skill.icon} className="size-5" />
        </span>
        <span aria-hidden className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <span className="relative z-10 text-sm leading-tight font-medium">{skill.name}</span>
    </motion.li>
  );
}

function MarqueeRow({
  items,
  onPick,
  activeArea,
  reverse = false,
}: {
  items: { skill: Skill; area: number }[];
  onPick: (area: number) => void;
  activeArea: number;
  reverse?: boolean;
}) {
  // Two identical copies side by side; the track slides by one copy's width, then loops.
  const copy = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-3 pe-3">
      {items.map(({ skill, area }) => (
        <li key={skill.name}>
          <button
            type="button"
            tabIndex={hidden ? -1 : undefined}
            onClick={() => onPick(area)}
            className={cn(
              "flex items-center gap-2 rounded-full border bg-card/60 px-4 py-2 text-sm whitespace-nowrap backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              area === activeArea ? "border-primary/30 text-foreground" : "border-border text-muted-foreground",
            )}
          >
            <TechGlyph icon={skill.icon} className="size-4" />
            {skill.name}
          </button>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee-row overflow-hidden">
      <div className={cn("marquee-track flex w-max", reverse && "marquee-reverse")}>
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
