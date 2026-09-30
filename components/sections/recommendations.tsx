"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { Kalam } from "next/font/google";
import { ArrowLeft, ArrowRight, ArrowUpRight, XIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { LinkedinIcon } from "@/components/icons/brand-icons";
import { recommendations } from "@/data/recommendations";
import { socialLinks } from "@/data/site";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

const hand = Kalam({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

const featured = recommendations.find((r) => r.featured);
/** Board + dialog navigation order: the featured note first, then the rest. */
const ordered = featured ? [featured, ...recommendations.filter((r) => r !== featured)] : recommendations;

const years = recommendations.map((r) => Number(r.date.slice(-4)));
const yearSpan = `${Math.min(...years)} – ${Math.max(...years)}`;

type Fastener = "tape" | "pin-red" | "pin-blue" | "pin-green" | "pin-amber";

/** Per-position look, so the board reads as hand-arranged rather than a grid. */
const NOTE_LOOKS: { paper: string; tilt: number; fastener: Fastener; offset: string }[] = [
  { paper: "bg-[#fdf0a0] dark:bg-[#e8da8b]", tilt: -1.5, fastener: "tape", offset: "" },
  { paper: "bg-[#fbd5dd] dark:bg-[#e3bdc6]", tilt: -3, fastener: "pin-red", offset: "lg:mt-1" },
  { paper: "bg-[#d3e8f6] dark:bg-[#bad0de]", tilt: 2.5, fastener: "pin-blue", offset: "lg:mt-5" },
  { paper: "bg-[#d9f0c9] dark:bg-[#c0d7b1]", tilt: 2, fastener: "pin-green", offset: "lg:-mt-1" },
  { paper: "bg-[#fde2bd] dark:bg-[#e4caa6]", tilt: -2.5, fastener: "pin-amber", offset: "lg:mt-3" },
];

const PIN_GRADIENT: Record<Exclude<Fastener, "tape">, string> = {
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

function KindLine({ item }: { item: Recommendation }) {
  return (
    <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-black/50">
      <span className={item.kind === "Client" ? "font-semibold text-[#3730a3]" : undefined}>
        {item.kind === "Client" ? "★ Client" : item.kind}
      </span>
      <span>{item.date}</span>
    </div>
  );
}

function Signature({ item }: { item: Recommendation }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <span className="truncate">{item.name}</span>
        {item.verified && <LinkedinIcon className="size-3.5 shrink-0 text-[#0a66c2]" aria-label="LinkedIn verified" />}
      </p>
      <p className="truncate text-xs text-black/55">{item.title}</p>
    </div>
  );
}

function NoteFace({ item, big }: { item: Recommendation; big: boolean }) {
  return (
    <>
      <KindLine item={item} />
      <p
        className={cn(
          hand.className,
          "mt-2 flex-1 text-pretty leading-snug",
          big ? "text-xl lg:text-[1.4rem]" : "text-base"
        )}
      >
        &ldquo;{item.highlight}&rdquo;
      </p>
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-black/20 pt-2.5">
        <Signature item={item} />
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 text-black/40 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black/75"
        />
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
        : { type: "spring", stiffness: 260, damping: 17, delay: 0.1 + index * 0.09 },
    },
  };

  const cell = cn(
    "relative w-[80%] shrink-0 snap-center sm:w-auto",
    big && "sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center",
    !big && look.offset
  );

  // While a note is open, keep its slot on the board so nothing reflows.
  if (isOpen) {
    return (
      <div className={cell} aria-hidden>
        <div className={cn(noteBase, "invisible")}>
          <NoteFace item={item} big={big} />
        </div>
      </div>
    );
  }

  return (
    <div className={cell}>
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
        <NoteFace item={item} big={big} />
      </motion.button>
    </div>
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
  const item = ordered[index];
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
                aria-label="Close"
                onClick={onClose}
                className="-mt-1 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-black/8 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="shrink-0 px-6 pt-3 sm:px-8">
              <KindLine item={item} />
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-black/40">{item.relationship}</p>
            </div>

            <div
              ref={scrollRef}
              className={cn(
                hand.className,
                "flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-6 pt-4 pb-5 text-base leading-[1.65] [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
              )}
            >
              {item.quote.split("\n\n").map((p, i) => (
                <p key={i} className="text-pretty">
                  <WithHighlight text={p} highlight={item.highlight} />
                </p>
              ))}
            </div>

            {ordered.length > 1 && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-dashed border-black/20 px-4 py-3 sm:px-6">
                <button type="button" onClick={() => onStep(-1)} className={navButton}>
                  <ArrowLeft className="size-3.5" />
                  Previous
                </button>
                <span className="font-mono text-[10px] tracking-[0.15em] text-black/45" aria-live="polite">
                  {String(index + 1).padStart(2, "0")} / {String(ordered.length).padStart(2, "0")}
                </span>
                <button type="button" onClick={() => onStep(1)} className={navButton}>
                  Next
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

export function Recommendations() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const mounted = useHasMounted();
  const reduce = useReducedMotion() ?? false;
  const finePointer = useMediaQuery("(pointer: fine) and (min-width: 768px)");
  const canDrag = finePointer && !reduce;
  const inView = useInView(boardRef, { once: true, margin: "0px 0px -15% 0px" });

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
    <section id="recommendations" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Recommendations"
              title="What colleagues & clients say"
              description="Notes from people I've worked with directly — teammates, and a client I built a site for."
            />
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                {String(recommendations.length).padStart(2, "0")} notes · {clientCount} client · {yearSpan}
              </p>
              {linkedin && (
                <a
                  href={linkedin.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <LinkedinIcon className="size-3.5" />
                  View on LinkedIn
                </a>
              )}
            </div>
          </div>
        </Reveal>

        <div className="cork-frame mx-auto w-full max-w-5xl">
          <div ref={boardRef} className="cork-board px-3 pt-5 pb-4 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8 lg:pt-9 lg:pb-6">
            <div className="-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pt-3 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 lg:grid-cols-3 lg:gap-x-7">
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
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#3b2410]/70 sm:mt-6">
              <span className="sm:hidden">Swipe · tap a note to read it</span>
              <span className="hidden sm:inline">
                Click a note to read it in full{canDrag && " · drag to move it around"}
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
