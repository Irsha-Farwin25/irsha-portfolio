"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { domainOf } from "@/components/experience/experience-explorer";
import { ArrowRight, ArrowUpRight, BookOpen, Briefcase, Globe, Landmark, FileText, HandHeart, MapPin, Mic, Trophy, type LucideIcon } from "lucide-react";
import { useContent, useLocale, useT } from "@/components/i18n/locale-provider";
import type { EducationItem, ExperienceItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

/** Chip rows pop in one chip at a time, after the card has landed. */
const chipList: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.6 } } };
const chipPop: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 20 } },
};

/** A number counting up from 0 once it's on screen (straight to the value with reduced motion). */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = String(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.2,
      delay: 0.5,
      ease: EASE,
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);
  // Starts at 0 on the server and the client alike; the effect sets the real figure.
  return <span ref={ref}>0</span>;
}

/** A sentence with a number in it ("38% complete"), where the number counts up. */
function CountedText({ text, n }: { text: string; n: number }) {
  const at = text.indexOf(String(n));
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <CountUp to={n} />
      {text.slice(at + String(n).length)}
    </>
  );
}

/** How far through a degree she is (0–1), or null without an expected end date. */
function progressOf(item: EducationItem, now = new Date()) {
  const { start, expectedEnd } = item.period ?? {};
  if (!start || !expectedEnd) return null;
  const from = new Date(`${start}-01`).getTime();
  const to = new Date(`${expectedEnd}-01`).getTime();
  if (!(to > from)) return null;
  return Math.min(1, Math.max(0, (now.getTime() - from) / (to - from)));
}

/** The first four-digit year in a date ("May 2026", "2019 – 2020", "مايو 2026"). */
function yearOf(date: string | null | undefined) {
  const y = date?.match(/\d{4}/)?.[0];
  return y ? Number(y) : null;
}

type Kind = "hackathons" | "conferences" | "volunteering" | "courses";
const KIND_ICONS: Record<Kind, LucideIcon> = { hackathons: Trophy, conferences: Mic, volunteering: HandHeart, courses: BookOpen };

/**
 * What she did during a degree, counted from the portfolio's own data: certificates and
 * volunteering dated within its years (e.g. "3 hackathons · 2 volunteer roles").
 */
