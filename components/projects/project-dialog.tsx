"use client";

import type { KeyboardEvent, ReactNode } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, CircleCheck, XIcon } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand-icons";
import { Button } from "@/components/ui/button";
import { isPlaceholder } from "@/lib/i18n/content";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

const EASE = [0.22, 1, 0.36, 1] as const;

const navButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const real = (url?: string) => !!url && url !== "#";
const pad = (i: number) => String(i + 1).padStart(2, "0");

/** The live site's host, shown in the browser frame's address bar. */
function hostOf(url?: string) {
  try {
    return real(url) ? new URL(url!).host : undefined;
  } catch {
    return undefined;
  }
}

/** A link to the live site when there is one, otherwise a plain container. */
function Frame({
  href,
  label,
  className,
  children,
}: {
  href?: string;
  label: string;
  className: string;
  children: ReactNode;
}) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

/**
 * A project's details in a dialog over the page: screenshot in its browser frame on one side,
 * the write-up on the other. Arrows (or the arrow keys) step through the projects in place.
 * Sections still holding "[Describe …]" prompts are left out.
 */
export function ProjectDialog({
  projects,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  projects: Project[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const count = projects.length;
  const project = projects[index];
  const cs = project.caseStudy;
  const live = real(project.liveUrl);

  const go = (dir: number) => onIndexChange((index + dir + count) % count);
  const onKeyDown = (e: KeyboardEvent) => {
    // Leave arrow keys alone inside the scrolling write-up's links and buttons.
    if ((e.target as HTMLElement).closest("a")) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    if (e.key === "ArrowRight") go(rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
  };

  const shown = (text?: string) => !!text && !isPlaceholder(text);
  const sections = cs
    ? (["overview", "problem", "context", "myRole", "solution", "architecture"] as const)
        .filter((k) => shown(cs[k]))
        .map((k) => ({ title: t.projects.sections[k], body: cs[k] }))
    : [];
  const lists = cs
    ? [
        { title: t.projects.keyFeatures, items: cs.keyFeatures.filter(shown) },
        { title: t.projects.challenges, items: cs.challenges.filter(shown) },
        { title: t.projects.decisions, items: cs.decisions.filter(shown) },
      ].filter((l) => l.items.length > 0)
    : [];
  const outcome = cs && shown(cs.outcome) ? cs.outcome : undefined;

  const swap = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.12 } },
      };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <Dialog.Popup
            onKeyDown={onKeyDown}
            className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-[0_40px_120px_-30px] shadow-primary/40 transition duration-300 ease-out outline-none data-ending-style:translate-y-8 data-ending-style:opacity-0 data-starting-style:translate-y-8 data-starting-style:opacity-0 sm:rounded-2xl sm:data-ending-style:translate-y-0 sm:data-ending-style:scale-95 sm:data-starting-style:translate-y-0 sm:data-starting-style:scale-95"
          >
            {/* Soft glow at the top, as on the skills panel. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 start-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl rtl:translate-x-1/2"
            />

            {/* Header bar: position, stepping, close. */}
            <div className="relative flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-primary/60" />
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {pad(index)} / {pad(count - 1)}
              </span>
              <div className="ms-auto flex items-center gap-2">
                {count > 1 && (
                  <>
                    <button type="button" aria-label={t.projects.prev} onClick={() => go(-1)} className={navButtonClass}>
                      <ChevronLeft className="size-4 rtl:-scale-x-100" />
                    </button>
                    <button type="button" aria-label={t.projects.next} onClick={() => go(1)} className={navButtonClass}>
                      <ChevronRight className="size-4 rtl:-scale-x-100" />
                    </button>
                  </>
                )}
                <Dialog.Close aria-label={t.common.close} className={navButtonClass}>
                  <XIcon className="size-4" />
                </Dialog.Close>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={project.slug}
                {...swap}
                className="relative grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:overflow-hidden"
              >
                {/* Screenshot, framed as a browser window. */}
                <div className="p-4 sm:p-5 lg:overflow-y-auto">
                  {/* With a live site, the whole browser window is the link to it. */}
                  <Frame
                    href={live ? project.liveUrl : undefined}
                    label={`${t.projects.visitSite}: ${project.title}`}
                    className={cn(
                      "group/shot block overflow-hidden rounded-xl border border-border bg-secondary/50 transition-[border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      live && "hover:border-primary/50 hover:shadow-[0_20px_50px_-25px] hover:shadow-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3 border-b border-border bg-background/70 px-3 py-2">
                      <span
                        dir="ltr"
                        className={cn(
                          "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-secondary/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors",
                          live && "group-hover/shot:text-primary"
                        )}
                      >
                        <span className="truncate">{hostOf(project.liveUrl) ?? project.slug}</span>
                        {live && <ArrowUpRight className="size-3 shrink-0" />}
                      </span>
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {project.image && (
                        <Image
                          src={project.image}
                          alt={t.projects.screenshot(project.title)}
                          fill
                          sizes="(min-width: 1024px) 560px, 100vw"
                          className={cn(
                            "object-cover object-top transition-[transform,filter] duration-500 ease-out motion-reduce:transition-none",
                            live && "group-hover/shot:scale-[1.03] group-hover/shot:brightness-75"
                          )}
                        />
                      )}
                      {live && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover/shot:translate-y-0 group-hover/shot:opacity-100 group-focus-visible/shot:translate-y-0 group-focus-visible/shot:opacity-100">
                            {t.projects.visitSite}
                            <ArrowUpRight className="size-4 text-primary rtl:-scale-x-100" />
                          </span>
                        </span>
                      )}
                    </div>
                  </Frame>

                  {/* Live link: a bar the width of the screenshot, ringed by the contact card's
                      travelling gradient. On hover the arrow's tile floods the bar. */}
                  {live && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-border group/live relative mt-3 block rounded-xl p-px shadow-[0_18px_40px_-22px] shadow-primary/60 transition-shadow duration-500 hover:shadow-[0_22px_50px_-18px] hover:shadow-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {/* Radii nest with the screenshot frame: 12px outside, 11px inside the 1px ring,
                          5px for the disc inset 6px from that. */}
                      <span className="relative flex items-center gap-3 overflow-hidden rounded-[11px] bg-card py-1.5 ps-4 pe-1.5">
                        {/* The disc that grows into the fill. */}
                        <span
                          aria-hidden
                          className="absolute inset-y-1.5 end-1.5 w-10 rounded-[5px] bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/live:w-[calc(100%-0.75rem)] group-focus-visible/live:w-[calc(100%-0.75rem)]"
                        />
                        <span className="relative flex size-2 shrink-0">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70 transition-colors duration-300 group-hover/live:bg-primary-foreground motion-reduce:animate-none" />
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-500 transition-colors duration-300 group-hover/live:bg-primary-foreground" />
                        </span>
                        <span className="relative text-sm font-semibold text-foreground transition-colors delay-75 duration-300 group-hover/live:text-primary-foreground">
                          {t.common.liveDemo}
                        </span>
                        <span
                          dir="ltr"
                          className="relative ms-auto min-w-0 truncate font-mono text-[11px] text-muted-foreground transition-colors delay-75 duration-300 group-hover/live:text-primary-foreground/80"
                        >
                          {hostOf(project.liveUrl)}
                        </span>
                        {/* Arrow swap: one flies out to the corner as the next flies in. */}
                        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden text-primary-foreground rtl:-scale-x-100">
                          <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/live:translate-x-6 group-hover/live:-translate-y-6" />
                          <ArrowUpRight className="absolute size-4 -translate-x-6 translate-y-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/live:translate-x-0 group-hover/live:translate-y-0" />
                        </span>
                      </span>
                    </a>
                  )}

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* The write-up. */}
                <div className="flex min-h-0 flex-col gap-5 px-4 pb-5 sm:px-5 lg:overflow-y-auto lg:ps-0 lg:pt-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                        {project.category}
                      </span>
                      {shown(project.role) && (
                        <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {project.role}
                        </span>
                      )}
                    </div>
                    <Dialog.Title className="text-balance text-2xl font-semibold tracking-tight">{project.title}</Dialog.Title>
                    <Dialog.Description className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </Dialog.Description>

                    {/* Source, when there's a public repo (the live link is in the header and on the screenshot). */}
                    {real(project.github) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          nativeButton={false}
                          render={
                            <a href={project.github} target="_blank" rel="noopener noreferrer">
                              <GithubIcon className="size-3.5" /> {t.common.source}
                            </a>
                          }
                        />
                      </div>
                    )}
                  </div>

                  {sections.map((s) => (
                    <div key={s.title} className="flex flex-col gap-1.5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{s.title}</p>
                      <p className="text-pretty text-sm leading-relaxed text-foreground/85">{s.body}</p>
                    </div>
                  ))}

                  {lists.map((l) => (
                    <div key={l.title} className="flex flex-col gap-2">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{l.title}</p>
                      <ul className="flex flex-col gap-2">
                        {l.items.map((item) => (
                          <li key={item} className="flex gap-2.5 text-sm text-foreground/85">
                            <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span className="text-pretty leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {outcome && (
                    <div className="flex flex-col gap-1.5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{t.projects.outcome}</p>
                      <p className="text-pretty text-sm leading-relaxed text-foreground/85">{outcome}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Hidden for now: a footer link to the full case study page. To bring it back, uncomment
                and re-import Link (next/link) and ArrowRight (lucide-react).
            <div className="relative flex items-center border-t border-border bg-card px-4 py-3 sm:px-5">
              <Link
                href={`/projects/${project.slug}`}
                className={cn(
                  "ms-auto inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-primary hover:underline",
                  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              >
                {t.projects.viewCase}
                <ArrowRight className="size-3 rtl:-scale-x-100" />
              </Link>
            </div> */}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
