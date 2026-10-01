"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
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
import { Award, ChevronLeft, ChevronRight, ExternalLink, Layers, MousePointerClick } from "lucide-react";
import { ImageLightbox } from "@/components/projects/image-lightbox";
import type { Certificate } from "@/lib/types";
import { cn } from "@/lib/utils";

// A gentle arc: a large turning radius (--fan-r below) with small steps keeps the card spacing
// while flattening the curve.
const STEP = 7.5; // degrees between fanned cards
const DWELL_MS = 4200; // how long each certificate rests under the spotlight
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
 * Certificates as a stack that spreads into a gentle arc, like a gallery wall. Once spread, a
 * spotlight switches on above the centre spot: whichever certificate glides into place is framed
 * and lit, rests there a moment, then the next moves in. Arrows, keys or clicking a side card move
 * the wall; the lit certificate opens full-size in the lightbox.
 */
export function CertificateFan({ items }: { items: Certificate[] }) {
  const n = items.length;
  const wrap = n >= 3;
  const reduceMotion = useReducedMotion();

  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  const center = useMotionValue(0);
  const spread = useMotionValue(0);
  /** Switch-on flicker the first time the wall is spread (1 = steady). */
  const flicker = useMotionValue(1);
  const flickered = useRef(false);
  const activeRef = useRef(0);
  const pausedUntil = useRef(0);
  const lastStep = useRef(0);
  const nudged = useRef(false);

  // The spotlight: off while stacked; once spread, fully on when a certificate sits exactly in
  // place, dimming as it moves away.
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

  const toggle = (open: boolean) => {
    setExpanded(open);
    if (!open) animate(center, Math.round(center.get()), spring);
    animate(spread, open ? 1 : 0, spring);
    if (open && !flickered.current && !reduceMotion) {
      flickered.current = true;
      flicker.set(0);
      animate(flicker, [0, 0.8, 0.15, 1, 0.5, 1], { duration: 0.9, delay: 0.35, times: [0, 0.15, 0.3, 0.5, 0.65, 1] });
    }
  };

  // The exhibition walk: while spread (and not paused by hovering the spotlit certificate or by
  // navigating by hand), the next certificate glides under the spotlight every few seconds.
  useAnimationFrame((time) => {
    if (nudged.current) {
      nudged.current = false;
      pausedUntil.current = time + RESUME_AFTER_MS;
      lastStep.current = time;
    }
    if (!expanded || hovered || reduceMotion || !wrap || time < pausedUntil.current) {
      if (!expanded || hovered) lastStep.current = time;
      return;
    }
    if (time - lastStep.current > DWELL_MS) {
      lastStep.current = time;
      goTo(activeRef.current + 1, false);
    }
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(active + 1);
    else if (e.key === "ArrowLeft") goTo(active - 1);
    else if (e.key === "Escape") toggle(false);
    else return;
    e.preventDefault();
    if (!expanded) toggle(true);
  };

  const current = items[active];

  return (
    <div className="flex flex-col items-center gap-6" onKeyDown={onKeyDown}>
      <div
        className="relative h-[380px] w-full overflow-hidden [--fan-r:1300px] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:h-[500px] sm:[--fan-r:2200px]"
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
            expanded={expanded}
            onSelect={() => goTo(i)}
          />
        ))}

        {!expanded && (
          <button
            type="button"
            onClick={() => toggle(true)}
            aria-label={`Spread ${n} certificates`}
            className="group absolute inset-0 z-[200] flex cursor-pointer items-end justify-center pb-3 outline-none"
          >
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur transition-colors group-hover:border-primary group-hover:text-primary group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
              <MousePointerClick className="size-3.5" /> Click to view the exhibition of {n}
            </span>
          </button>
        )}
      </div>

      {expanded && (
        <div className="flex w-full max-w-xl flex-col items-center gap-4">
          <AnimatePresence mode="wait" initial={false}>
            {/* Museum wall label for the certificate under the spotlight. */}
            <motion.div
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="relative flex w-full max-w-md flex-col items-center gap-1.5 rounded-md border border-border bg-card px-5 py-4 text-center shadow-sm"
              aria-live="polite"
            >
              <span aria-hidden className="absolute top-2 left-2 size-1 rounded-full bg-muted-foreground/40" />
              <span aria-hidden className="absolute top-2 right-2 size-1 rounded-full bg-muted-foreground/40" />
              {current.date && (
                <p className="font-mono text-[11px] uppercase tracking-wider text-primary">{current.date}</p>
              )}
              <h3 className="text-balance text-lg font-semibold leading-snug tracking-tight">{current.title}</h3>
              <p className="text-sm text-muted-foreground">{current.issuer}</p>
              {current.description && (
                <p className="max-w-md text-pretty text-sm text-muted-foreground">{current.description}</p>
              )}
              {current.link && (
                <a
                  href={current.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {current.category === "Course" ? "Verify credential" : "View details"}{" "}
                  <ExternalLink className="size-3" />
                </a>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2">
            {n > 1 && (
              <NavButton label="Previous certificate" onClick={() => goTo(active - 1)} disabled={!wrap && active === 0}>
                <ChevronLeft className="size-4" />
              </NavButton>
            )}
            <span className="min-w-14 text-center font-mono text-xs tabular-nums text-muted-foreground">
              {active + 1} / {n}
            </span>
            {n > 1 && (
              <NavButton label="Next certificate" onClick={() => goTo(active + 1)} disabled={!wrap && active === n - 1}>
                <ChevronRight className="size-4" />
              </NavButton>
            )}
            <button
              type="button"
              onClick={() => toggle(false)}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Layers className="size-3.5" /> Stack
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Warm gallery white (~3000K). */
const WARM = "255, 216, 168";

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
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Pool of light on the wall around the frame. The gradient reaches full transparency before
          every edge of its box, so no edge of the box ever shows as a line. */}
      <motion.div
        className="absolute top-[40px] left-1/2 z-0 h-[380px] w-[460px] -translate-x-1/2 mix-blend-screen sm:top-[56px] sm:h-[500px] sm:w-[660px]"
        style={{
          opacity: light,
          background: `radial-gradient(ellipse 50% 46% at 50% 46%, rgba(${WARM}, 0.5), rgba(${WARM}, 0.2) 50%, rgba(${WARM}, 0) 100%)`,
        }}
      />

      {/* Volumetric beam: a cone with feathered edges (no hard outline), fading with distance. */}
      <motion.div
        className="absolute top-[55px] left-1/2 z-0 h-[330px] w-[560px] -translate-x-1/2 overflow-hidden mix-blend-screen sm:h-[450px] sm:w-[720px]"
        style={{
          opacity: light,
          background: `radial-gradient(ellipse 44% 100% at 50% 0%, rgba(${WARM}, 0.55) 0%, rgba(${WARM}, 0.24) 32%, rgba(${WARM}, 0.08) 68%, rgba(${WARM}, 0) 100%)`,
          maskImage:
            "conic-gradient(from 138deg at 50% -30px, transparent 0deg, #000 14deg, #000 70deg, transparent 84deg, transparent 360deg)",
          WebkitMaskImage:
            "conic-gradient(from 138deg at 50% -30px, transparent 0deg, #000 14deg, #000 70deg, transparent 84deg, transparent 360deg)",
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
        className="absolute top-[38px] left-1/2 z-[150] h-10 w-24 -translate-x-1/2 rounded-full blur-md"
        style={{ opacity: lensOpacity, background: `radial-gradient(ellipse at 50% 60%, rgba(${WARM}, 0.9), rgba(${WARM}, 0) 70%)` }}
      />

      {/* Slim ceiling track with a cylindrical spot hanging from it. */}
      <motion.div className="absolute inset-x-0 top-0 z-[151] flex flex-col items-center" style={{ opacity: spread }}>
        <div className="h-[5px] w-[min(520px,80%)] rounded-full bg-[linear-gradient(to_bottom,#3c3c40,#0e0e10)] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]" />
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
  expanded,
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
  expanded: boolean;
  onSelect: () => void;
}) {
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
    return `brightness(${mix(1, 0.6, a).toFixed(3)}) blur(${(FADED_BLUR * a).toFixed(2)}px)`;
  });
  return (
    <motion.div
      data-spotlit={expanded && isActive ? "" : undefined}
      style={{ rotate: fanRotate, zIndex, opacity, transformOrigin: "50% var(--fan-r)" }}
      className="absolute left-1/2 top-[120px] w-[220px] -translate-x-1/2 sm:top-[150px] sm:w-[300px]"
    >
      <motion.div style={{ rotate: tilt, y, scale, filter }} className="relative">
        {/* Gallery frame (dark moulding) that settles around the certificate in the spotlight. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[11px] rounded-[4px] border-[11px] border-[#2a201a] shadow-[0_22px_40px_-14px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-black/40 sm:-inset-[13px] sm:border-[13px]"
          style={{ opacity: framed, scale: frameScale }}
        >
          <span className="absolute -inset-[11px] rounded-[4px] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_40%,transparent_60%,rgba(255,255,255,0.08))] sm:-inset-[13px]" />
          <span className="absolute -inset-[11px] rounded-[4px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,228,170,0.35),transparent_65%)] mix-blend-screen sm:-inset-[13px]" />
        </motion.div>

        <div
          className={cn(
            "relative aspect-[4/3] overflow-hidden rounded-md border bg-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]",
            expanded && isActive ? "border-transparent" : "border-border"
          )}
        >
          {item.image ? (
            expanded && isActive ? (
              <ImageLightbox
                src={item.image}
                alt={`${item.title} certificate`}
                sizes="(min-width: 640px) 300px, 220px"
                fit="contain"
                caption={`${item.title} — ${item.issuer}`}
              />
            ) : (
              <Image src={item.image} alt="" fill sizes="(min-width: 640px) 300px, 220px" className="object-contain p-2" />
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-primary/5 to-background p-4 text-center">
              <Award className="size-10 text-primary/70" strokeWidth={1.25} />
              <p className="line-clamp-2 text-xs font-medium text-foreground">{item.title}</p>
            </div>
          )}
        </div>

        {expanded && !isActive && (
          <button
            type="button"
            onClick={onSelect}
            aria-label={`Show ${item.title}`}
            className="absolute inset-0 cursor-pointer bg-background/0 transition-colors hover:bg-background/10"
          />
        )}
      </motion.div>
    </motion.div>
  );
}
