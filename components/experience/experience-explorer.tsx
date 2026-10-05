"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, animate, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock,
  Globe,
  Landmark,
  MapPin,
  Rocket,
  Sparkles,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { useContent, useT } from "@/components/i18n/locale-provider";
import { TechGlyph } from "@/components/icons/tech-icons";
import { experience as experienceEn } from "@/data/experience";
import { skillCategories as skillsEn } from "@/data/skills";
import type { ExperienceItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Sep 2025" → months since year 0. Dates are read from the English data, whatever the locale. */
function monthIndex(date: string | null) {
  if (!date) {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  const [mon, year] = date.trim().split(/\s+/);
  const m = MONTHS.indexOf(mon.slice(0, 3).toLowerCase());
  return Number(year) * 12 + Math.max(m, 0);
}

/** Inclusive length of a role in months: Jan–Jul is 7. */
const monthsIn = (start: string, end: string | null) => monthIndex(end) - monthIndex(start) + 1;

/** Tech name → icon key, from the skills data, plus the spellings experience uses. */
const ICON_OF: Record<string, string> = {
  ...Object.fromEntries(skillsEn.flatMap((c) => c.skills.map((s) => [s.name, s.icon]))),
  "React.js": "react",
  Firebase: "firebase",
  Bootstrap: "bootstrap",
};

const real = (url?: string) => !!url && url !== "#";

const panelSwap: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE, staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

/** How many contributions show before the rest fold into the drawer. */
const SHOWN_CONTRIBUTIONS = 2;

/**
 * How numeric a contribution's headline is: the count of figures inside its **bold** results
 * ("13,500+", "6 of its 7"), so measurable impact leads. Western digits only; years are skipped.
 */
function impactScore(text: string) {
  const bold = [...text.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]).join(" ");
  return (bold.match(/\d[\d,.]*/g) ?? []).filter((n) => !/^(19|20)\d{2}$/.test(n)).length;
}

/**
 * Key contributions: the first few always show (they carry the headline results); the rest sit in
 * a drawer that slides open on "Show N more". The panel remounts per role, so each role opens
 * collapsed.
 */
function Contributions({ items }: { items: string[] }) {
  const t = useT();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  // Contributions with the most numbers first (a stable sort, so ties keep their written order).
  const ranked = items
    .map((text, i) => ({ text, i, score: impactScore(text) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.text);
  const shown = ranked.slice(0, SHOWN_CONTRIBUTIONS);
  const rest = ranked.slice(SHOWN_CONTRIBUTIONS);

  const row = (r: string, delay: number) => (
    <motion.li
      key={r}
      initial={reduce ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay, ease: EASE }}
      className="flex gap-3 text-sm text-foreground/85"
    >
      <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
      <span className="text-pretty leading-relaxed">{withBold(r)}</span>
    </motion.li>
  );

  return (
    <motion.div variants={item} className="flex flex-col gap-3">
      <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{t.experience.contributions}</p>
      <ul className="flex flex-col gap-2.5">{shown.map((r, i) => row(r, 0.15 + i * 0.06))}</ul>

      {rest.length > 0 && (
        <>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={drawerId}
                key="drawer"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <ul className="flex flex-col gap-2.5">{rest.map((r, i) => row(r, 0.08 + i * 0.06))}</ul>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={drawerId}
            className="group/more inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 py-1 ps-3 pe-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {open ? t.experience.showLess : t.experience.showMore(rest.length)}
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ChevronDown
                className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")}
                aria-hidden
              />
            </span>
          </button>
        </>
      )}
    </motion.div>
  );
}

/** Renders **marked** phrases (key results in a contribution) in bold, so they can be skimmed. */
function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

/** "https://www.uda.gov.lk/" → "uda.gov.lk". */
export function domainOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const COUNTRY_CODES: Record<string, string> = { "Sri Lanka": "LK", Australia: "AU" };

/** A role's country as a two-letter code, from the English location ("…, Sri Lanka" → "LK"). */
function countryCodeOf(id: string) {
  const country = experienceEn.find((x) => x.id === id)?.location.split(",").pop()?.trim() ?? "";
  return COUNTRY_CODES[country] ?? country.slice(0, 2).toUpperCase();
}

const MODE_ICONS: Record<string, LucideIcon> = { "On-site": Building2, Remote: Wifi, Hybrid: ArrowLeftRight };
const SECTOR_ICONS: Record<NonNullable<ExperienceItem["sector"]>, LucideIcon> = {
  government: Landmark,
  international: Globe,
};
/** Government work in the accent colour; international work in the second accent, so it stands out. */
const SECTOR_TONES: Record<NonNullable<ExperienceItem["sector"]>, string> = {
  government: "border-primary/30 bg-primary/10 text-primary",
  international: "border-chart-2/35 bg-chart-2/10 text-chart-2",
};

/** The rail's one-line workplace summary: "📶 Remote · 🌐 Intl · AU", with icons. */
function WorkplaceLine({ exp }: { exp: ExperienceItem }) {
  const t = useT();
  const ModeIcon = MODE_ICONS[exp.locationType] ?? Building2;
  const SectorIcon = exp.sector ? SECTOR_ICONS[exp.sector] : null;
  return (
    <span className="hidden items-center gap-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
      <span className="inline-flex items-center gap-1">
        <ModeIcon className="size-3" />
        {t.experience.locationTypes[exp.locationType] ?? exp.locationType}
      </span>
      {exp.sector && SectorIcon && (
        <>
          <span aria-hidden className="text-muted-foreground/50">·</span>
          <span
            dir="ltr"
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-px uppercase tracking-wider",
              exp.sector === "international" ? "border-chart-2/40 text-chart-2" : "border-primary/30 text-primary/90"
            )}
          >
            <SectorIcon className="size-2.5" />
            {t.experience.sectorTags[exp.sector]} · {countryCodeOf(exp.id)}
          </span>
        </>
      )}
    </span>
  );
}

