"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Check, FileText, Presentation } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand-icons";
import { useContent, useT } from "@/components/i18n/locale-provider";
import { isPlaceholder } from "@/lib/i18n/content";
import type { ExperimentStatus, LabExperiment, Publication } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
// Terminal lines arrive one after another, as if typed.
const line: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

/** A paper's journey; the status marks how far along it is. */
const STAGES: Publication["status"][] = ["In Progress", "Submitted", "Accepted", "Presented"];

const statusStyles: Record<ExperimentStatus, { text: string; dot: string }> = {
  Research: { text: "text-chart-2 border-chart-2/40", dot: "bg-chart-2" },
  Prototype: { text: "text-chart-3 border-chart-3/40", dot: "bg-chart-3" },
  Experiment: { text: "text-primary border-primary/40", dot: "bg-primary" },
  "In Development": { text: "text-chart-4 border-chart-4/40", dot: "bg-chart-4" },
};

const real = (url?: string) => !!url && url !== "#";
/** Placeholder text is written as "[…]"; show it without the brackets. */
const unbracket = (text: string) => (isPlaceholder(text) ? text.trim().slice(1, -1) : text);

/** What the lab's prompt types, in turn. */
const COMMANDS = ["run next-experiment", "train --model vision", "eval --suite llm-apps", "git push origin research"];

/**
 * Types each line, pauses, erases it, then moves on to the next. Starts once on screen; with
 * reduced motion it just shows the first line.
 */