function useAlongTheWay(item: EducationItem) {
  const { certificates, volunteering } = useContent();
  const start = yearOf(item.period?.start) ?? yearOf(item.startDate);
  const end = item.endDate ? yearOf(item.endDate) : new Date().getFullYear();
  if (!start || !end) return [];
  const within = (date?: string) => {
    const y = yearOf(date);
    return y !== null && y >= start && y <= end;
  };
  const KIND_OF = { Hackathon: "hackathons", Conference: "conferences", Course: "courses" } as const;
  const kinds: Kind[] = [
    ...certificates.filter((c) => within(c.date)).map((c) => KIND_OF[c.category] as Kind),
    ...volunteering.filter((v) => within(v.date)).map(() => "volunteering" as const),
  ];
  const order: Kind[] = ["hackathons", "conferences", "volunteering", "courses"];
  return order.map((k) => ({ kind: k, n: kinds.filter((x) => x === k).length })).filter((s) => s.n > 0);
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
 * Education as two credential cards, oldest first, joined by a connector marking the years in
 * industry between them. Everything is on the face of the card (no flip): crest, degree, dates,
 * progress or completion, thesis, focus areas, what happened along the way, and where it's applied.
 */
export function EducationCredentials() {
  const t = useT();
  const { education, experience } = useContent();
  const reduce = useReducedMotion();
  // Oldest first, so the path reads forward in time.
  const items = [...education].sort((a, b) => (a.status === b.status ? 0 : a.status === "completed" ? -1 : 1));

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>("[data-tile]")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };

  // Between the degrees: the years, and the companies she joined in that gap (shown as logos).
  const [first, second] = items;
  const fromYear = yearOf(first?.endDate);
  const toYear = yearOf(second?.startDate);
  const between =
    fromYear && toYear
      ? experience.filter((x) => {
          const y = yearOf(x.startDate);
          return x.logo && y !== null && y >= fromYear && y <= toYear;
        })
      : [];
  const bridge = fromYear && toYear ? { from: fromYear, to: toYear, label: t.experience.edu.intoIndustry, roles: between } : null;

  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18 } } }}
      onPointerMove={onMove}
      className={cn(
        "project-grid grid items-stretch gap-4",
        items.length > 1 && "lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-0"
      )}
    >
      {items.map((item, i) => (
        <div key={item.id} className="contents">
          {i === 1 && <Bridge data={bridge} />}
          <motion.div variants={rise} className="min-w-0">
            <CredentialCard item={item} />
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}

/**
 * The link between the degrees: a line that draws itself, with a dot of light travelling along it
 * (BSc → MSc), and a pill with the years, "into industry", and the logos of the companies she
 * joined in between.
 */
function Bridge({ data }: { data: { from: number; to: number; label: string; roles: ExperienceItem[] } | null }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }}
      className="relative flex items-center justify-center py-3 lg:w-40 lg:py-0"
    >
      {/* Vertical on phones (cards stacked), horizontal between the cards on large screens. */}
      <motion.span
        aria-hidden
        className="absolute inset-y-0 start-1/2 w-px origin-top bg-linear-to-b from-border via-primary/60 to-border lg:inset-x-0 lg:inset-y-auto lg:top-1/2 lg:h-px lg:w-auto lg:origin-left lg:bg-linear-to-r rtl:lg:origin-right"
        initial={reduce ? false : { scale: 0 }}
        variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { duration: 0.8, ease: EASE } } }}
      />
      {/* A dot of light making the journey, again and again (horizontal and vertical versions). */}
      {!reduce && (
        <>
          {/* Mirrored in Arabic, so the dot still runs from the BSc (on the right there) to the MSc. */}
          <span aria-hidden className="absolute inset-x-0 top-1/2 hidden lg:block rtl:-scale-x-100">
            <motion.span
              className="absolute top-0 size-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_2px] shadow-primary/70"
              animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            />
          </span>
          <motion.span
            aria-hidden
            className="absolute start-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_2px] shadow-primary/70 lg:hidden rtl:translate-x-1/2"
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />
        </>
      )}
      {data && (
        <motion.span
          variants={{
            hidden: { opacity: 0, scale: 0.85 },
            show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.3 } },
          }}
          className="relative flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-center shadow-sm"
        >
          <span dir="ltr" className="inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums">
            {data.from}
            <ArrowRight className="size-3 text-primary" aria-hidden />
            {data.to}
          </span>
          <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase">{data.label}</span>
          {data.roles.length > 0 && (
            <span className="flex items-center gap-1.5">
              {data.roles.map((r) => (
                // Each logo names its company on hover or keyboard focus.
                <span key={r.id} tabIndex={0} className="group/logo relative rounded-full outline-none">
                  <span
                    className={cn(
                      "relative block size-8 overflow-hidden rounded-full border border-border shadow-sm ring-primary/50 transition-transform duration-300 group-hover/logo:-translate-y-0.5 group-hover/logo:scale-110 group-hover/logo:ring-2 group-focus-visible/logo:ring-2",
                      r.logoFit !== "cover" && "bg-white"
                    )}
                  >
                    <Image
                      src={r.logo!}
                      alt={r.organization}
                      fill
                      sizes="32px"
                      className={r.logoFit === "cover" ? "object-cover" : "object-contain p-1"}
                    />
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 translate-y-1 rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-[opacity,transform] duration-200 group-hover/logo:translate-y-0 group-hover/logo:opacity-100 group-focus-visible/logo:translate-y-0 group-focus-visible/logo:opacity-100"
                  >
                    {r.organization}
                  </span>
                </span>
              ))}
            </span>
          )}
        </motion.span>
      )}
    </motion.div>
  );
}