/** "About the workplace": one line on what the organisation is, under the role header. */
function Workplace({ role }: { role: ExperienceItem }) {
  const t = useT();
  if (!role.about) return null;
  const SectorIcon = role.sector ? SECTOR_ICONS[role.sector] : Building2;

  return (
    <motion.div
      variants={item}
      className={cn(
        "relative flex gap-4 overflow-hidden rounded-xl border p-4",
        role.sector === "international" ? "border-chart-2/25" : "border-primary/20"
      )}
    >
      {/* A soft wash in the sector's colour. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-br to-transparent rtl:bg-linear-to-bl",
          role.sector === "international" ? "from-chart-2/10" : "from-primary/10"
        )}
      />
      <span
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-xl border",
          role.sector ? SECTOR_TONES[role.sector] : "border-border text-muted-foreground"
        )}
      >
        <span className="float-soft flex">
          <SectorIcon className="size-5" strokeWidth={1.5} />
        </span>
      </span>
      {/* Label, description, then the chips on their own row, so every role's box reads alike. */}
      <div className="relative flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{t.experience.aboutWorkplace}</p>
        <p className="text-pretty text-sm leading-relaxed text-foreground/90">{role.about}</p>
        <WorkplaceChips role={role} />
      </div>
    </motion.div>
  );
}

const chipPop: Variants = { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } };

/**
 * How the role was done (on-site, remote, hybrid), as a chip beside the role title. Remote roles
 * also show the two cities and the time difference between them.
 */
function ModeChip({ role }: { role: ExperienceItem }) {
  const t = useT();
  const ModeIcon = MODE_ICONS[role.locationType] ?? Building2;
  const mode = t.experience.locationTypes[role.locationType] ?? role.locationType;

  if (!role.remote) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 text-xs font-medium">
        <ModeIcon className="size-3.5 text-primary" />
        {mode}
      </span>
    );
  }

  const [min, max] = role.remote.gapHours;
  const to = role.location.split(/[,،]/)[0].trim();
  return (
    <span
      title={t.experience.timeGapTitle(role.remote.from, to, min, max)}
      className="inline-flex shrink-0 items-center overflow-hidden rounded-lg border border-chart-2/35 bg-chart-2/10 text-xs font-medium"
    >
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-chart-2">
        <ModeIcon className="size-3.5" />
        {mode}
      </span>
      <span className="inline-flex items-center gap-1.5 border-s border-chart-2/25 bg-background/50 px-2.5 py-1">
        <Clock className="size-3.5 text-chart-2" />
        <span>
          {role.remote.from} <span aria-hidden className="text-chart-2">↔</span> {to}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">· {t.experience.timeGap(min, max)}</span>
      </span>
    </span>
  );
}

/**
 * The workplace in chips, inside "About the workplace": who it is (sector and country), and its
 * business registration when there is one.
 */
