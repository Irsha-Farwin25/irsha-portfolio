"use client";

import { useState, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, ArrowUpRight, Binary, Brain, Building2, Landmark } from "lucide-react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";
import { ProjectDialog } from "@/components/projects/project-dialog";

const categoryIcon: Record<string, typeof Brain> = {
  "Web Platform": Building2,
  "AI / Research": Brain,
  "Government Tech": Landmark,
};

const EASE = [0.22, 1, 0.36, 1] as const;

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const row: Variants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};
const panel: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** The live site's host, shown in the browser frame's address bar. */
function hostOf(url?: string) {
  try {
    return url && url !== "#" ? new URL(url).host : undefined;
  } catch {
    return undefined;
  }
}

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Projects as an index: a numbered list on one side and a live preview on the other. Hovering or
 * focusing a project swaps the preview (screenshot in a small browser window, details beneath);
 * clicking opens its case study. On small screens the list stands alone, each row with a thumbnail.
 */
export function ProjectShowcase({ projects }: { projects: Project[] }) {
  const t = useT();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const project = projects[active];
  const Icon = categoryIcon[project.category] ?? Binary;

  // The preview's border catches a light that follows the cursor, as the skill tiles do.
  const onPreviewMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const swap = reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 1.04 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      };
  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
        exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
      };

  return (
    <>
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      className="project-grid grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8"
    >
      {/* The preview: large screens only. */}
      <motion.div variants={panel} className="hidden lg:block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          onPointerMove={onPreviewMove}
          aria-label={`${project.title} — ${t.projects.viewDetails}`}
          aria-haspopup="dialog"
          className="project-tile group relative flex w-full cursor-pointer flex-col rounded-2xl text-start border border-border bg-card p-2 shadow-[0_30px_80px_-50px] shadow-primary/40 transition-[box-shadow,border-color] duration-300 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <div className="relative overflow-hidden rounded-xl border border-border bg-secondary/50">
            <div className="flex items-center gap-3 border-b border-border bg-background/70 px-3 py-2 backdrop-blur-sm">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-primary/60 transition-colors duration-300 group-hover:bg-primary" />
              </span>
              <span
                dir="ltr"
                className="min-w-0 flex-1 truncate rounded-md bg-secondary/70 px-2 py-0.5 text-center font-mono text-[10px] text-muted-foreground"
              >
                {hostOf(project.liveUrl) ?? project.slug}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/70 tabular-nums">
                {pad(active)} / {pad(projects.length - 1)}
              </span>
            </div>

            <div className="relative aspect-[16/9] overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div key={project.slug} {...swap} className="absolute inset-0">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={t.projects.screenshot(project.title)}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/5 to-transparent">
                      <Icon className="size-12 text-primary/50" strokeWidth={1.25} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {/* A sheen that sweeps across the screenshot on hover. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-out group-hover:left-full group-hover:opacity-100 motion-reduce:hidden"
              />
            </div>
          </div>

          {/* Fixed-height details, so swapping projects never shifts the layout. */}
          <div className="relative h-44 overflow-hidden px-4 pt-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={project.slug} {...fade} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                    {project.category}
                  </span>
                  {project.isPlaceholder && (
                    <span className="rounded-full border border-dashed border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {t.projects.sample}
                    </span>
                  )}
                  <span className="ms-auto inline-flex translate-x-2 items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl:-translate-x-2 rtl:group-hover:translate-x-0">
                    {t.projects.viewDetails}
                    <ArrowRight className="size-3 rtl:-scale-x-100" />
                  </span>
                </div>
                <h3 className="truncate text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary">
                  {project.title}
                </h3>
                <p className="line-clamp-2 text-pretty text-sm text-muted-foreground">{project.description}</p>
                <div className="flex h-6 flex-wrap gap-1.5 overflow-hidden">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </button>
      </motion.div>

      {/* The index. */}
      <motion.ul variants={list} className="flex flex-col gap-1">
        {projects.map((p, i) => {
          const selected = i === active;
          return (
            <motion.li key={p.slug} variants={row}>
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setOpen(true);
                }}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-label={`${p.title} — ${t.projects.viewDetails}`}
                aria-haspopup="dialog"
                className="group relative flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-3 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-4"
              >
                {selected && (
                  <motion.span
                    layoutId="project-active-row"
                    aria-hidden
                    className="absolute inset-0 hidden rounded-xl border border-primary/40 bg-primary/8 shadow-[0_14px_40px_-22px] shadow-primary/70 lg:block"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={cn(
                    "relative font-mono text-xs text-muted-foreground/70 tabular-nums transition-colors",
                    selected && "lg:text-primary"
                  )}
                >
                  {pad(i)}
                </span>
                {/* Thumbnail: small screens, where there's no preview panel. */}
                {p.image && (
                  <span className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-md border border-border lg:hidden">
                    <Image src={p.image} alt="" fill sizes="80px" className="object-cover object-top" />
                  </span>
                )}
                <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "truncate text-sm font-semibold transition-colors sm:text-base",
                      selected ? "text-foreground" : "text-foreground lg:text-muted-foreground lg:group-hover:text-foreground"
                    )}
                  >
                    {p.title}
                  </span>
                  <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {p.category} · {p.technologies.slice(0, 2).join(" · ")}
                  </span>
                </span>
                <span
                  className={cn(
                    "relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:text-primary rtl:-scale-x-100",
                    selected && "lg:rotate-45 lg:border-primary lg:bg-primary lg:text-primary-foreground lg:group-hover:text-primary-foreground"
                  )}
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>

    <ProjectDialog projects={projects} index={active} open={open} onOpenChange={setOpen} onIndexChange={setActive} />
    </>
  );
}
