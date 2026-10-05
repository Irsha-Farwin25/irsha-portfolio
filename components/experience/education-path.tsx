"use client";

import { useState, type MouseEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight, BookOpen, Check, HandHeart, MapPin, Mic, RotateCcw, Trophy, type LucideIcon } from "lucide-react";
import { useContent, useT } from "@/components/i18n/locale-provider";
import type { EducationItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** How far through a degree she is (0–1), or null without an expected end date. */
function progressOf(item: EducationItem, now = new Date()) {
  const { start, expectedEnd } = item.period ?? {};
  if (!start || !expectedEnd) return null;
  const from = new Date(`${start}-01`).getTime();
  const to = new Date(`${expectedEnd}-01`).getTime();
  if (!(to > from)) return null;
  return Math.min(1, Math.max(0, (now.getTime() - from) / (to - from)));
}

type Kind = "hackathons" | "conferences" | "volunteering" | "courses";

const KIND_ICONS: Record<Kind, LucideIcon> = {
  hackathons: Trophy,
  conferences: Mic,
  volunteering: HandHeart,
  courses: BookOpen,
};

/** The first four-digit year in a date ("May 2026", "2019 – 2020", "مايو 2026"). */
function yearOf(date: string | null | undefined) {
  const y = date?.match(/\d{4}/)?.[0];
  return y ? Number(y) : null;
}

/**
 * What she did during a degree, from the portfolio's own data: certificates and volunteering
 * dated within its years. Gives the stats row and an "along the way" list that mixes kinds
 * (a hackathon, a conference, volunteering, a course) before repeating any.
 */
function useJourney(item: EducationItem) {
  const { certificates, volunteering } = useContent();
  const start = yearOf(item.period?.start) ?? yearOf(item.startDate);
  const end = item.endDate ? yearOf(item.endDate) : new Date().getFullYear();
  if (!start || !end) return { stats: [], highlights: [] };
  const within = (date?: string) => {
    const y = yearOf(date);
    return y !== null && y >= start && y <= end;
  };

  const KIND_OF = { Hackathon: "hackathons", Conference: "conferences", Course: "courses" } as const;
  const events: { id: string; kind: Kind; title: string; date: string }[] = [
    ...certificates
      .filter((c) => within(c.date))
      .map((c) => ({ id: c.id, kind: KIND_OF[c.category] as Kind, title: c.title, date: c.date ?? "" })),
    ...volunteering
      .filter((a) => within(a.date))
      .map((a) => ({ id: a.id, kind: "volunteering" as const, title: a.title, date: a.date ?? "" })),
  ];

  const order: Kind[] = ["hackathons", "volunteering", "conferences", "courses"];
  const count = (k: Kind) => events.filter((e) => e.kind === k).length;
  const stats = [
    ...(item.endDate && end > start ? [{ key: "years" as const, n: end - start }] : []),
    ...order.filter((k) => count(k) > 0).map((k) => ({ key: k, n: count(k) })),
  ].slice(0, 3);

  // Round-robin across kinds, so four highlights show four different sides of her.
  const queues = order.map((k) => events.filter((e) => e.kind === k));
  const picked: typeof events = [];
  while (picked.length < 4 && queues.some((q) => q.length)) {
    for (const q of queues) if (q.length && picked.length < 4) picked.push(q.shift()!);
  }
  const highlights = picked.sort((a, b) => (yearOf(b.date) ?? 0) - (yearOf(a.date) ?? 0));
  return { stats, highlights };
}

/** Badge letters: the data's monogram, else the institution's initials ("University of Moratuwa" → "UM"). */
function monogram(item: EducationItem) {
  if (item.monogram) return item.monogram;
  return item.institution
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
}

/**
 * Education as a learning path: a line draws itself from the BSc to the MSc, which glows as
 * "now". Each degree is a card that tilts toward the cursor and flips over for details, with
 * chips linking the study to the work it shows up in.
 */
export function EducationPath() {
  const { education } = useContent();
  // Oldest first, so the path reads forward in time.
  const items = [...education].sort((a, b) => (a.status === b.status ? 0 : a.status === "completed" ? -1 : 1));

  return (
    <div className="relative">
      {/* The path between the degree markers, drawing itself in once on screen. */}
      <div aria-hidden className="absolute top-3 right-1/4 left-1/4 hidden h-px bg-border sm:block">
        <motion.div
          className="h-full origin-left bg-linear-to-r from-primary/30 via-primary to-primary rtl:origin-right rtl:bg-linear-to-l"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>

      <ol className={cn("grid gap-10 sm:gap-6", items.length > 1 && "sm:grid-cols-2")}>
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            className="flex flex-col items-center gap-4 perspective-[1100px]"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.55, delay: 0.25 + i * 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PathNode current={item.status === "in-progress"} />
            <DegreeCard item={item} />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/** The marker on the path: a check for a finished degree, a pulsing "Now" for the current one. */
function PathNode({ current }: { current: boolean }) {
  const t = useT();
  if (!current) {
    return (
      <span className="relative z-10 flex size-6 items-center justify-center rounded-full border border-primary/50 bg-background text-primary">
        <Check className="size-3.5" aria-hidden />
      </span>
    );
  }
  return (
    <span className="relative z-10 flex items-center gap-1.5 rounded-full border border-primary/60 bg-background py-0.5 ps-1 pe-2.5 text-[11px] font-semibold text-primary shadow-[0_0_24px_-4px] shadow-primary/60">
      <span className="relative flex size-4 items-center justify-center">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
        <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
      </span>
      {t.experience.edu.now}
    </span>
  );
}

/** A degree card: tilts toward the cursor, and flips to its back for details. */
function DegreeCard({ item }: { item: EducationItem }) {
  const t = useT();
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const current = item.status === "in-progress";
  const progress = progressOf(item);
  const journey = useJourney(item);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
  // A click anywhere on the card flips it, except on its links.
  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("a, button")) return;
    setFlipped((f) => !f);
  };
  // The first time it's on screen, the card turns a little on its axis and settles back,
  // hinting that it has another side (after the list's staggered fade-in).
  const onFirstView = () => {
    if (reduce) return;
    setTimeout(() => rotateY.set(-18), 1300);
    setTimeout(() => rotateY.set(0), 1750);
  };

  return (
    <motion.div
      onViewportEnter={onFirstView}
      viewport={{ once: true, amount: 0.6 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY }}
      className="flex w-full flex-1 transform-3d"
    >
      <motion.div
        onClick={onCardClick}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full flex-1 cursor-pointer transform-3d"
      >
        <Face
          hidden={flipped}
          className={cn(current ? "border-primary/40 shadow-[0_18px_50px_-24px] shadow-primary/50" : "border-border")}
        >
          <div className="flex items-start justify-between gap-3">
            <Crest item={item} />
            <FlipButton label={t.experience.edu.flipHint} onClick={() => setFlipped(true)} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-muted-foreground">
              {item.startDate} — {item.endDate ?? t.common.present}
            </span>
            <h4 className="text-lg font-semibold tracking-tight">
              {item.degree} {item.field}
            </h4>
            <p className="text-sm font-medium text-primary">{item.institution}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" aria-hidden /> {item.location}
            </p>
          </div>

          {current ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-foreground">
                  {progress === null ? t.experience.edu.inProgress : t.experience.edu.complete(Math.round(progress * 100))}
                </span>
                {item.period && progress === null && (
                  <span className="text-muted-foreground">{t.experience.edu.since(item.startDate)}</span>
                )}
              </div>
              <ProgressBar value={progress} />
              {item.currentModule && (
                <p className="text-xs text-muted-foreground">
                  {t.experience.edu.currently}: <span className="font-medium text-foreground">{item.currentModule}</span>
                </p>
              )}
            </div>
          ) : (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
              <Check className="size-3 text-primary" aria-hidden /> {t.experience.edu.completed}
            </span>
          )}

          <Stats stats={journey.stats} />
          <StudyLinks item={item} />
        </Face>

        <Face back hidden={!flipped} className="border-primary/40 bg-linear-to-br from-primary/10 via-card to-card">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">
              {item.degree} {item.field}
            </p>
            <FlipButton label={t.experience.edu.back} onClick={() => setFlipped(false)} />
          </div>
          <p className="text-sm leading-relaxed text-pretty text-foreground/85">{item.description}</p>
          <Journey highlights={journey.highlights} />
          {item.modules && item.modules.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                {t.experience.edu.focus}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {item.modules.map((m) => (
                  <li key={m} className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.result && (
            <p className="text-sm">
              <span className="text-muted-foreground">{t.experience.edu.result}: </span>
              <span className="font-medium">{item.result}</span>
            </p>
          )}
        </Face>
      </motion.div>
    </motion.div>
  );
}

/**
 * One side of the card. Both sides share a grid cell, so the card takes the taller side's height;
 * the hidden side is turned away (and kept out of the tab order and screen readers).
 */
function Face({
  back = false,
  hidden,
  className,
  children,
}: {
  back?: boolean;
  hidden: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={hidden}
      inert={hidden || undefined}
      className={cn(
        "col-start-1 row-start-1 flex flex-col gap-4 rounded-2xl border bg-card p-5 backface-hidden sm:p-6",
        back && "transform-[rotateY(180deg)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type Journey = ReturnType<typeof useJourney>;

/** The degree in numbers (front of the card): years, hackathons, volunteering… */
function Stats({ stats }: { stats: Journey["stats"] }) {
  const t = useT();
  if (!stats.length) return null;
  return (
    <dl className={cn("grid gap-2", stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {stats.map(({ key, n }) => (
        <div key={key} className="flex flex-col rounded-xl border border-border bg-background/40 px-3 py-2">
          <dd className="text-xl font-semibold tracking-tight text-primary tabular-nums">{n}</dd>
          <dt className="text-[11px] leading-tight text-muted-foreground">{t.experience.edu.units[key](n)}</dt>
        </div>
      ))}
    </dl>
  );
}

/** The back of the card: what she did along the way during the degree. */
function Journey({ highlights }: { highlights: Journey["highlights"] }) {
  const t = useT();
  return (
    <>
      {highlights.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            {t.experience.edu.alongTheWay}
          </p>
          <ol className="relative flex flex-col gap-1 border-s border-border ps-4">
            {highlights.map(({ id, kind, title, date }) => {
              const Icon = KIND_ICONS[kind];
              return (
                <li key={id} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-1/2 -start-[21px] size-2 -translate-y-1/2 rounded-full border-2 border-card bg-primary"
                  />
                  <Link
                    href="/#achievements"
                    className="group/hl flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60"
                  >
                    <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm group-hover/hl:text-primary">{title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{date}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </>
  );
}

function FlipButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <RotateCcw className="size-3" aria-hidden /> {label}
    </button>
  );
}

/** The university's crest when there's one in /public, otherwise a monogram badge. */
function Crest({ item }: { item: EducationItem }) {
  if (item.logo) {
    return (
      <span className="relative size-14 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <Image src={item.logo} alt="" fill sizes="56px" className="object-contain p-1" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      dir="ltr"
      className="flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-linear-to-br from-primary/25 to-primary/5 font-mono text-[13px] font-semibold tracking-tight text-primary"
    >
      {monogram(item)}
    </span>
  );
}

/** A known percentage fills to it; without one, a light sweeps along the bar to say "ongoing". */
function ProgressBar({ value }: { value: number | null }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary">
      {value !== null ? (
        <motion.div
          className="h-full origin-left rounded-full bg-linear-to-r from-primary/70 to-primary rtl:origin-right"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: value }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        />
      ) : (
        <motion.div
          className="absolute inset-y-0 w-1/3 rounded-full bg-linear-to-r from-transparent via-primary to-transparent"
          initial={{ left: "-35%" }}
          animate={reduce ? { left: "33%" } : { left: ["-35%", "100%"] }}
          transition={reduce ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

/** "Shows up in": chips linking the degree to the projects and research it fed into. */
function StudyLinks({ item }: { item: EducationItem }) {
  const t = useT();
  if (!item.links?.length) return null;
  return (
    <div className="mt-auto flex flex-col gap-2 border-t border-dashed border-border pt-3">
      <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        {t.experience.edu.builtFrom}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {item.links.map((l) => (
          <Link
            key={l.href + l.label}
            href={l.href}
            className="group/chip inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {l.label}
            <ArrowUpRight
              className="size-3 transition-transform group-hover/chip:-translate-y-px group-hover/chip:translate-x-px rtl:-scale-x-100 rtl:group-hover/chip:-translate-x-px"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
