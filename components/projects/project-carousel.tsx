"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animate, motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/lib/types";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { dirOf } from "@/lib/i18n/config";

const SPEED = 0.04; // px per ms of auto-scroll

/**
 * Auto-scrolling row of project cards. The list is rendered twice and the
 * offset wraps at half the track width, so the loop is seamless. Hovering
 * pauses the drift; the edge arrows nudge the row by one card.
 */
export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const halfWidth = useRef(0);
  const paused = useRef(false);
  const nudging = useRef(false);
  const x = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const t = useT();
  const dir = dirOf(useLocale());

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => (halfWidth.current = el.scrollWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const wrap = (v: number) => {
    const half = halfWidth.current;
    if (!half) return v;
    if (v <= -half) return v + half;
    if (v > 0) return v - half;
    return v;
  };

  useAnimationFrame((_, delta) => {
    if (reduceMotion || paused.current || nudging.current) return;
    x.set(wrap(x.get() - SPEED * delta));
  });

  const nudge = (dir: 1 | -1) => {
    const card = trackRef.current?.firstElementChild as HTMLElement | null;
    const half = halfWidth.current;
    if (!card || !half) return;

    // Shift into the equivalent position in the other copy so the target stays in range.
    let from = x.get();
    const step = card.offsetWidth;
    if (dir === -1 && from + step > 0) from -= half;
    if (dir === 1 && from - step <= -half) from += half;
    x.set(from);

    nudging.current = true;
    animate(x, from - dir * step, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        x.set(wrap(x.get()));
        nudging.current = false;
      },
    });
  };

  const renderSet = (hidden: boolean) =>
    projects.map((project) => (
      <div
        key={`${hidden ? "dup-" : ""}${project.slug}`}
        aria-hidden={hidden || undefined}
        inert={hidden || undefined}
        dir={dir}
        className="w-[280px] shrink-0 pe-6 sm:w-[360px]"
      >
        <div
          data-card
          className="h-full rounded-lg bg-background transition-[transform,opacity,box-shadow] duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_16px_40px_-12px] hover:shadow-primary/35 motion-reduce:hover:transform-none [&>article]:hover:border-primary"
        >
          <ProjectCard project={project} />
        </div>
      </div>
    ));

  const arrowClass =
    "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-md backdrop-blur transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  // The track always runs left to right (the loop maths assumes it); each card keeps the page's
  // direction for its own text.
  return (
    <div dir="ltr" className="relative -mx-6 sm:-mx-8">
      <div
        className="-my-6 overflow-hidden px-6 py-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:px-8"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max [&:has([data-card]:hover)_[data-card]:not(:hover)]:opacity-50"
        >
          {renderSet(false)}
          {renderSet(true)}
        </motion.div>
      </div>

      <button type="button" aria-label={t.projects.prev} onClick={() => nudge(-1)} className={`${arrowClass} left-2 sm:left-3`}>
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" aria-label={t.projects.next} onClick={() => nudge(1)} className={`${arrowClass} right-2 sm:right-3`}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
