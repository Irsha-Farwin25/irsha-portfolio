"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { SignalDivider } from "@/components/motion/signal";
import { SectionBackdrop } from "@/components/ui/section-backdrop";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { Kalam } from "next/font/google";
import { ruqaa } from "@/app/fonts/fonts";
import { ArrowLeft, ArrowRight, ArrowUpRight, XIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { LinkedinIcon } from "@/components/icons/brand-icons";
import { useContent, useLocale, useT } from "@/components/i18n/locale-provider";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import type { ExperienceItem, Recommendation } from "@/lib/types";

const hand = Kalam({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/** The handwriting font for the visitor's language. */
function useHand() {
  return useLocale() === "ar" ? ruqaa : hand;
}

/** The notes in the visitor's language: board + dialog order puts the featured note first. */
function useNotes() {
  const { recommendations } = useContent();
  const featured = recommendations.find((r) => r.featured);
  const ordered = featured ? [featured, ...recommendations.filter((r) => r !== featured)] : recommendations;
  const years = recommendations.map((r) => Number(r.date.slice(-4)));
  const yearSpan = `${Math.min(...years)} – ${Math.max(...years)}`;
  return { recommendations, featured, ordered, yearSpan };
}

type Fastener = "tape" | "clip" | "pin-red" | "pin-blue" | "pin-green" | "pin-amber";

/**
 * Per-position look, so the board reads as hand-arranged rather than a grid. `marker` is the
 * highlighter ink, picked to show on that paper (orange on yellow, yellow on the others…).
 */
const NOTE_LOOKS: { paper: string; tilt: number; fastener: Fastener; offset: string; marker: string }[] = [
  { paper: "bg-[#fdf0a0] dark:bg-[#e8da8b]", tilt: -1.5, fastener: "tape", offset: "", marker: "rgb(251 146 60 / 0.45)" },
  { paper: "bg-[#fbd5dd] dark:bg-[#e3bdc6]", tilt: -3, fastener: "pin-red", offset: "lg:mt-1", marker: "rgb(250 204 21 / 0.6)" },
  { paper: "bg-[#d3e8f6] dark:bg-[#bad0de]", tilt: 2.5, fastener: "pin-blue", offset: "lg:mt-5", marker: "rgb(250 204 21 / 0.6)" },
  { paper: "bg-[#d9f0c9] dark:bg-[#c0d7b1]", tilt: 2, fastener: "pin-green", offset: "lg:-mt-1", marker: "rgb(250 204 21 / 0.6)" },
  { paper: "bg-[#fde2bd] dark:bg-[#e4caa6]", tilt: -2.5, fastener: "clip", offset: "lg:mt-3", marker: "rgb(236 72 153 / 0.3)" },
];

/** When a note's drop-in has settled (its marker, stamp, and sway start after this). */
const landedAt = (index: number) => 0.1 + index * 0.09 + 0.55;

const PIN_GRADIENT: Record<Exclude<Fastener, "tape" | "clip">, string> = {
  "pin-red": "radial-gradient(circle at 35% 30%, #ff9a9a, #d0303a 55%, #7c1219)",
  "pin-blue": "radial-gradient(circle at 35% 30%, #9ec5ff, #2f6fd6 55%, #173b7a)",
  "pin-green": "radial-gradient(circle at 35% 30%, #a6f0b4, #2f9e4e 55%, #16552a)",
  "pin-amber": "radial-gradient(circle at 35% 30%, #ffe19a, #e0a21f 55%, #82560a)",
};

const noteBase =
  "relative flex h-full w-full flex-col rounded-[3px] p-4 pt-6 text-left text-[#2b2418] shadow-[0_1px_1px_rgb(0_0_0/0.12),0_14px_22px_-12px_rgb(0_0_0/0.55)]";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

function FastenerMark({ type }: { type: Fastener }) {
  if (type === "clip") {
    // A steel paper clip over the note's top edge, near the corner.
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 60"
        className="absolute -top-5 start-6 h-12 w-5 rotate-[8deg] drop-shadow-[0_2px_1.5px_rgb(0_0_0/0.45)]"
      >
        <defs>
          <linearGradient id="clip-steel" x1="0" x2="1">
            <stop offset="0" stopColor="#8a9099" />
            <stop offset="0.45" stopColor="#eef1f4" />
            <stop offset="1" stopColor="#7a808a" />
          </linearGradient>
        </defs>
        <path
          d="M7 22 V47 a5 5 0 0 0 10 0 V12 a8 8 0 0 0 -16 0 V50 a11 11 0 0 0 22 0 V20"
          fill="none"
          stroke="url(#clip-steel)"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === "tape") {
    return (
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 border border-white/40 bg-white/45 shadow-[0_1px_2px_rgb(0_0_0/0.15)] backdrop-blur-[1px]"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full shadow-[0_3px_3px_rgb(0_0_0/0.4)]"
      style={{ background: PIN_GRADIENT[type] }}
    />
  );
}

/** Soft paper sheen + curled bottom corner. */
function PaperShading() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[3px] bg-linear-to-b from-white/30 to-transparent to-40%" />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-7 rounded-tl-[10px] bg-linear-to-tl from-black/12 to-transparent to-60%"
      />
    </>
  );
}

/** `stamped` notes carry their date on the verified stamp instead. */
function KindLine({ item, stamped = false }: { item: Recommendation; stamped?: boolean }) {
  const t = useT();
  return (
    <div className="flex min-h-5 items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-black/50">
      <span className={item.kind === "Client" ? "font-semibold text-[#3730a3]" : undefined}>
        {t.recommendations.kinds[item.kind] ?? item.kind}
      </span>
      {!stamped && <span>{item.date}</span>}
    </div>
  );
}

/** The role two people worked together in, if the recommendation links one. */
function useRole(item: Recommendation): ExperienceItem | undefined {
  const { experience } = useContent();
  return item.experience ? experience.find((e) => e.id === item.experience) : undefined;
}

/** The company's logo, small, like a stamp on the note. */
function CompanyLogo({ role, size = 20 }: { role: ExperienceItem; size?: number }) {
  if (!role.logo) return null;
  const cover = role.logoFit === "cover";
  return (
    <span
      title={role.organization}
      className={cn("relative shrink-0 overflow-hidden rounded-[4px] ring-1 ring-black/10", !cover && "bg-white")}
      style={{ width: size, height: size }}
    >
      <Image
        src={role.logo}
        alt={role.organization}
        fill
        sizes={`${size}px`}
        className={cover ? "object-cover" : "object-contain p-px"}
      />
    </span>
  );
}

/** `stamped` notes carry the verified stamp instead, so the small LinkedIn mark is left off. */
function Signature({ item, stamped = false }: { item: Recommendation; stamped?: boolean }) {
  const t = useT();
  const role = useRole(item);
  return (
    <div className="flex min-w-0 items-center gap-2">
      {role && <CompanyLogo role={role} />}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm leading-tight font-semibold">
          {/* Long names wrap to a second line rather than being cut off. */}
          <span className="line-clamp-2">{item.name}</span>
          {item.verified && !stamped && (
            <LinkedinIcon className="size-3.5 shrink-0 text-[#0a66c2]" aria-label={t.recommendations.verified} />
          )}
        </p>
        <p className="mt-0.5 truncate text-xs text-black/55">{item.title}</p>
      </div>
    </div>
  );
}

/**
 * The pull-quote, with its key phrase swiped by a highlighter once the note has landed. The ink
 * fills in the reading direction; multi-line phrases fill each line at once.
 */
function MarkedQuote({ item, marker, mark }: { item: Recommendation; marker: string; mark: { on: boolean; delay: number } | null }) {
  const reduce = useReducedMotion();
  const text = item.highlight;
  const at = item.keyPhrase ? text.indexOf(item.keyPhrase) : -1;
  if (at === -1 || !item.keyPhrase) return <>&ldquo;{text}&rdquo;</>;
  const phrase = item.keyPhrase;
  const ink = { backgroundImage: `linear-gradient(${marker}, ${marker})` };
  return (
    <>
      &ldquo;{text.slice(0, at)}
      <motion.span
        className="box-decoration-clone rounded-[2px] bg-no-repeat [background-position:0_85%] rtl:[background-position:100%_85%]"
        style={ink}
        initial={reduce || !mark ? false : { backgroundSize: "0% 60%" }}
        animate={{ backgroundSize: !mark || mark.on || reduce ? "100% 60%" : "0% 60%" }}
        transition={{ duration: 0.7, delay: mark?.delay ?? 0, ease: [0.65, 0, 0.35, 1] }}
      >
        {phrase}
      </motion.span>
      {text.slice(at + phrase.length)}&rdquo;
    </>
  );
}

/**
 * A rubber stamp, slightly crooked, that thumps onto the note's top corner once it has landed.
 * It carries the date, so it sits in the kind line's space and never covers the quote.
 */
function VerifiedStamp({ show, delay, date }: { show: boolean; delay: number; date: string }) {
  const t = useT();
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute end-3 top-3.5 z-10 inline-flex items-center gap-1 rounded-[4px] border-2 border-[#0a66c2]/55 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em] text-[#0a66c2]/75 uppercase mix-blend-multiply [box-shadow:inset_0_0_0_1px_rgb(10_102_194/0.25)]"
      initial={reduce ? false : { opacity: 0, scale: 1.9, rotate: 2 }}
      animate={show || reduce ? { opacity: 1, scale: 1, rotate: -6 } : { opacity: 0, scale: 1.9, rotate: 2 }}
      transition={{ type: "spring", stiffness: 520, damping: 20, delay }}
    >
      <LinkedinIcon className="size-2.5" />✓ {t.recommendations.stamp}
      <span className="font-medium opacity-75">· {date}</span>
    </motion.span>
  );
}

function NoteFace({
  item,
  big,
  marker,
  mark = null,
  stamped = false,
}: {
  item: Recommendation;
  big: boolean;
  marker: string;
  mark?: { on: boolean; delay: number } | null;
  stamped?: boolean;
}) {
  const hand = useHand();
  const t = useT();
  return (
    <>
      <KindLine item={item} stamped={stamped} />
      <p
        className={cn(
          hand.className,
          "mt-2 flex-1 text-pretty leading-snug",
          big ? "text-xl lg:text-[1.4rem]" : "text-base"
        )}
      >
        <MarkedQuote item={item} marker={marker} mark={mark} />
      </p>
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-black/20 pt-2.5">
        <Signature item={item} stamped={stamped} />
        {/* A handwritten nudge that the note opens. */}
        <span
          aria-hidden
          className={cn(
            hand.className,
            "inline-flex shrink-0 items-center gap-0.5 text-[13px] whitespace-nowrap text-black/45 transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-black/80 rtl:group-hover:-translate-x-0.5"
          )}
        >
          {t.recommendations.readMore}
          <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
        </span>
      </div>
    </>
  );
}

function BoardNote({
  item,
  index,
  inView,
  canDrag,
  reduce,
  isOpen,
  onOpen,
  register,
}: {
  item: Recommendation;
  index: number;
  inView: boolean;
  canDrag: boolean;
  reduce: boolean;
  isOpen: boolean;
  onOpen: (index: number) => void;
  register: (index: number, el: HTMLButtonElement | null) => void;
}) {
  const look = NOTE_LOOKS[index % NOTE_LOOKS.length];
  const { featured } = useNotes();
  const big = item === featured;
  const tilt = reduce ? 0 : look.tilt;
  const dragged = useRef(false);

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: -56, rotate: tilt - 9, scale: 1.08 },
    shown: {
      opacity: 1,
      y: 0,
      rotate: tilt,
      scale: 1,
      transition: reduce
        ? { duration: 0.3 }
        : { type: "spring", stiffness: 260, damping: 17, delay: landedAt(index) - 0.55 },
    },
  };

  const cell = cn(
    "relative w-[80%] shrink-0 snap-center sm:w-auto",
    big && "sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center",
    // Side notes are only as tall as their words (not stretched to the row), like real notes.
    !big && cn("sm:self-start", look.offset)
  );

  // While a note is open, keep its slot on the board so nothing reflows.
  if (isOpen) {
    return (
      <div className={cell} aria-hidden>
        <div className={cn(noteBase, "invisible")}>
          <NoteFace item={item} big={big} marker={look.marker} />
        </div>
      </div>
    );
  }

  const landed = landedAt(index);

  return (
    // Hung from its pin, the note drifts a fraction of a degree, as if in a draught (each at its
    // own pace, so they never move in step).
    <motion.div
      className={cell}
      style={{ transformOrigin: "50% 0" }}
      animate={inView && !reduce ? { rotate: [0, 0.6, 0, -0.6, 0] } : undefined}
      transition={{ duration: 7 + index * 1.3, delay: landed + 0.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.button
        type="button"
        ref={(el) => register(index, el)}
        aria-haspopup="dialog"
        layoutId={reduce ? undefined : `note-${item.id}`}
        variants={variants}
        initial={false}
        animate={inView ? "shown" : "hidden"}
        whileHover={reduce ? undefined : { rotate: 0, scale: 1.035, y: -6 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        drag={canDrag}
        dragSnapToOrigin
        dragElastic={0.18}
        whileDrag={{ scale: 1.06, rotate: 0, zIndex: 30, cursor: "grabbing" }}
        transition={{ layout: { type: "spring", stiffness: 280, damping: 30 } }}
        onPointerDown={() => (dragged.current = false)}
        onDragStart={() => (dragged.current = true)}
        onClick={() => {
          if (dragged.current) return;
          onOpen(index);
        }}
        className={cn(
          noteBase,
          look.paper,
          "group outline-none transition-shadow duration-300 hover:shadow-[0_2px_2px_rgb(0_0_0/0.1),0_26px_34px_-14px_rgb(0_0_0/0.55)] focus-visible:ring-4 focus-visible:ring-white/80",
          canDrag ? "cursor-grab" : "cursor-pointer",
          big && "sm:p-5 sm:pt-7"
        )}
      >
        <FastenerMark type={look.fastener} />
        <PaperShading />
        <span className="sr-only">Open recommendation from {item.name}: </span>
        <NoteFace
          item={item}
          big={big}
          marker={look.marker}
          mark={{ on: inView, delay: landed + 0.15 }}
          stamped={!!item.verified}
        />
        {item.verified && <VerifiedStamp show={inView} delay={landed + 0.5} date={item.date} />}
      </motion.button>
    </motion.div>
  );
}

/** Renders a paragraph with the recommendation's pull-quote marked, if it appears in it. */
function WithHighlight({ text, highlight }: { text: string; highlight: string }) {
  const i = text.indexOf(highlight);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="box-decoration-clone bg-transparent bg-[linear-gradient(transparent_55%,rgb(99_102_241/0.28)_55%)] text-inherit">
        {highlight}
      </mark>
      {text.slice(i + highlight.length)}
    </>
  );
}

function NoteDialog({
  index,
  reduce,
  onClose,
  onStep,
}: {
  index: number;
  reduce: boolean;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const { ordered } = useNotes();
  const t = useT();
  const item = ordered[index];
  const role = useRole(item);
  const look = NOTE_LOOKS[index % NOTE_LOOKS.length];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  const navButton =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-black/60 transition-colors hover:bg-black/8 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recommendation-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <AnimatePresence initial={false}>
        <motion.article
          key={item.id}
          layoutId={reduce ? undefined : `note-${item.id}`}
          initial={reduce ? { opacity: 0 } : { rotate: look.tilt }}
          animate={reduce ? { opacity: 1 } : { rotate: 0 }}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={{ layout: { type: "spring", stiffness: 280, damping: 30 }, rotate: { duration: 0.35 } }}
          className={cn(noteBase, look.paper, "h-auto max-h-[90vh] max-w-2xl p-0 pt-0 shadow-2xl")}
        >
          <FastenerMark type={look.fastener} />
          <PaperShading />

          <motion.div
            className="relative flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.18, duration: 0.25 } }}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-7 sm:px-8">
              <div className="min-w-0" id="recommendation-dialog-title">
                <Signature item={item} />
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label={t.common.close}
                onClick={onClose}
                className="-mt-1 -me-2 flex size-8 shrink-0 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-black/8 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="shrink-0 px-6 pt-3 sm:px-8">
              <KindLine item={item} />
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-black/40">{item.relationship}</p>
            </div>

            {/* The full text in the site's own type (handwriting stays on the board), so long
                recommendations are easy to read. */}
            <div
              ref={scrollRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-6 pt-4 pb-5 text-[15px] leading-relaxed text-[#2b2418] [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
            >
              {item.quote.split("\n\n").map((p, i) => (
                <p key={i} className="text-pretty">
                  <WithHighlight text={p} highlight={item.highlight} />
                </p>
              ))}
            </div>

            {role && (
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-dashed border-black/20 px-6 py-3 sm:px-8">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-black/70">
                  <CompanyLogo role={role} size={22} />
                  <span className="flex flex-col">
                    {t.recommendations.workedAt(role.organization)}
                    <span className="font-mono text-[10px] text-black/45">
                      {role.startDate} — {role.endDate ?? t.common.present}
                    </span>
                  </span>
                </span>
                <a
                  href="#experience"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-[#3730a3] transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                >
                  {t.recommendations.seeRole}
                  <ArrowRight className="size-3.5 rtl:-scale-x-100" />
                </a>
              </div>
            )}

            {ordered.length > 1 && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-dashed border-black/20 px-4 py-3 sm:px-6">
                <button type="button" onClick={() => onStep(-1)} className={navButton}>
                  <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
                  {t.common.previous}
                </button>
                <span className="font-mono text-[10px] tracking-[0.15em] text-black/45" aria-live="polite">
                  {String(index + 1).padStart(2, "0")} / {String(ordered.length).padStart(2, "0")}
                </span>
                <button type="button" onClick={() => onStep(1)} className={navButton}>
                  {t.common.next}
                  <ArrowRight className="size-3.5 rtl:-scale-x-100" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

/**
 * The board's title, punched out on a label maker: raised white capitals on glossy black tape,
 * stuck across the top of the frame. It thumps on as the board comes into view.
 */
function WallLabel({ count, show }: { count: number; show: boolean }) {
  const t = useT();
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="absolute -top-3.5 left-1/2 z-30 -translate-x-1/2"
      initial={reduce ? false : { opacity: 0, scale: 1.35, rotate: 3 }}
      animate={show || reduce ? { opacity: 1, scale: 1, rotate: -1.5 } : { opacity: 0, scale: 1.35, rotate: 3 }}
      transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.1 }}
    >
      <span
        className="relative inline-flex items-center gap-2 rounded-[3px] bg-[#141414] px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.28em] whitespace-nowrap text-white/90 uppercase shadow-[0_6px_14px_-6px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.12)] sm:text-xs"
        // Embossed letters: a dark drop below, a light catch above, like pressed plastic tape.
        style={{ textShadow: "0 1px 0 rgb(0 0 0 / 0.85), 0 -1px 0 rgb(255 255 255 / 0.18)" }}
      >
        {/* Glossy sheen across the top half of the tape. */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[3px] bg-linear-to-b from-white/12 to-transparent" />
        <span aria-hidden className="text-[#f5c518]">★</span>
        {t.recommendations.wallLabel(count)}
      </span>
    </motion.span>
  );
}

/** Whole years a role lasted, from the years in its dates ("Sep 2023" … "Aug 2025" → 2). */
function yearsIn(role: ExperienceItem) {
  const end = role.endDate ?? String(new Date().getFullYear());
  return Number(end.slice(-4)) - Number(role.startDate.slice(-4));
}

/** A tick drawn in pen, stroke by stroke. */
function PenTick({ draw, delay }: { draw: boolean; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="absolute -top-1.5 -left-0.5 size-4 text-[#1f4fb8] rtl:right-0 rtl:left-auto">
      <motion.path
        d="M2.5 8.5 L6.5 12.5 L14 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: draw || reduce ? 1 : 0 }}
        transition={{ duration: 0.35, delay, ease: "easeOut" }}
      />
    </svg>
  );
}

/**
 * A to-do list on a page torn from a ruled notebook. The done items tick themselves off in turn;
 * the last, "Join your team", is the board's call to action: it's a link to the contact form, and
 * its box ticks itself on hover.
 */
function TodoNote({
  show,
  top,
  nodeRef,
}: {
  show: boolean;
  /** Distance from the board's top, measured from the left column; hidden until known. */
  top?: number;
  nodeRef: React.Ref<HTMLDivElement>;
}) {
  const t = useT();
  const hand = useHand();
  const [hover, setHover] = useState(false);
  const todo = t.recommendations.todo;
  // Boxes sit in the margin (left of the red line at 30px); the words start after it, as in a
  // real notebook. Rows match the 22px ruling.
  const row = "flex h-[22px] items-center gap-[15px] ps-[8px] pe-3";
  return (
    // The pin sits on this outer layer, so the torn edge (clipped below) can't cut it off.
    <div
      ref={nodeRef}
      className={cn(
        "absolute start-[3%] z-10 w-52 -rotate-3 drop-shadow-[0_10px_12px_rgb(0_0_0/0.4)] transition-opacity duration-500",
        top === undefined && "invisible opacity-0"
      )}
      style={{ top: top ?? 0 }}
    >
      <FastenerMark type="pin-blue" />
      <div
        className="pt-4 pb-2.5"
        style={{
          // Ruled lines and a red margin, like a school notebook.
          backgroundColor: "#fdfdf8",
          backgroundImage:
            "linear-gradient(90deg, transparent 30px, rgb(229 72 77 / 0.5) 30px, rgb(229 72 77 / 0.5) 31px, transparent 31px), repeating-linear-gradient(transparent 0 21px, rgb(96 165 250 / 0.35) 21px 22px)",
          backgroundPosition: "0 0, 0 16px",
          // The torn top edge.
          clipPath:
            "polygon(0 6px, 6% 2px, 12% 7px, 19% 1px, 26% 6px, 33% 2px, 40% 7px, 47% 1px, 54% 6px, 61% 2px, 68% 7px, 75% 1px, 82% 6px, 89% 2px, 95% 6px, 100% 3px, 100% 100%, 0 100%)",
        }}
      >
        <p className={cn(hand.className, "h-[22px] ps-[38px] text-base leading-[22px] font-bold text-[#1f2a44]")}>
          {todo.title}
        </p>
        <ul className={cn(hand.className, "text-[13.5px] leading-[22px] text-[#1f2a44]")}>
          {todo.done.map((item, i) => (
            <li key={item} className={row}>
              <span className="relative size-3 shrink-0 rounded-[2px] border-[1.5px] border-[#1f2a44]/55">
                <PenTick draw={show} delay={1.6 + i * 0.35} />
              </span>
              <span className="truncate opacity-75">{item}</span>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
              onFocus={() => setHover(true)}
              onBlur={() => setHover(false)}
              className={cn(row, "group/cta font-bold text-[#c2410c] outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c]/50")}
            >
              <span className="relative size-3 shrink-0 rounded-[2px] border-[1.5px] border-[#c2410c]">
                <PenTick draw={hover} delay={0} />
              </span>
              <span className="truncate underline decoration-dotted underline-offset-4 group-hover/cta:decoration-solid">{todo.next}</span>
              <ArrowRight className="size-3.5 shrink-0 transition-transform duration-300 group-hover/cta:translate-x-1 rtl:-scale-x-100 rtl:group-hover/cta:-translate-x-1" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

type Point = { x: number; y: number };

/**
 * Red yarn between the pins of two notes from the same team, sagging under its own weight, with a
 * paper tag hung at its lowest point. Draws itself in after the notes land.
 */
function TeamString({ from, to, label, show }: { from: Point; to: Point; label: string; show: boolean }) {
  const reduce = useReducedMotion();
  const hand = useHand();
  const sag = Math.min(70, 30 + Math.abs(to.x - from.x) * 0.25);
  const control = { x: (from.x + to.x) / 2, y: Math.max(from.y, to.y) + sag };
  // The tag hangs toward the first note, out over the open cork, not over the second note.
  const tagShift = from.x < to.x ? "-85%" : "-15%";
  // The curve's midpoint (a quadratic Bézier at t = ½), where the tag hangs.
  const mid = { x: (from.x + 2 * control.x + to.x) / 4, y: (from.y + 2 * control.y + to.y) / 4 };
  const d = `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`;

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible">
        <motion.path
          d={d}
          fill="none"
          stroke="#b3261e"
          strokeWidth={2.2}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 2px 1.5px rgb(0 0 0 / 0.35))" }}
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: show || reduce ? 1 : 0 }}
          transition={{ duration: 1.1, delay: 1.3, ease: [0.65, 0, 0.35, 1] }}
        />
        {/* A red pushpin at each end, holding the string to the note's edge. */}
        {[from, to].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={5}
            fill="url(#string-pin)"
            style={{ filter: "drop-shadow(0 2px 1.5px rgb(0 0 0 / 0.45))" }}
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: show || reduce ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 14, delay: i === 0 ? 1.2 : 2.3 }}
          />
        ))}
        <defs>
          <radialGradient id="string-pin" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff9a9a" />
            <stop offset="55%" stopColor="#d0303a" />
            <stop offset="100%" stopColor="#7c1219" />
          </radialGradient>
        </defs>
      </svg>
      <motion.span
        aria-hidden
        className={cn(
          hand.className,
          "pointer-events-none absolute z-20 rounded-[3px] bg-[#fffaf0] px-2.5 py-1 text-[13px] leading-none whitespace-nowrap text-[#3b2410] shadow-[0_6px_10px_-4px_rgb(0_0_0/0.5)]"
        )}
        style={{ left: mid.x, top: mid.y, x: tagShift, y: "10%" }}
        initial={reduce ? false : { opacity: 0, rotate: -12 }}
        animate={show || reduce ? { opacity: 1, rotate: 4 } : { opacity: 0, rotate: -12 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 2.2 }}
      >
        {/* The tag's string hole. */}
        <span className="me-1.5 inline-block size-1.5 rounded-full bg-[#b3261e]/70 align-middle" />
        {label}
      </motion.span>
    </>
  );
}

/** "start here", scrawled on the cork in marker, with an arrow curling down to the featured note. */
function StartHere({ at, show }: { at: Point; show: boolean }) {
  const t = useT();
  const hand = useHand();
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute z-20 flex items-end gap-1"
      // Above the note's top-left corner (in the cork's top margin), arrow curling down onto it.
      style={{ left: at.x, top: at.y, y: "-85%" }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: show || reduce ? 1 : 0 }}
      transition={{ duration: 0.4, delay: 1.9 }}
    >
      <span className={cn(hand.className, "-rotate-6 text-lg leading-none font-bold text-[#2b1a0a]/80")}>
        {t.recommendations.startHere}
      </span>
      <svg viewBox="0 0 48 40" className="h-9 w-11 text-[#2b1a0a]/75 rtl:-scale-x-100">
        <motion.path
          d="M4 6 C 22 4, 38 12, 40 32 M 33 26 L 40 33 L 45 25"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: show || reduce ? 1 : 0 }}
          transition={{ duration: 0.7, delay: 2.1, ease: "easeOut" }}
        />
      </svg>
    </motion.span>
  );
}