function WorkplaceChips({ role }: { role: ExperienceItem }) {
  const t = useT();
  const reduce = useReducedMotion();
  const SectorIcon = role.sector ? SECTOR_ICONS[role.sector] : Building2;
  const code = countryCodeOf(role.id);

  return (
    <motion.ul
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } } }}
      className="mt-1 flex flex-wrap gap-1.5"
    >
      {role.sector && (
        <motion.li
          variants={chipPop}
          className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", SECTOR_TONES[role.sector])}
        >
          <SectorIcon className="size-3.5" />
          {t.experience.sectors[role.sector]} · {t.experience.countries[code] ?? code}
        </motion.li>
      )}
      {/* How big the organisation is. */}
      {role.teamSize && (
        <motion.li
          variants={chipPop}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 text-xs font-medium"
        >
          <Users className="size-3.5 text-primary" />
          <span dir="ltr" className="tabular-nums">
            {t.experience.staff(role.teamSize)}
          </span>
        </motion.li>
      )}
      {/* Proof the organisation exists: its public business-register record. */}
      {role.registry && (
        <motion.li variants={chipPop}>
          <a
            href={role.registry.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group/reg inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-emerald-400"
          >
            <BadgeCheck className="size-3.5" />
            {t.experience.registered}
            <span dir="ltr" className="font-mono text-[10px] opacity-80">
              · {role.registry.id}
            </span>
            <ArrowUpRight className="size-3 transition-transform duration-300 group-hover/reg:-translate-y-0.5 group-hover/reg:translate-x-0.5 rtl:-scale-x-100" />
          </a>
        </motion.li>
      )}
    </motion.ul>
  );
}

/**
 * What goes inside a company badge: the logo when there is one, else the monogram. Unselected
 * logos sit in greyscale and come to colour on hover, so the selected company stands out.
 */
function BadgeMark({ exp, sizes, muted = false }: { exp: ExperienceItem; sizes: string; muted?: boolean }) {
  if (!exp.logo) return <>{monogramOf(exp)}</>;
  const cover = exp.logoFit === "cover";
  return (
    <span className={cn("absolute inset-0 overflow-hidden rounded-[inherit]", !cover && "bg-white")}>
      <Image
        src={exp.logo}
        alt=""
        fill
        sizes={sizes}
        className={cn(
          "transition-[filter,opacity] duration-500",
          cover ? "object-cover" : "object-contain p-1",
          muted && "opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0"
        )}
      />
    </span>
  );
}

/** Badge letters: the data's monogram, else the organisation's initials. */
function monogramOf(exp: ExperienceItem) {
  return (
    exp.monogram ??
    exp.organization
      .split(/\s+/)
      .filter((w) => /^\p{Lu}/u.test(w))
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
  );
}

/**
 * Work history as an explorer, laid out like the skills section: the roles on a timeline rail,
 * and the chosen role in a panel beside it with what was done, the stack it was done with, and
 * the live products shipped there. (The career numbers, CareerStats, close the hero.)
 */
