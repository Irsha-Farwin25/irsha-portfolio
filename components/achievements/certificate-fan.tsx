"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Award, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { ImageLightbox } from "@/components/projects/image-lightbox";
import { useChatContext } from "@/components/assistant/chat-context";
import { certificateLine, narrationMs } from "@/lib/chat/narration";
import type { Certificate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/components/i18n/locale-provider";

// A gentle arc: a large turning radius (--fan-r below) with small steps keeps the card spacing
// while flattening the curve.
const STEP = 7.5; // degrees between fanned cards
const DWELL_MS = 4200; // how long each certificate rests under the spotlight…
const NARRATE_DELAY_MS = 700; // …the avatar starts describing it once it has settled…
const AFTER_NARRATION_MS = 1800; // …and the walk waits this long after she finishes
const RESUME_AFTER_MS = 6000; // pause the exhibition walk after manual navigation
const STACK_TILT = [0, -6, 5, -3];
const SPOTLIGHT_ZOOM = 1.12; // the certificate in the spotlight steps forward by this much
const FADED_OPACITY = 0.35; // certificates away from the spotlight fade back to this…
const FADED_BLUR = 1.6; // …and go slightly out of focus (px)

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/**
 * Certificates in a gentle arc, like a gallery wall. A spotlight above the centre spot switches on
 * the first time the wall scrolls into view: whichever certificate glides into place is framed and
 * lit, rests there a moment, then the next moves in. Arrows, keys or clicking a side card move the
 * wall; the lit certificate opens full-size in the lightbox.
 */
export function CertificateFan({ items }: { items: Certificate[] }) {
  const n = items.length;
  const wrap = n >= 3;
  const reduceMotion = useReducedMotion();

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  const center = useMotionValue(0);
  /** The wall is always spread (the cards' stacked pose is no longer shown). */
  const spread = useMotionValue(1);
  /** The light: off until the wall first comes into view, then a switch-on flicker (1 = steady). */
  const flicker = useMotionValue(reduceMotion ? 1 : 0);
  /** Whether the wall is on screen: the exhibition walk only runs while someone can see it. */
  const inView = useRef(false);
  const activeRef = useRef(0);
  const pausedUntil = useRef(0);
  const lastStep = useRef(0);
  const nudged = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  /** How long the current certificate rests: longer while the avatar is describing it. */
  const dwell = useRef(DWELL_MS);

  // The avatar describes the certificate under the spotlight (when she's around and not muted);
  // otherwise the description shows in the caption below.
  const { narrate, canNarrate } = useChatContext();
  const t = useT();
  const locale = useLocale();
  const narrateRef = useRef(narrate);
  useEffect(() => {
    narrateRef.current = narrate;
  }, [narrate]);

  // The spotlight: fully on when a certificate sits exactly in place, dimming as it moves away.
  const light = useTransform(() => {
    const offCentre = Math.abs(center.get() - Math.round(center.get()));
    return spread.get() * flicker.get() * (1 - smoothstep(0.06, 0.42, offCentre));
  });

  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 90, damping: 18 };

  const setActiveIndex = (i: number) => {
    const idx = ((i % n) + n) % n;
    if (idx === activeRef.current) return;
    activeRef.current = idx;
    setActive(idx);
  };

  const goTo = (index: number, manual = true) => {
    const from = Math.round(center.get());
    let to: number;
    if (wrap) {
      const delta = ((((index - activeRef.current) % n) + n + n / 2) % n) - n / 2;
      to = from + Math.round(delta);
    } else {
      to = Math.max(0, Math.min(n - 1, index));
    }
    if (manual) nudged.current = true;
    setActiveIndex(to);
    animate(center, to, spring);
  };

  // Track whether the wall is on screen; the first time it is, the spotlight flickers on.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let switchedOn = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (!entry.isIntersecting || switchedOn) return;
        switchedOn = true;
        if (!reduceMotion) {
          animate(flicker, [0, 0.8, 0.15, 1, 0.5, 1], { duration: 0.9, delay: 0.35, times: [0, 0.15, 0.3, 0.5, 0.65, 1] });
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [flicker, reduceMotion]);

  // The exhibition walk: while on screen (and not paused by hovering the spotlit certificate or by
  // navigating by hand), the next certificate glides under the spotlight every few seconds.
  useAnimationFrame((time) => {
    if (nudged.current) {
      nudged.current = false;
      pausedUntil.current = time + RESUME_AFTER_MS;
      lastStep.current = time;
    }
    if (!inView.current || hovered || reduceMotion || !wrap || time < pausedUntil.current) {
      if (!inView.current || hovered) lastStep.current = time;
      return;
    }
    if (time - lastStep.current > dwell.current) {
      lastStep.current = time;
      goTo(activeRef.current + 1, false);
    }
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(active + 1);
    else if (e.key === "ArrowLeft") goTo(active - 1);
    else return;
    e.preventDefault();
  };

  const current = items[active];
  const spoken = canNarrate ? certificateLine(current, locale) : undefined;

  // Once a certificate settles under the light (and the wall is on screen), she describes it.
  useEffect(() => {
    dwell.current = spoken ? Math.max(DWELL_MS, NARRATE_DELAY_MS + narrationMs(spoken) + AFTER_NARRATION_MS) : DWELL_MS;
    if (!spoken) return;
    const id = window.setTimeout(() => {
      if (inView.current) narrateRef.current(spoken);
    }, NARRATE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [spoken, active]);

  return (
    // -mt-8 cancels the tab panel's gap so the stage sits flush under the tab bar, which the
    // spotlight hangs from.
    // gap-2 keeps the title close under the lit frame; the stage itself ends just below the frame.
    <div className="-mt-8 flex flex-col items-center gap-2" onKeyDown={onKeyDown}>
      {/* The wall is spatial (left = earlier), so it keeps left-to-right in Arabic too. */}
      <div
        ref={stageRef}
        dir="ltr"
        className="relative h-[448px] w-full overflow-hidden [--fade-dim:0.12] [--fan-r:1300px] dark:[--fade-dim:0.4] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent),linear-gradient(to_bottom,black_calc(100%_-_28px),transparent)] [mask-composite:intersect] sm:h-[610px] sm:[--fan-r:2500px]"
        // Pause the walk only while the pointer rests on the certificate in the spotlight (someone
        // is looking at it) — not anywhere on the wall, where the cursor often just sits.
        onPointerMove={(e) => setHovered(!!(e.target as Element).closest("[data-spotlit]"))}
        onPointerLeave={() => setHovered(false)}
      >
        <Spotlight spread={spread} light={light} />

        {items.map((item, i) => (
          <FanCard
            key={item.id}
            item={item}
            index={i}
            n={n}
            wrap={wrap}
            center={center}
            spread={spread}
            light={light}
            isActive={i === active}
            onSelect={() => goTo(i)}
          />
        ))}
      </div>

      <div className="flex w-full max-w-xl flex-col items-center gap-4">
        <AnimatePresence mode="wait" initial={false}>
          {/* Floating caption for the certificate under the spotlight. */}
          <motion.div
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="flex w-full max-w-lg flex-col items-center gap-2 text-center"
            aria-live="polite"
          >
            {/* Date and issuer are on the certificate itself; kept for screen readers only. */}
            <p className="sr-only">
              {[current.date, current.issuer].filter(Boolean).join(" · ")}
            </p>
            <h3 className="text-balance text-base font-semibold leading-snug tracking-tight sm:text-lg">{current.title}</h3>
            {/* When the avatar says the description, it stays here for screen readers only. */}
            {current.description && (
              <p className={cn("max-w-md text-pretty text-sm text-muted-foreground", spoken && "sr-only")}>
                {current.description}
              </p>
            )}
            {current.link && (
              <a
                href={current.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {current.category === "Course" ? t.achievements.verify : t.achievements.details}{" "}
                <ExternalLink className="size-3 rtl:-scale-x-100" />
              </a>
            )}
          </motion.div>
        </AnimatePresence>

        <div dir="ltr" className="flex items-center gap-2">
          {n > 1 && (
            <NavButton label={t.achievements.prevCert} onClick={() => goTo(active - 1)} disabled={!wrap && active === 0}>
              <ChevronLeft className="size-4" />
            </NavButton>
          )}
          <span className="min-w-14 text-center font-mono text-xs tabular-nums text-muted-foreground">
            {active + 1} / {n}
          </span>
          {n > 1 && (
            <NavButton label={t.achievements.nextCert} onClick={() => goTo(active + 1)} disabled={!wrap && active === n - 1}>
              <ChevronRight className="size-4" />
            </NavButton>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Warm gallery white (~3000K), as an RGB triple set per theme on the Spotlight root. In the dark it
 * is screened on as light; on a light wall it is multiplied in as a warm tint, so it is a touch more
 * saturated there to read.
 */
const WARM = "var(--spot)";
/** Dust motes drifting through the beam: [left %, top %, size px, duration s, delay s, drift px]. */
const MOTES: [number, number, number, number, number, number][] = [
  [44, 8, 2, 9, 0, 10], [53, 14, 1.5, 11, 2.5, -8], [48, 30, 2.5, 13, 5, 6], [56, 38, 1.5, 10, 1, -12],
  [41, 46, 2, 12, 7, 9], [51, 55, 1.5, 9, 3.5, -6], [46, 20, 1.5, 14, 9, 7], [58, 24, 2, 12, 6, -9],
  [39, 62, 1.5, 11, 4, 11], [54, 68, 2, 13, 8, -7],
];

/**
 * A modern gallery track spotlight above the centre spot: a slim matte-black ceiling track with a
 * cylindrical spot, a recessed glowing lens, a soft volumetric beam (feathered edges, falling off
 * with distance, a few dust motes), and a warm "scallop" pool of light on the wall around the
 * frame. Hidden while the certificates are stacked; follows the light as certificates glide.
 * Everything sits behind the cards, so the certificate text stays crisp.
 */
function Spotlight({ spread, light }: { spread: MotionValue<number>; light: MotionValue<number> }) {
  const uid = useId().replace(/:/g, "");
  const lensOpacity = useTransform(() => spread.get() * (0.15 + light.get() * 0.85));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [--spot:255,214,168] dark:[--spot:255,216,168]">
      {/* Light theme only: a soft halo of shade hugging the beam, so the cone reads clearly on a
          white wall. The shade sits outside the cone (same apex at the lens, with wide feathered
          edges) and is masked by a radial falloff, so it is deepest right beside the beam and
          melts into the wall in every direction — no edges, no flat grey band. */}
      <motion.div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          opacity: light,
          background:
            "conic-gradient(at 50% 59px, rgba(52,42,32,0.16) 0deg, rgba(52,42,32,0.16) 96deg, rgba(52,42,32,0) 134deg, rgba(52,42,32,0) 226deg, rgba(52,42,32,0.16) 264deg, rgba(52,42,32,0.16) 360deg)",
          maskImage: "radial-gradient(ellipse 34% 62% at 50% 38%, #000 25%, rgba(0,0,0,0.45) 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 34% 62% at 50% 38%, #000 25%, rgba(0,0,0,0.45) 60%, transparent 100%)",
        }}
      />

      {/* Pool of light on the wall around the frame. The gradient reaches full transparency before
          every edge of its box, so no edge of the box ever shows as a line. */}
      <motion.div
        className="absolute top-[147px] left-1/2 z-0 h-[324px] w-[560px] -translate-x-1/2 mix-blend-multiply dark:mix-blend-screen sm:top-[173px] sm:h-[480px] sm:w-[840px]"
        style={{
          opacity: light,
          background: `radial-gradient(ellipse 50% 46% at 50% 46%, rgba(${WARM}, 0.5), rgba(${WARM}, 0.2) 50%, rgba(${WARM}, 0) 100%)`,
        }}
      />

      {/* Volumetric beam: a cone with feathered edges (no hard outline), fading with distance. */}
      <motion.div
        className="absolute top-[67px] left-1/2 z-0 h-[378px] w-[720px] -translate-x-1/2 overflow-hidden mix-blend-multiply dark:mix-blend-screen sm:h-[548px] sm:w-[960px]"
        style={{
          opacity: light,
          background: `radial-gradient(ellipse 44% 100% at 50% 0%, rgba(${WARM}, 0.55) 0%, rgba(${WARM}, 0.24) 32%, rgba(${WARM}, 0.08) 68%, rgba(${WARM}, 0) 100%)`,
          // The cone's apex sits just behind the lens, so the beam leaves the lamp lens-wide and
          // fans out — wide enough to span the full frame by the time it reaches the frame's top.
          maskImage:
            "conic-gradient(from 112deg at 50% -8px, transparent 0deg, #000 14deg, #000 122deg, transparent 136deg, transparent 360deg)",
          WebkitMaskImage:
            "conic-gradient(from 112deg at 50% -8px, transparent 0deg, #000 14deg, #000 122deg, transparent 136deg, transparent 360deg)",
        }}
      >
        {MOTES.map(([left, top, size, duration, delay, drift], i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                background: `rgba(${WARM}, 0.9)`,
                filter: "blur(0.4px)",
                animation: `mote-drift ${duration}s linear ${delay}s infinite`,
                "--mote-dx": `${drift}px`,
                "--mote-opacity": 0.55,
              } as React.CSSProperties
            }
          />
        ))}
      </motion.div>

      {/* Bloom around the lens. */}
      <motion.div
        className="absolute top-[53px] left-1/2 z-[150] h-10 w-24 -translate-x-1/2 rounded-full blur-md"
        style={{ opacity: lensOpacity, background: `radial-gradient(ellipse at 50% 60%, rgba(${WARM}, 0.9), rgba(${WARM}, 0) 70%)` }}
      />

      {/* The tab bar above is the ceiling: a small mount plate and a slim rod drop from its lower
          edge (the stage sits flush beneath it), with the cylindrical spot hanging at the end. */}
      <motion.div className="absolute inset-x-0 top-0 z-[151] flex flex-col items-center" style={{ opacity: spread }}>
        <div className="h-[4px] w-7 rounded-b-[3px] bg-[linear-gradient(to_bottom,#5a5a60,#1a1a1d)] shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]" />
        {/* Brushed-metal rod: a bright highlight down one side keeps it readable on a dark wall. */}
        <div className="h-[16px] w-[5px] bg-[linear-gradient(to_right,#1a1a1d,#7a7a82_40%,#3a3a3f_65%,#141416)] shadow-[0_0_0_0.5px_rgba(255,255,255,0.06)]" />
        <svg width="44" height="54" viewBox="0 0 44 54" className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]">
          <defs>
            <linearGradient id={`${uid}-body`} x1="0" x2="1">
              <stop offset="0" stopColor="#0c0c0d" />
              <stop offset="0.38" stopColor="#3b3b3f" />
              <stop offset="0.55" stopColor="#1b1b1d" />
              <stop offset="1" stopColor="#0a0a0b" />
            </linearGradient>
            <radialGradient id={`${uid}-lens`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fffaf0" />
              <stop offset="0.6" stopColor="#ffe6bd" />
              <stop offset="1" stopColor="#f2c88a" />
            </radialGradient>
          </defs>
          {/* Track adapter and stem. */}
          <rect x="15" y="0" width="14" height="6" rx="1.5" fill="#151517" />
          <rect x="20" y="6" width="4" height="4" fill="#0e0e10" />
          {/* Cylinder body with a soft metal highlight, and its bezel. */}
          <rect x="9" y="10" width="26" height="34" rx="4" fill={`url(#${uid}-body)`} />
          <rect x="9" y="10" width="26" height="3" rx="1.5" fill="#ffffff" opacity="0.08" />
          <rect x="7" y="41" width="30" height="7" rx="2.5" fill="#09090a" />
          {/* Recessed lens: dark anti-glare ring, warm lit centre. */}
          <ellipse cx="22" cy="48" rx="12" ry="3.2" fill="#050506" />
          <motion.ellipse cx="22" cy="48" rx="8.5" ry="2.2" fill={`url(#${uid}-lens)`} style={{ opacity: lensOpacity }} />
        </svg>
      </motion.div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function FanCard({
  item,
  index,
  n,
  wrap,
  center,
  spread,
  light,
  isActive,
  onSelect,
}: {
  item: Certificate;
  index: number;
  n: number;
  wrap: boolean;
  center: MotionValue<number>;
  spread: MotionValue<number>;
  light: MotionValue<number>;
  isActive: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  // Signed distance from the centre of the fan (wraps around for 3+ cards).
  const dist = () => {
    const raw = index - center.get();
    return wrap ? ((((raw % n) + n + n / 2) % n) - n / 2) : raw;
  };
  // Position in the stack (0 = top card).
  const rank = () => Math.round((((index - center.get()) % n) + n) % n);

  // The frame belongs to the spot: it appears around whichever card is in place under the light.
  const framed = useTransform(() => clamp01(1 - Math.abs(dist()) * 2.5) * light.get());
  const frameScale = useTransform(framed, (v) => mix(1.08, 1, v));
  /** 0 for the certificate in place, rising to 1 one step away (only once spread). */
  const away = () => clamp01(Math.abs(dist()) * 1.2) * spread.get();

  const fanRotate = useTransform(() => dist() * STEP * spread.get());
  const tilt = useTransform(() => (STACK_TILT[rank()] ?? 0) * (1 - spread.get()));
  const y = useTransform(() => -Math.min(rank(), 3) * 10 * (1 - spread.get()));
  // The certificate in the spotlight steps forward (zooms in) as the light reaches it.
  const scale = useTransform(
    () =>
      mix(1 - Math.min(rank(), 3) * 0.04, 1 - Math.min(Math.abs(dist()), 3) * 0.08, spread.get()) *
      mix(1, SPOTLIGHT_ZOOM, framed.get())
  );
  const opacity = useTransform(() => {
    const stackOp = rank() < 4 ? 1 : 0;
    const fanOp = wrap ? Math.min(1, Math.max(0, (n / 2 - Math.abs(dist())) / 0.5)) : 1;
    // Once spread, everything but the spotlit certificate fades back.
    return mix(stackOp, fanOp, spread.get()) * mix(1, FADED_OPACITY, away());
  });
  const zIndex = useTransform(() => Math.round(100 - mix(rank(), Math.abs(dist()), spread.get()) * 10));
  // Away from the spotlight: half-light and slightly out of focus; the spotlit one stays sharp.
  const filter = useTransform(() => {
    const a = away();
    // How far they dim is set per theme (--fade-dim on the stage): deep in the dark, light on a light wall.
    return `brightness(calc(1 - var(--fade-dim) * ${a.toFixed(3)})) blur(${(FADED_BLUR * a).toFixed(2)}px)`;
  });
  return (
    <motion.div
      data-spotlit={isActive ? "" : undefined}
      style={{ rotate: fanRotate, zIndex, opacity, transformOrigin: "50% var(--fan-r)" }}
      className="absolute left-1/2 top-[214px] w-[220px] -translate-x-1/2 sm:top-[267px] sm:w-[340px]"
    >
      <motion.div style={{ rotate: tilt, y, scale, filter }} className="relative">
        {/* Modern certificate frame that settles around the certificate in the spotlight. From the
            outside in: a flat matte-black moulding, a wide white mat (shaded where the moulding
            overhangs it) and a thin black inner mat hugging the certificate. The insets add up to
            the frame's total width (10+18+3 = 31px, 14+32+3 = 49px from sm), so the black line
            lands exactly on the card's edge. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[31px] rounded-[2px] bg-[linear-gradient(160deg,#2a2a2d,#161618_40%,#111113)] shadow-[0_24px_44px_-16px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.1)] sm:-inset-[49px]"
          style={{ opacity: framed, scale: frameScale }}
        >
          {/* Warm spill from the spotlight across the top rail (it reads in the dark). */}
          <span className="absolute inset-0 hidden rounded-[2px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,228,170,0.22),transparent_60%)] mix-blend-screen dark:block" />
          {/* White mat. */}
          <span className="absolute inset-[10px] bg-[#fbfbf9] shadow-[inset_0_2px_4px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(0,0,0,0.12)] sm:inset-[14px]">
            {/* Black inner mat. */}
            <span className="absolute inset-[18px] border-[3px] border-[#151515] sm:inset-[32px]" />
          </span>
        </motion.div>

        <div
          className={cn(
            "relative aspect-[4/3] overflow-hidden border bg-white",
            isActive
              ? "rounded-none border-transparent"
              : "rounded-md border-border shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]"
          )}
        >
          {item.image ? (
            isActive ? (
              <ImageLightbox
                src={item.image}
                alt={t.achievements.certificateAlt(item.title)}
                sizes="(min-width: 640px) 340px, 220px"
                fit="contain"
                caption={`${item.title} — ${item.issuer}`}
              />
            ) : (
              <Image src={item.image} alt="" fill sizes="(min-width: 640px) 340px, 220px" className="object-contain p-2" />
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-primary/5 to-background p-4 text-center">
              <Award className="size-10 text-primary/70" strokeWidth={1.25} />
              <p className="line-clamp-2 text-xs font-medium text-foreground">{item.title}</p>
            </div>
          )}
        </div>

        {/* Glass inside the frame, over the mat and print: a faint fixed glare, plus a reflection
            that sweeps across once each time a certificate settles under the light. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[21px] overflow-hidden sm:-inset-[35px]"
          style={{ opacity: framed, scale: frameScale }}
        >
          <span className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.14),transparent_30%,transparent_70%,rgba(255,255,255,0.06))]" />
          {isActive && !reduceMotion && (
            <motion.span
              className="absolute inset-y-0 left-0 w-1/3 -skew-x-[20deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]"
              initial={{ x: "-150%" }}
              animate={{ x: "400%" }}
              transition={{ duration: 1.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </motion.div>

        {!isActive && (
          <button
            type="button"
            onClick={onSelect}
            aria-label={t.achievements.show(item.title)}
            className="absolute inset-0 cursor-pointer bg-background/0 transition-colors hover:bg-background/10"
          />
        )}
      </motion.div>
    </motion.div>
  );
}
