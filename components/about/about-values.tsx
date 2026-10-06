"use client";

import type { PointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Layers, Scale, ShieldCheck, Users } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** One icon per value card, in the dictionary's order. */
const ICONS = [ShieldCheck, Users, Scale, Layers];

type Value = { title: string; body: string; proof: string };

/**
 * What she cares about, as a compact grid of cards with the same cursor-lit border as the stat
 * cards and project tiles. Each card carries a line of evidence from her work.
 */
export function AboutValues({ label, values }: { label: string; values: Value[] }) {
  const reduce = useReducedMotion();

  // Cursor light along each card's border, as on the other panels.
  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>("[data-tile]")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{label}</p>
      <ul onPointerMove={onMove} className="project-grid grid gap-3 sm:grid-cols-2">
        {values.map((v, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <motion.li
              key={v.title}
              data-tile
              initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
              className="project-tile group relative flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-4 backdrop-blur-sm transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/30 motion-reduce:hover:translate-y-0"
            >
              {/* Dotted corner texture and a soft glow, clipped on their own layer. */}
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[14px_14px] opacity-70 mask-[radial-gradient(ellipse_60%_80%_at_100%_0%,black,transparent)] rtl:mask-[radial-gradient(ellipse_60%_80%_at_0%_0%,black,transparent)]" />
                <div className="absolute -top-12 -end-12 size-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              {/* Icon beside the title, so each card stays short. */}
              <div className="relative flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-linear-to-br from-primary/20 to-primary/5 text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="text-[15px] font-semibold tracking-tight">{v.title}</h3>
              </div>
              <p className="relative text-pretty text-sm leading-snug text-muted-foreground">{v.body}</p>
              <p className="relative mt-auto flex items-start gap-1.5 pt-0.5 font-mono text-[10px] uppercase tracking-wider text-primary/90">
                <span aria-hidden className="mt-[3px] size-1.5 shrink-0 rounded-full bg-primary" />
                {v.proof}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