function Typewriter({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [erasing, setErasing] = useState(false);
  const full = lines[index];

  useEffect(() => {
    if (!inView || reduce) return;
    let delay = erasing ? 35 : 75;
    if (!erasing && length === full.length) delay = 2200;
    if (erasing && length === 0) delay = 400;
    const id = setTimeout(() => {
      if (!erasing && length === full.length) setErasing(true);
      else if (erasing && length === 0) {
        setErasing(false);
        setIndex((i) => (i + 1) % lines.length);
      } else setLength((n) => n + (erasing ? -1 : 1));
    }, delay);
    return () => clearTimeout(id);
  }, [inView, reduce, erasing, length, full, lines.length]);

  return (
    <span ref={ref} aria-label={lines[0]}>
      <span aria-hidden>{reduce ? lines[0] : full.slice(0, length)}</span>
    </span>
  );
}

// Each card's border catches a light that follows the cursor, as the skill tiles do.
const trackCursor = (e: PointerEvent<HTMLElement>) => {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/**
 * Research & AI Lab on the home page: the featured paper with its progress through review on one
 * side, and the lab's experiments as lines in a small terminal on the other.
 */
export function ResearchShowcase() {
  const { publications, labExperiments } = useContent();
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={stagger}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      className="project-grid grid items-stretch gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8"
    >
      <div className="flex flex-col gap-6">
        {publications.map((pub) => (
          <PaperCard key={pub.id} publication={pub} />
        ))}
      </div>
      <LabTerminal experiments={labExperiments.slice(0, 3)} />
    </motion.div>
  );
}

function PaperCard({ publication }: { publication: Publication }) {
  const t = useT();
  const { projects } = useContent();
  const reduce = useReducedMotion();
  const reached = STAGES.indexOf(publication.status);
  const linked = projects.find((p) => p.slug === publication.project);
  const prototype = linked && real(linked.liveUrl) ? linked : undefined;

  return (
    <motion.article
      variants={rise}
      onPointerMove={trackCursor}
      className="project-tile group relative flex h-full flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-50px] shadow-primary/40 transition-[border-color] duration-300 hover:border-primary/50 sm:p-7"
    >
      {/* Faint ruled lines and a glow: a sheet of paper under a desk lamp. Clipped on their own
          layer so the card's border light isn't. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[100%_28px] opacity-40 mask-[linear-gradient(to_bottom,black,transparent_60%)]" />
        <div className="absolute -top-24 -end-16 size-64 rounded-full bg-primary/10 blur-3xl transition-colors duration-500 group-hover:bg-primary/20" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
            {publication.venue}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-current" />
            {t.research.statuses[publication.status] ?? publication.status}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">{publication.year}</span>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background/70 text-primary shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
          <span className="float-soft flex">
            <FileText className="size-5" strokeWidth={1.5} />
          </span>
        </span>
      </div>

      <div className="relative flex flex-col gap-3">
        {/* The title comes into focus word by word. */}
        <motion.h3
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.2 } } }}
          className="text-balance text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
        >
          {publication.title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 8, filter: "blur(8px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
              }}
              className="inline-block"
            >
              {word}
              {" "}
            </motion.span>
          ))}
        </motion.h3>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{publication.area}</p>
        <p className="text-pretty text-sm leading-relaxed text-foreground/85">{publication.summary}</p>
      </div>

      {/* What the research produced: its live prototype. */}
      {prototype && (
        <a
          href={prototype.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/proto relative flex items-center gap-4 rounded-xl border border-border bg-background/60 p-2 pe-3 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_16px_40px_-24px] hover:shadow-primary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {prototype.image && (
            <span className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg border border-border sm:w-32">
              {/* Slow drift across the screenshot; hover zooms in on top of it. */}
              <span className="ken-burns absolute inset-0">
                <Image
                  src={prototype.image}
                  alt={t.projects.screenshot(prototype.title)}
                  fill
                  sizes="128px"
                  className="object-cover object-top transition-transform duration-500 ease-out group-hover/proto:scale-110 motion-reduce:transition-none"
                />
              </span>
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-70 motion-reduce:animate-none" />
                <span className="relative size-1.5 rounded-full bg-emerald-500" />
              </span>
              {t.research.prototype}
            </span>
            <span className="truncate text-sm font-semibold">{prototype.title}</span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover/proto:text-primary">
              {t.research.tryPrototype}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/proto:-translate-y-0.5 group-hover/proto:translate-x-0.5 rtl:-scale-x-100" />
            </span>
          </span>
        </a>
      )}

      {/* Supporting material. */}
      {(publication.resources?.length || real(publication.link)) && (
        <div className="relative flex flex-wrap gap-2">
          {publication.resources?.map((r) => {
            const Icon = r.kind === "slides" ? Presentation : BookOpen;
            return (
              <a
                key={r.kind}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/res inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Icon className="size-3.5 text-primary" />
                {t.research.resources[r.kind] ?? r.kind}
                <ArrowUpRight className="size-3 text-muted-foreground transition-transform duration-300 group-hover/res:-translate-y-0.5 group-hover/res:translate-x-0.5 group-hover/res:text-primary rtl:-scale-x-100" />
              </a>
            );
          })}
          {real(publication.link) && (
            <a
              href={publication.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <FileText className="size-3.5 text-primary" />
              {t.research.viewPublication}
              <ArrowUpRight className="size-3 text-muted-foreground rtl:-scale-x-100" />
            </a>
          )}
        </div>
      )}

      {/* Progress through review: the line fills up to the paper's current stage. It has its own
          in-view trigger so the steps can never be left hidden. */}
      <div className="relative mt-auto border-t border-border pt-5">
        <motion.ol
          aria-label={t.research.progress}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true }}
          className="relative grid grid-cols-4"
        >
          <span aria-hidden className="absolute start-[12.5%] end-[12.5%] top-[11px] h-0.5 rounded-full bg-border" />
          <motion.span
            aria-hidden
            className="absolute start-[12.5%] top-[11px] h-0.5 origin-left overflow-hidden rounded-full bg-gradient-to-r from-primary/60 via-primary to-chart-2 rtl:origin-right rtl:bg-gradient-to-l"
            style={{ width: `${(Math.max(reached, 0) / (STAGES.length - 1)) * 75}%` }}
            variants={{
              hidden: { scaleX: 0 },
              show: { scaleX: 1, transition: { duration: 1.2, delay: 0.4, ease: EASE } },
            }}
          >
            {/* A light running along the finished stretch. */}
            <span className="line-shimmer absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          </motion.span>
          {STAGES.map((stage, i) => {
            const done = i <= reached;
            const current = i === reached;
            return (
              <li key={stage} className="relative flex flex-col items-center gap-2 text-center">
                <motion.span
                  variants={{
                    hidden: { scale: 0.4, opacity: 0 },
                    show: { scale: 1, opacity: 1, transition: { duration: 0.4, delay: 0.5 + i * 0.25, ease: EASE } },
                  }}
                  className={cn(
                    "relative flex size-6 items-center justify-center rounded-full border text-[10px]",
                    done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {current && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:animate-none" />
                  )}
                  {done ? <Check className="relative size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
                </motion.span>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider",
                    current ? "text-primary" : done ? "text-foreground/80" : "text-muted-foreground/70"
                  )}
                >
                  {t.research.statuses[stage] ?? stage}
                </span>
              </li>
            );
          })}
        </motion.ol>
      </div>
    </motion.article>
  );
}