export function ExperienceExplorer() {
  const t = useT();
  const { experience } = useContent();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const [centers, setCenters] = useState<number[]>([]);
  const [ends, setEnds] = useState<{ next?: number; start?: number }>({});
  const role = experience[active];

  // Where each badge's centre sits on the rail, so the timeline joins them exactly (even when a
  // long title wraps). Re-measured whenever the rail changes size.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => {
      const top = rail.getBoundingClientRect().top;
      const centreOf = (el: Element | null | undefined) => {
        if (!el) return undefined;
        const b = el.getBoundingClientRect();
        // Hidden (display: none) on small screens: nothing to join.
        return b.height ? b.top - top + b.height / 2 : undefined;
      };
      setCenters(tabs.current.map((tab) => centreOf(tab?.querySelector("[data-badge]")) ?? 0));
      setEnds({
        next: centreOf(rail.querySelector('[data-node="next"] [data-mark]')),
        start: centreOf(rail.querySelector('[data-node="start"] [data-mark]')),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [experience.length]);

  const select = (i: number, focus = false) => {
    const next = (i + experience.length) % experience.length;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  // Arrow keys move between roles (mirrored for right-to-left), Home/End jump to the ends.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    if (step) select(i + step, true);
    else if (e.key === "Home") select(0, true);
    else if (e.key === "End") select(experience.length - 1, true);
    else return;
    e.preventDefault();
  };

  // The panel's border catches a light that follows the cursor.
  const onPanelMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const durationOf = (id: string) => {
    const en = experienceEn.find((x) => x.id === id);
    if (!en) return "";
    const n = monthsIn(en.startDate, en.endDate);
    return t.experience.duration(Math.floor(n / 12), n % 12);
  };
  // Each role's length as a share of the longest, for its tenure bar.
  const longest = Math.max(...experienceEn.map((x) => monthsIn(x.startDate, x.endDate)));
  const shareOf = (id: string) => {
    const en = experienceEn.find((x) => x.id === id);
    return en ? monthsIn(en.startDate, en.endDate) / longest : 0;
  };
  const firstYear = Math.min(...experienceEn.map((x) => Math.floor(monthIndex(x.startDate) / 12)));

  return (
    <div className="flex flex-col gap-10">
      <div className="project-grid grid gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8">
        {/* The roles: a scrolling row on phones, a timeline rail on large screens. */}
        {/* Sticks beside the panel while a long role scrolls past. */}
        <div ref={railRef} className="relative lg:sticky lg:top-28 lg:self-start">
          <Timeline centers={centers} ends={ends} active={active} />

          {/* The future end of the line: open to what comes next. */}
          <a
            href="#contact"
            data-node="next"
            className="group/next relative mb-2 hidden items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:flex"
          >
            <span
              data-mark
              className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-primary/60 bg-card text-primary transition-transform duration-300 group-hover/next:scale-105"
            >
              <span className="absolute inset-0 animate-ping rounded-xl border border-primary/40 [animation-duration:2.4s] motion-reduce:animate-none" />
              <span className="float-soft flex">
                <Sparkles className="size-4" />
              </span>
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">{t.experience.next.label}</span>
              <span className="text-sm font-semibold leading-snug">{t.experience.next.title}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover/next:text-primary">
                {t.experience.next.cta}
                <ArrowRight className="size-3 transition-transform duration-300 group-hover/next:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/next:-translate-x-0.5" />
              </span>
            </span>
          </a>

          <div
            role="tablist"
            aria-label={t.experience.roles}
            aria-orientation="vertical"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
          >
            {experience.map((exp, i) => {
              const selected = i === active;
              const current = exp.endDate === null;
              return (
                <motion.button
                  key={exp.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`exp-tab-${exp.id}`}
                  aria-selected={selected}
                  aria-controls="exp-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  initial={reduce ? false : { opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                  className="group relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:gap-4 lg:px-4 lg:py-4"
                >
                  {selected && (
                    <motion.span
                      layoutId="experience-active-tab"
                      aria-hidden
                      className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/8 shadow-[0_14px_40px_-22px] shadow-primary/70"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {/* On selection, a sheen sweeps once across the card. */}
                  {selected && !reduce && (
                    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                      <motion.span
                        key={`sheen-${active}`}
                        className="absolute inset-y-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-primary/15 to-transparent"
                        initial={{ left: "-40%" }}
                        animate={{ left: "120%" }}
                        transition={{ duration: 1.1, delay: 0.15, ease: "easeInOut" }}
                      />
                    </span>
                  )}
                  <span
                    data-badge
                    dir="ltr"
                    className={cn(
                      // Solid card colour under the tint, so the timeline passes behind the badge.
                      "relative flex size-10 shrink-0 items-center justify-center rounded-xl border bg-card font-mono text-[11px] font-semibold tracking-tight transition-colors duration-500",
                      selected
                        ? "border-primary/50 bg-linear-to-br from-primary/30 to-primary/5 text-primary shadow-[0_0_20px_-4px] shadow-primary/60"
                        : i < active
                          ? "border-primary/40 text-primary/80" // on the lit stretch of the timeline
                          : "border-border text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <BadgeMark exp={exp} sizes="40px" muted={!selected} />
                    {/* On selection, a ripple rings out from the badge. */}
                    {selected && !reduce && (
                      <motion.span
                        key={`ripple-${active}`}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-xl border-2 border-primary"
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    )}
                    {current && (
                      <span className="absolute -end-1 -top-1 flex size-3">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-3 rounded-full border-2 border-card bg-emerald-500" />
                      </span>
                    )}
                  </span>
                  <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        "truncate text-sm font-semibold transition-colors lg:text-base",
                        selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {exp.role}
                    </span>
                    <span className="hidden truncate text-xs text-muted-foreground sm:block">{exp.organization}</span>
                    {/* Workplace at a glance: how (mode) and for whom (sector · country). */}
                    <WorkplaceLine exp={exp} />
                    <span className="hidden items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground/80 lg:flex">
                      <span className="truncate">
                        {exp.startDate} — {exp.endDate ?? t.common.present}
                      </span>
                      <span className={cn("shrink-0", selected && "text-primary")}>{durationOf(exp.id)}</span>
                    </span>
                    {/* Tenure: how long the role lasted, against the longest one. */}
                    <span aria-hidden className="mt-1.5 hidden h-1 overflow-hidden rounded-full bg-border/60 lg:block">
                      <motion.span
                        className={cn(
                          "relative block h-full overflow-hidden rounded-full transition-colors duration-500",
                          selected ? "bg-linear-to-r from-primary to-chart-2 rtl:bg-linear-to-l" : "bg-muted-foreground/40"
                        )}
                        initial={reduce ? false : { width: 0 }}
                        whileInView={{ width: `${shareOf(exp.id) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.12, ease: EASE }}
                        style={reduce ? { width: `${shareOf(exp.id) * 100}%` } : undefined}
                      >
                        {/* The selected role's bar shimmers. */}
                        {selected && (
                          <span className="line-shimmer absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden" />
                        )}
                      </motion.span>
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* The far end of the line: where the career began. */}
          <div data-node="start" className="mt-2 hidden items-center gap-4 px-4 py-2 lg:flex">
            <span data-mark className="flex size-10 shrink-0 items-center justify-center">
              <span className="size-2.5 animate-pulse rounded-full bg-muted-foreground/60 ring-4 ring-background" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.experience.startedIn(String(firstYear))}
            </span>
          </div>
        </div>

        {/* The panel. */}
        <div
          role="tabpanel"
          id="exp-panel"
          aria-labelledby={`exp-tab-${role.id}`}
          onPointerMove={onPanelMove}
          className="project-tile relative rounded-2xl border border-border bg-card shadow-[0_30px_80px_-50px] shadow-primary/40"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_80%_60%_at_100%_0%,black,transparent)]" />
            <div className="absolute -top-24 -end-24 size-72 rounded-full bg-primary/12 blur-3xl" />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={role.id}
              variants={panelSwap}
              initial={reduce ? false : "hidden"}
              animate="show"
              exit={reduce ? undefined : "exit"}
              className="relative flex flex-col gap-6 p-5 sm:p-7"
            >
              <RoleHeader role={role} duration={durationOf(role.id)} />
              <Workplace role={role} />

              {role.summary && (
                <motion.p variants={item} className="text-pretty text-[15px] leading-relaxed text-foreground/85">
                  {role.summary}
                </motion.p>
              )}

              {role.responsibilities.length > 0 && <Contributions items={role.responsibilities} />}

              {role.technologies.length > 0 && (
                <motion.div variants={item} className="flex flex-col gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{t.experience.stack}</p>
                  <ul className="flex flex-wrap gap-2">
                    {/* Icons come from the English names, which the Arabic list mirrors by position. */}
                    {role.technologies.map((tech, i) => {
                      const en = experienceEn.find((x) => x.id === role.id)?.technologies[i] ?? tech;
                      return (
                        <li
                          key={tech}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 text-xs transition-colors hover:border-primary/40"
                        >
                          <TechGlyph icon={ICON_OF[en]} className="size-3.5" />
                          {tech}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}

              <Shipped role={role} />

              {role.isPlaceholder && (
                <p className="font-mono text-[11px] text-muted-foreground/70">{t.experience.placeholder}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>    </div>
  );
}

/**
 * The career line between the role badges (large screens). It draws itself in once on screen, a
 * glowing fill runs from the latest role down to the selected one, and a light travels along it.
 */
function Timeline({
  centers,
  ends,
  active,
}: {
  centers: number[];
  ends: { next?: number; start?: number };
  active: number;
}) {
  const reduce = useReducedMotion();
  if (centers.length < 2) return null;
  const first = centers[0];
  const last = centers[centers.length - 1];
  const length = last - first;
  const filled = Math.max(0, (centers[active] ?? first) - first);
  const x = "calc(2.25rem - 0.5px)";

  return (
    <>
      {/* Dashed: the stretch still to come, from "what's next" down to the current role. */}
      {ends.next !== undefined && (
        <span
          aria-hidden
          className="dash-flow pointer-events-none absolute hidden w-px lg:block"
          style={{ top: ends.next, height: first - ends.next, insetInlineStart: x }}
        />
      )}
      {/* Fading out below the first role, towards where it started. */}
      {ends.start !== undefined && (
        <span
          aria-hidden
          className="pointer-events-none absolute hidden w-px bg-linear-to-b from-border to-transparent lg:block"
          style={{ top: last, height: ends.start - last, insetInlineStart: x }}
        />
      )}
    <div
      aria-hidden
      className="pointer-events-none absolute hidden w-px lg:block"
      style={{ top: first, height: length, insetInlineStart: "calc(2.25rem - 0.5px)" }}
    >
      {/* The track, drawing itself downward. */}
      <motion.span
        className="absolute inset-0 origin-top bg-border"
        initial={reduce ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      {/* The lit stretch, from the latest role to the selected one. */}
      <motion.span
        className="absolute inset-x-0 top-0 rounded-full bg-linear-to-b from-primary via-primary to-chart-2 shadow-[0_0_12px_1px] shadow-primary/70"
        initial={false}
        animate={{ height: filled }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
      />
      {/* A light running down the whole line. */}
      <span className="absolute -inset-x-px inset-y-0 overflow-hidden motion-reduce:hidden">
        <span className="timeline-beam absolute inset-x-0 h-16 bg-linear-to-b from-transparent via-primary to-transparent" />
      </span>
    </div>
    </>
  );
}

function RoleHeader({ role, duration }: { role: ExperienceItem; duration: string }) {
  const t = useT();
  const current = role.endDate === null;
  return (
    <motion.div variants={item} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start gap-4">
        <span
          dir="ltr"
          className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/40 bg-linear-to-br from-primary/30 to-primary/5 font-mono text-sm font-semibold tracking-tight text-primary shadow-[0_12px_30px_-14px] shadow-primary/60"
        >
          <BadgeMark exp={role} sizes="56px" />
        </span>
        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
          {/* Title and "Current" stay on one line. */}
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 text-xl font-semibold tracking-tight sm:text-2xl">{role.role}</h3>
            {current && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-current" />
                {t.experience.current}
              </span>
            )}
          </div>
          {/* The organisation, with its own site beside it. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-medium text-primary sm:text-base">{role.organization}</p>
            {role.website && (
              <a
                href={role.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group/web inline-flex items-center gap-1 rounded-md font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Globe className="size-3" />
                <span dir="ltr">{domainOf(role.website)}</span>
                <ArrowUpRight className="size-3 transition-transform duration-300 group-hover/web:-translate-y-0.5 group-hover/web:translate-x-0.5 rtl:-scale-x-100" />
              </a>
            )}
          </div>
        </div>
        {/* How the role was done, to the side of the title. */}
        <ModeChip role={role} />
      </div>

      {/* Meta, as a row of quiet chips. */}
      <div className="flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
          <CalendarDays className="size-3" />
          {role.startDate} — {role.endDate ?? t.common.present}
          <span className="text-primary/60">· {duration}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
          <Briefcase className="size-3" />
          {role.employmentType}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
          <MapPin className="size-3" />
          {role.location}
        </span>
      </div>
    </motion.div>
  );
}

/** Live products built in the role, each a small screenshot card linking to the site. */
function Shipped({ role }: { role: ExperienceItem }) {
  const t = useT();
  const { projects } = useContent();
  const shipped = (role.projects ?? [])
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p) => p && real(p.liveUrl));
  if (!shipped.length) return null;

  // A single product gets a full-width feature card rather than a lone small tile.
  if (shipped.length === 1) {
    const p = shipped[0]!;
    const host = domainOf(p.liveUrl!);
    return (
      <motion.div variants={item} className="flex flex-col gap-3 border-t border-dashed border-border pt-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{t.experience.shipped}</p>
        <a
          href={p.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/ship relative flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-background/60 p-2 pe-4 transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_20px_50px_-26px] hover:shadow-primary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {p.image && (
            <span className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-lg border border-border sm:w-40">
              <Image
                src={p.image}
                alt={t.projects.screenshot(p.title)}
                fill
                sizes="160px"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover/ship:scale-105"
              />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm font-semibold transition-colors group-hover/ship:text-primary">{p.title}</span>
            <span className="line-clamp-1 text-pretty text-xs text-muted-foreground">{p.description}</span>
            <span className="mt-0.5 inline-flex items-center gap-2 text-xs font-medium text-primary">
              {t.experience.visitLive}
              <span dir="ltr" className="font-mono text-[11px] text-muted-foreground">
                {host}
              </span>
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/ship:-translate-y-0.5 group-hover/ship:translate-x-0.5 rtl:-scale-x-100" />
            </span>
          </span>
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div variants={item} className="flex flex-col gap-3 border-t border-dashed border-border pt-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{t.experience.shipped}</p>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {shipped.map((p) => (
          <li key={p!.slug}>
            <a
              href={p!.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/ship flex items-center gap-3 rounded-xl border border-border bg-background/60 p-1.5 pe-3 transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_14px_34px_-20px] hover:shadow-primary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {p!.image && (
                <span className="relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={p!.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover object-top transition-transform duration-500 group-hover/ship:scale-110"
                  />
                </span>
              )}
              {/* Up to two lines, so names like "UDA Property Bidding Portal" aren't cut off. */}
              <span className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug font-medium transition-colors group-hover/ship:text-primary">
                {p!.title}
              </span>
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover/ship:-translate-y-0.5 group-hover/ship:translate-x-0.5 group-hover/ship:text-primary rtl:-scale-x-100" />
            </a>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

type Stat = {
  key: string;
  Icon: LucideIcon;
  /** A small lead-in before the number, e.g. a currency code. */
  prefix?: string;
  n: number;
  unit?: string;
  label: string;
  proof: string;
  /** Countries to spotlight as chips under the label. */
  countries?: { code: string; name: string; international: boolean }[];
  /** Lit segments in the card's meter (one per year, product…). */
  segments: number;
  tone: "primary" | "chart-2";
};

/**
 * Career at a glance, chosen for what international hiring managers look for: seniority, shipped
 * work, remote readiness, and production scale. Every figure is computed from the portfolio's own
 * data and carries a one-line proof of where it comes from. Shown as the row closing the hero.
 */
export function CareerStats() {
  const t = useT();
  const { projects, experience } = useContent();
  const reduce = useReducedMotion();
  const g = t.experience.glance;

  const first = Math.min(...experienceEn.map((x) => monthIndex(x.startDate)));
  const years = Math.floor((monthIndex(null) - first + 1) / 12);
  const firstYear = Math.floor(first / 12);

  const live = projects.filter((p) => real(p.liveUrl)).length;
  // Every country worked for, with whether the work there was international (for its colour).
  const countries = [...new Set(experienceEn.map((x) => countryCodeOf(x.id)))].map((code) => ({
    code,
    name: t.experience.countries[code] ?? code,
    international: experienceEn.some((x) => countryCodeOf(x.id) === code && x.sector === "international"),
  }));

  // Roles' headline results (payments processed, people reached), labelled in the visitor's language.
  const headlines = experience.flatMap((x) => x.headlineStats ?? []);

  const stats: Stat[] = [
    { key: "years", Icon: CalendarDays, n: years, unit: "+", label: g.years(String(firstYear)), proof: "", countries, segments: years, tone: "primary" },
    { key: "shipped", Icon: Rocket, n: live, label: g.shipped, proof: g.shippedProof, segments: live, tone: "primary" },
    ...headlines.map(
      (h, i): Stat => ({
        key: `headline-${i}`,
        // A currency figure gets a banknote; a head count gets people.
        Icon: h.prefix ? Banknote : Users,
        prefix: h.prefix,
        n: h.value,
        unit: h.suffix,
        label: h.label,
        proof: h.proof,
        segments: h.segments,
        // The first headline takes the second accent, so the standout result stands out.
        tone: i === 0 ? "chart-2" : "primary",
      })
    ),
  ];

  // Cursor light along each card's border, as on the other panels.
  const onMove = (e: PointerEvent<HTMLDListElement>) => {
    if (e.pointerType !== "mouse") return;
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>("[data-tile]")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };

  return (
    <dl onPointerMove={onMove} className="project-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => {
        const accent = s.tone === "chart-2";
        return (
          <motion.div
            key={s.key}
            data-tile
            initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            className="project-tile group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-28px] hover:shadow-primary/50 motion-reduce:hover:translate-y-0"
          >
            {/* Dotted texture and a corner glow, clipped on their own layer. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[14px_14px] opacity-60 mask-[radial-gradient(ellipse_70%_70%_at_100%_0%,black,transparent)]" />
              <div
                className={cn(
                  "absolute -top-12 -end-12 size-32 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100",
                  accent ? "bg-chart-2/15 opacity-70" : "bg-primary/15 opacity-70"
                )}
              />
            </div>

            <div className="relative flex flex-col gap-1">
              {/* The number and its icon share a row. */}
              <div className="flex items-center justify-between gap-3">
                {/* No gap: "10", "M" and "+" read as one figure; the prefix keeps its own space. */}
                <dd dir="ltr" className="flex items-baseline font-semibold tracking-tight tabular-nums">
                  {s.prefix && (
                    <span className={cn("me-1.5 text-base sm:text-lg", accent ? "text-chart-2/80" : "text-primary/80")}>
                      {s.prefix}
                    </span>
                  )}
                  <span className={cn("text-4xl sm:text-5xl", accent ? "text-chart-2" : "text-shine motion-reduce:text-primary")}>
                    <CountUp to={s.n} />
                  </span>
                  {/* Words ("M", "yrs") sit on the baseline; a trailing "+" rises to the number's top. */}
                  {s.unit && s.unit.replace(/\+$/, "") && (
                    <span className={cn("text-lg sm:text-xl", accent ? "text-chart-2/80" : "text-primary/80")}>
                      {s.unit.replace(/\+$/, "")}
                    </span>
                  )}
                  {s.unit?.endsWith("+") && (
                    <span
                      className={cn(
                        "ms-0.5 self-start text-2xl leading-none sm:text-3xl",
                        accent ? "text-chart-2/80" : "text-primary/80"
                      )}
                    >
                      +
                    </span>
                  )}
                </dd>
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110",
                    accent ? "border-chart-2/30 bg-chart-2/10 text-chart-2" : "border-primary/30 bg-primary/10 text-primary"
                  )}
                >
                  <s.Icon className="size-4.5" />
                </span>
              </div>
              {/* Room for two lines on every card, so labels and what follows line up across the row. */}
              <dt className="min-h-[2.75em] text-sm font-medium leading-snug text-foreground/90">{s.label}</dt>
            </div>

            {/* Meter: one segment per unit, lighting up in turn. */}
            <div className="relative mt-auto flex flex-col gap-2">
              <div aria-hidden className="flex gap-1">
                {Array.from({ length: Math.min(s.segments, 8) }, (_, k) => (
                  <motion.span
                    key={k}
                    className={cn("h-1 flex-1 rounded-full", accent ? "bg-chart-2" : "bg-primary")}
                    initial={reduce ? false : { opacity: 0.15, scaleX: 0.4 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 + k * 0.12, ease: EASE }}
                  />
                ))}
              </div>
              {/* The proof line; on the years card it's the countries worked for, as chips that pop
                  in after the meter, so every card keeps the same shape. */}
              {s.countries && s.countries.length > 0 ? (
                <ul className="flex h-4 flex-wrap items-center gap-1.5">
                  {s.countries.map((c, k) => (
                    <motion.li
                      key={c.code}
                      initial={reduce ? false : { opacity: 0, scale: 0.8, y: 4 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.9 + i * 0.1 + k * 0.12, ease: EASE }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border ps-px pe-1.5 text-[11px] leading-4 font-semibold",
                        c.international
                          ? "border-chart-2/40 bg-chart-2/10 text-chart-2"
                          : "border-primary/35 bg-primary/10 text-primary"
                      )}
                    >
                      <span
                        dir="ltr"
                        className={cn(
                          "rounded-[3px] px-1 font-mono text-[9px] tracking-wider",
                          c.international ? "bg-chart-2/20" : "bg-primary/20"
                        )}
                      >
                        {c.code}
                      </span>
                      {c.name}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="inline-flex h-4 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className={cn("size-1.5 rounded-full", accent ? "bg-chart-2" : "bg-primary")} />
                  <span className="truncate">{s.proof}</span>
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </dl>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    // Thousands separators, so 13500 reads as 13,500.
    const format = (v: number) => Math.round(v).toLocaleString("en-US");
    if (reduce) {
      el.textContent = format(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => (el.textContent = format(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  // Starts at 0 on the server and the client alike; the effect sets the real figure.
  return <span ref={ref}>0</span>;
}