export function Recommendations() {
  const t = useT();
  const { socialLinks } = useContent();
  const { recommendations, ordered, yearSpan } = useNotes();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const [geo, setGeo] = useState<{ team?: [Point, Point]; featured?: Point; todo?: { top: number; pad: number } }>({});
  const todoRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  const mounted = useHasMounted();
  const reduce = useReducedMotion() ?? false;
  const finePointer = useMediaQuery("(pointer: fine) and (min-width: 768px)");
  const isGrid = useMediaQuery("(min-width: 640px)");
  const isWide = useMediaQuery("(min-width: 1024px)");
  const canDrag = finePointer && !reduce;
  const inView = useInView(boardRef, { once: true, margin: "0px 0px -15% 0px" });

  // The first two notes from the same team get joined by a string.
  const teamIndexes = ordered
    .map((r, i) => (r.experience ? i : -1))
    .filter((i) => i >= 0 && ordered[i].experience === ordered.find((r) => r.experience)?.experience)
    .slice(0, 2);
  const { experience } = useContent();
  const teamRole = experience.find((e) => e.id === ordered[teamIndexes[0]]?.experience);

  // Where the pins and the featured note sit on the board, measured once the notes have landed
  // and again whenever the board resizes. (Tilt is included: these are the drawn positions.)
  useEffect(() => {
    const board = boardRef.current;
    if (!board || !inView) return;
    const measure = () => {
      const b = board.getBoundingClientRect();
      const f = triggers.current[0]?.getBoundingClientRect();
      // The string runs from the first note's bottom edge (toward the second) to the second
      // note's facing side, low down, so it hangs through the open cork beneath them and never
      // crosses anyone's words.
      const [ra, rc] = teamIndexes.map((i) => triggers.current[i]?.getBoundingClientRect());
      let team: [Point, Point] | undefined;
      if (ra && rc) {
        const aIsLeft = ra.left + ra.width / 2 < rc.left + rc.width / 2;
        team = [
          { x: ra.left + ra.width * (aIsLeft ? 0.78 : 0.22) - b.left, y: ra.bottom - 7 - b.top },
          { x: (aIsLeft ? rc.left + 7 : rc.right - 7) - b.left, y: rc.top + rc.height * 0.86 - b.top },
        ];
      }
      // The to-do list hangs just under the left column's last note; the board then adds only the
      // bottom space the list needs beyond the notes (and room for the hint line).
      let todo: { top: number; pad: number } | undefined;
      const grid = scrollerRef.current?.getBoundingClientRect();
      const listHeight = todoRef.current?.offsetHeight;
      if (grid && listHeight) {
        const leftColumn = triggers.current
          .map((el) => el?.getBoundingClientRect())
          .filter((r): r is DOMRect => !!r && r.left + r.width / 2 < b.left + b.width / 3);
        if (leftColumn.length) {
          const top = Math.max(...leftColumn.map((r) => r.bottom)) - b.top + 14;
          const pad = Math.max(48, Math.round(top + listHeight + 26 - (grid.bottom - b.top)));
          todo = { top: Math.round(top), pad };
        }
      }
      setGeo((g) => {
        const next = {
          team: team ?? g.team,
          featured: f ? { x: f.left - b.left - 4, y: f.top - b.top - 4 } : g.featured,
          todo: todo ?? g.todo,
        };
        // Changing the padding resizes the board, which measures again; skip no-op updates.
        return JSON.stringify(next) === JSON.stringify(g) ? g : next;
      });
    };
    const settle = setTimeout(measure, 1400);
    const ro = new ResizeObserver(measure);
    ro.observe(board);
    return () => {
      clearTimeout(settle);
      ro.disconnect();
    };
    // teamIndexes is derived from `ordered`, which only changes with the language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, ordered]);

  // A warm desk-lamp pool of light that follows the cursor across the cork.
  const onBoardMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--lx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  // Phones: which note the swipe row is showing, for the dots.
  const onScroll = () => {
    const el = scrollerRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    setSlide(Math.round(Math.abs(el.scrollLeft) / (first.offsetWidth + 16)));
  };
  const goToSlide = (i: number) => {
    const el = scrollerRef.current;
    const target = el?.children[i] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  // Return focus to the note that was showing once the dialog closes.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const id = requestAnimationFrame(() => triggers.current[active]?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, [open, active]);

  if (ordered.length === 0) return null;
  const linkedin = socialLinks.find((l) => l.icon === "linkedin");
  const clientCount = recommendations.filter((r) => r.kind === "Client").length;

  const register = (index: number, el: HTMLButtonElement | null) => {
    triggers.current[index] = el;
  };
  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const step = (delta: number) => setActive((i) => (i + delta + ordered.length) % ordered.length);

  return (
    <section id="recommendations" className="relative isolate py-16 sm:py-24">
      <SignalDivider />
      <SectionBackdrop side="end" />
      <Container className="flex flex-col gap-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow={t.recommendations.eyebrow}
              title={t.recommendations.title}
              description={t.recommendations.description}
            />
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                {t.recommendations.summary(String(recommendations.length).padStart(2, "0"), clientCount, yearSpan)}
              </p>
              {linkedin && (
                <a
                  href={linkedin.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <LinkedinIcon className="size-3.5" />
                  {t.recommendations.viewOnLinkedIn}
                </a>
              )}
            </div>
          </div>
        </Reveal>

        <div className="cork-frame relative mx-auto w-full max-w-[60rem]">
          <WallLabel count={recommendations.filter((r) => r.verified).length} show={inView} />
          <div
            ref={boardRef}
            onPointerMove={onBoardMove}
            // Large screens get a little extra cork at the bottom for the to-do list.
            className="cork-board group/board relative px-3 pt-5 pb-4 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8 lg:pt-10 lg:pb-14"
            // On large screens, exactly the room the to-do list needs below the notes.
            style={isWide && geo.todo ? { paddingBottom: geo.todo.pad } : undefined}
          >
            {/* Desk lamp: a warm pool of light under the cursor (beneath the notes). */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/board:opacity-100"
              style={{
                background:
                  "radial-gradient(320px circle at var(--lx, 50%) var(--ly, 0%), rgb(255 226 170 / 0.35), transparent 70%)",
                mixBlendMode: "soft-light",
              }}
            />

            {isGrid && geo.team && teamRole && (
              <TeamString
                from={geo.team[0]}
                to={geo.team[1]}
                show={inView}
                label={t.recommendations.team(teamRole.organization, yearsIn(teamRole))}
              />
            )}
            {isWide && geo.featured && <StartHere at={geo.featured} show={inView} />}

            {/* The to-do list, tucked into the cork under the left column (large screens). */}
            {isWide && <TodoNote show={inView} top={geo.todo?.top} nodeRef={todoRef} />}

            <div
              ref={scrollerRef}
              onScroll={onScroll}
              className="-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pt-3 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 lg:grid-cols-3 lg:gap-x-7"
            >
              {ordered.map((item, i) => (
                <BoardNote
                  key={item.id}
                  item={item}
                  index={i}
                  inView={inView}
                  canDrag={canDrag}
                  reduce={reduce}
                  isOpen={open && active === i}
                  onOpen={openAt}
                  register={register}
                />
              ))}
            </div>

            {/* Phones: where you are in the swipe row. */}
            <div className="mt-1 flex items-center justify-center gap-1.5 sm:hidden">
              {ordered.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => goToSlide(i)}
                  aria-label={t.recommendations.noteOf(i + 1, ordered.length)}
                  aria-current={slide === i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    slide === i ? "w-5 bg-[#3b2410]/80" : "w-1.5 bg-[#3b2410]/35"
                  )}
                />
              ))}
            </div>

            {/* On large screens it sits at the foot of the cork, beside the to-do list. */}
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#3b2410]/70 sm:mt-6 lg:absolute lg:inset-x-0 lg:bottom-5 lg:mt-0 lg:ps-48">

              <span className="sm:hidden">{t.recommendations.swipe}</span>
              <span className="hidden sm:inline">
                {t.recommendations.click}
                {canDrag && t.recommendations.drag}
              </span>
            </p>
          </div>
        </div>
      </Container>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && <NoteDialog key="dialog" index={active} reduce={reduce} onClose={close} onStep={step} />}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