function LabTerminal({ experiments }: { experiments: LabExperiment[] }) {
  const t = useT();

  return (
    <motion.div
      variants={rise}
      onPointerMove={trackCursor}
      className="project-tile relative flex flex-col rounded-2xl border border-border bg-card shadow-[0_30px_80px_-50px] shadow-primary/40 transition-[border-color] duration-300 hover:border-primary/50"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_80%_70%_at_50%_0%,black,transparent)]" />
        {/* A soft scan line drifting down the screen. */}
        <div className="lab-scan absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-transparent via-primary/[0.06] to-transparent motion-reduce:hidden" />
      </div>

      {/* Title bar, as on the skills panel. */}
      <div className="relative flex items-center gap-3 border-b border-border px-5 py-3">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-primary/60" />
        </span>
        <span dir="ltr" className="truncate font-mono text-xs text-muted-foreground">
          ~/<span className="text-primary">ai-lab</span>
        </span>
        <span className="ms-auto shrink-0 font-mono text-xs text-muted-foreground">{t.research.lab}</span>
      </div>

      <motion.div variants={stagger} className="relative flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <motion.p variants={line} className="px-2 pb-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <span className="text-primary/70"># </span>
          {t.research.labIntro}
        </motion.p>

        <ul className="flex flex-col gap-1">
          {experiments.map((exp, i) => {
            const style = statusStyles[exp.status];
            return (
              <motion.li key={exp.id} variants={line}>
                <div className="group/row flex gap-3 rounded-xl border border-transparent px-2 py-2.5 transition-colors hover:border-border hover:bg-background/60">
                  <span className="pt-0.5 font-mono text-[11px] text-muted-foreground/60 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-snug transition-colors group-hover/row:text-primary">
                        {unbracket(exp.title)}
                      </p>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                          style.text
                        )}
                      >
                        <span className="relative flex size-1.5">
                          {exp.status === "In Development" && (
                            <span className={cn("absolute inset-0 animate-ping rounded-full opacity-70 motion-reduce:animate-none", style.dot)} />
                          )}
                          <span className={cn("relative size-1.5 rounded-full", style.dot)} />
                        </span>
                        {t.research.experimentStatuses[exp.status] ?? exp.status}
                      </span>
                    </div>
                    {/* Descriptions still holding "[Describe …]" prompts stay private. */}
                    {!isPlaceholder(exp.description) && (
                      <p className="line-clamp-2 text-pretty text-xs leading-relaxed text-muted-foreground">
                        {exp.description}
                      </p>
                    )}
                    <p className="font-mono text-[10px] text-muted-foreground/80">
                      <span className="text-primary/70">↳ </span>
                      {exp.technologies.join(" · ")}
                    </p>
                  </div>
                  {real(exp.github) && (
                    <a
                      href={exp.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.common.viewSource}
                      className="self-start rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <GithubIcon className="size-4" />
                    </a>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>

        {/* The prompt, waiting for the next experiment. */}
        <motion.p variants={line} dir="ltr" className="mt-auto px-2 pt-2 font-mono text-xs text-muted-foreground">
          <span className="text-primary">$</span> <Typewriter lines={COMMANDS} />
          <span aria-hidden className="ms-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-primary/70" />
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