function CredentialCard({ item }: { item: EducationItem }) {
  const t = useT();
  const e = t.experience.edu;
  const current = item.status === "in-progress";
  const progress = progressOf(item);
  const along = useAlongTheWay(item);
  const locale = useLocale();
  // "2028-01" → "Jan 2028" (or the Arabic month), for the expected graduation.
  const expected = item.period?.expectedEnd
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", { month: "short", year: "numeric", numberingSystem: "latn" }).format(
        new Date(`${item.period.expectedEnd}-01T00:00:00`)
      )
    : null;

  return (
    <article
      data-tile
      className={cn(
        "project-tile group relative flex h-full flex-col gap-5 rounded-2xl border bg-card p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-28px] hover:shadow-primary/50 motion-reduce:hover:translate-y-0 sm:p-6",
        current ? "border-primary/40 shadow-[0_18px_50px_-30px] shadow-primary/50" : "border-border hover:border-primary/40"
      )}
    >
      {/* Texture and glow, clipped on their own layer so the border light isn't. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] opacity-50 mask-[radial-gradient(ellipse_70%_60%_at_100%_0%,black,transparent)]" />
        {current && <div className="absolute -top-20 -end-20 size-56 rounded-full bg-primary/12 blur-3xl" />}
      </div>

      {/* Crest, and the degree's status. */}
      <div className="relative flex items-start justify-between gap-3">
        <motion.span
          variants={{
            hidden: { opacity: 0, scale: 0.6, rotate: -10 },
            show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 14, delay: 0.25 } },
          }}
          className="flex shrink-0 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
        >
          <Crest item={item} />
        </motion.span>
        {current ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-70 motion-reduce:animate-none" />
              <span className="relative size-1.5 rounded-full bg-current" />
            </span>
            {e.inProgress}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            {/* A tick that draws itself in. */}
            <svg viewBox="0 0 16 16" className="size-3 text-primary" aria-hidden>
              <motion.path
                d="M3 8.5 L6.5 12 L13 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.5, delay: 0.6, ease: "easeOut" } } }}
              />
            </svg>
            {e.completed}
          </span>
        )}
      </div>

      <div className="relative flex flex-col gap-1">
        <h4 className="text-lg leading-snug font-semibold tracking-tight sm:text-xl">
          {item.degree} {item.field}
        </h4>
        {/* The institution, with its own site beside it (as on the Experience cards). */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm font-medium text-primary">{item.institution}</p>
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group/web inline-flex items-center gap-1 rounded-md font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Globe className="size-3" aria-hidden />
              <span dir="ltr">{domainOf(item.website)}</span>
              <ArrowUpRight
                className="size-3 transition-transform duration-300 group-hover/web:-translate-y-0.5 group-hover/web:translate-x-0.5 rtl:-scale-x-100"
                aria-hidden
              />
            </a>
          )}
        </div>
        {item.about && (
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-pretty text-muted-foreground">
            <Landmark className="mt-0.5 size-3.5 shrink-0 text-primary/70" aria-hidden />
            <span>
              {/* "**…**" marks the phrases worth a recruiter's glance. */}
              {item.about.split(/\*\*(.+?)\*\*/).map((part, i) =>
                i % 2 ? (
                  <strong
                    key={i}
                    // A gold highlighter stroke for standing, with the words themselves kept white.
                    className="rounded-sm bg-linear-to-t from-amber-400/30 from-30% to-transparent to-30% font-medium text-foreground"
                  >
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </span>
          </p>
        )}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
          <span>
            {item.startDate} — {item.endDate ?? t.common.present}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" aria-hidden />
            {item.location}
          </span>
          {item.mode && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="size-3" aria-hidden />
                {item.mode}
              </span>
            </>
          )}
        </p>
        {item.result && (
          <p className="mt-1 text-sm">
            <span className="text-muted-foreground">{e.result}: </span>
            <span className="font-medium">{item.result}</span>
          </p>
        )}
      </div>

      {/* In progress: how far along, or a light sweeping the bar while there's no end date. */}
      {current && (
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium">
              {progress === null ? e.since(item.startDate) : <CountedText text={e.complete(Math.round(progress * 100))} n={Math.round(progress * 100)} />}
            </span>
            {expected && <span className="font-mono text-[11px] text-muted-foreground">{e.expected(expected)}</span>}
          </div>
          <ProgressBar value={progress} />
          {item.currentModule && (
            <p className="text-xs text-muted-foreground">
              {e.currently}: <span className="font-medium text-foreground">{item.currentModule}</span>
            </p>
          )}
        </div>
      )}

      {/* Final-year thesis, as a quoted title. */}
      {item.thesis && (
        <div className="relative flex gap-3 rounded-xl border border-border bg-background/50 p-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <span className="float-soft flex">
              <FileText className="size-4" aria-hidden />
            </span>
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{e.thesis}</p>
            {/* The title comes into focus word by word. */}
            <motion.p
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } } }}
              className="text-pretty text-sm leading-snug font-semibold"
            >
              {`“${item.thesis}”`.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 6, filter: "blur(6px)" },
                    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: EASE } },
                  }}
                >
                  {word}
                  {" "}
                </motion.span>
              ))}
            </motion.p>
          </div>
        </div>
      )}

      {item.modules && item.modules.length > 0 && (
        <div className="relative flex flex-col gap-2">
          <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{e.focus}</p>
          <motion.ul variants={chipList} className="flex flex-wrap gap-1.5">
            {item.modules.map((m) => (
              <motion.li key={m} variants={chipPop} className="rounded-lg border border-border bg-background/60 px-2.5 py-1 text-xs">
                {m}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      {along.length > 0 && (
        <div className="relative flex flex-col gap-2">
          <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{e.alongTheWay}</p>
          {/* Tighter than the module chips, so a degree's four counts fit on one line. */}
          <motion.ul variants={chipList} className="flex flex-wrap gap-1">
            {along.map(({ kind, n }) => {
              const Icon = KIND_ICONS[kind];
              return (
                <motion.li
                  key={kind}
                  variants={chipPop}
                  className="group/stat inline-flex items-center gap-1 rounded-lg border border-border bg-background/60 px-2 py-1 text-xs whitespace-nowrap transition-colors hover:border-primary/40"
                >
                  <Icon className="size-3.5 text-primary transition-transform duration-300 group-hover/stat:scale-125 group-hover/stat:-rotate-12" aria-hidden />
                  <span className="font-semibold tabular-nums">
                    <CountUp to={n} />
                  </span>{" "}
                  {e.units[kind](n)}
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      )}

      {/* Where the study shows up in her work. */}
      {item.links && item.links.length > 0 && (
        <div className="relative mt-auto flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-4">
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{e.appliedIn}</span>
          {item.links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="group/chip inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {l.label}
              <ArrowUpRight className="size-3 transition-transform group-hover/chip:-translate-y-px group-hover/chip:translate-x-px rtl:-scale-x-100" aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

/** The university's crest when there's one in /public, otherwise a monogram badge. */
function Crest({ item }: { item: EducationItem }) {
  if (item.logo) {
    return (
      <span className="relative block size-14 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <Image src={item.logo} alt="" fill sizes="56px" className="object-contain p-1" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      dir="ltr"
      className="flex size-14 items-center justify-center rounded-xl border border-primary/30 bg-linear-to-br from-primary/25 to-primary/5 font-mono text-[13px] font-semibold tracking-tight text-primary"
    >
      {monogram(item)}
    </span>
  );
}

/** A known percentage fills to it; without one, a light sweeps along the bar to say "ongoing". */
function ProgressBar({ value }: { value: number | null }) {
  const reduce = useReducedMotion();
  return (
    <div
      className="relative h-1.5 overflow-hidden rounded-full bg-secondary"
      {...(value !== null && { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(value * 100) })}
    >
      {value !== null ? (
        // Width (not scale), so the light gliding along the filled part keeps its shape.
        <motion.div
          className="relative h-full overflow-hidden rounded-full bg-linear-to-r from-primary/70 to-primary"
          initial={{ width: "0%" }}
          whileInView={{ width: `${value * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
        >
          <span aria-hidden className="line-shimmer absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden" />
        </motion.div>
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
