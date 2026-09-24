"use client";

import { useRef, useState, type KeyboardEvent } from "react";
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

const STEP = 15; // degrees between fanned cards
const SPIN_SPEED = 1 / 5000; // cards per ms — one card every 5s
const RESUME_AFTER_MS = 2500; // pause auto-spin after manual navigation
const STACK_TILT = [0, -6, 5, -3];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Certificates as a card stack that fans out into a half-circle "wheel" on click.
 * The wheel spins one card at a time (auto, arrows, keys, or clicking a side card);
 * the centre card opens full-size in the lightbox.
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
  const activeRef = useRef(0);
  const pausedUntil = useRef(0);
  const nudged = useRef(false);

  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 120, damping: 20 };

  const setActiveIndex = (i: number) => {
    const idx = ((i % n) + n) % n;
    if (idx === activeRef.current) return;
    activeRef.current = idx;
    setActive(idx);
  };

  const goTo = (index: number) => {
    const from = Math.round(center.get());
    let to: number;
    if (wrap) {
      const delta = (((index - activeRef.current) % n) + n + n / 2) % n - n / 2;
      to = from + Math.round(delta);
    } else {
      to = Math.max(0, Math.min(n - 1, index));
    }
    nudged.current = true;
    setActiveIndex(to);
    animate(center, to, spring);
  };

  const toggle = (open: boolean) => {
    setExpanded(open);
    if (!open) animate(center, Math.round(center.get()), spring);
    animate(spread, open ? 1 : 0, spring);
  };

  // Continuous slow spin while fanned out, not hovered, and not just nudged.
  useAnimationFrame((time, delta) => {
    if (nudged.current) {
      nudged.current = false;
      pausedUntil.current = time + RESUME_AFTER_MS;
    }
    if (!expanded || hovered || reduceMotion || !wrap || time < pausedUntil.current) return;
    const c = center.get() + SPIN_SPEED * delta;
    center.set(c);
    setActiveIndex(Math.round(c));
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
        className="relative h-[300px] w-full overflow-hidden [--fan-r:620px] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:h-[420px] sm:[--fan-r:950px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {items.map((item, i) => (
          <FanCard
            key={item.id}
            item={item}
            index={i}
            n={n}
            wrap={wrap}
            center={center}
            spread={spread}
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
              <MousePointerClick className="size-3.5" /> Click to spread {n} certificates
            </span>
          </button>
        )}
      </div>

      {expanded && (
        <div className="flex w-full max-w-xl flex-col items-center gap-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-1.5 text-center"
              aria-live="polite"
            >
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

  const fanRotate = useTransform(() => dist() * STEP * spread.get());
  const tilt = useTransform(() => (STACK_TILT[rank()] ?? 0) * (1 - spread.get()));
  const y = useTransform(() => -Math.min(rank(), 3) * 10 * (1 - spread.get()));
  const scale = useTransform(() =>
    mix(1 - Math.min(rank(), 3) * 0.04, 1 - Math.min(Math.abs(dist()), 3) * 0.08, spread.get())
  );
  const opacity = useTransform(() => {
    const stackOp = rank() < 4 ? 1 : 0;
    const fanOp = wrap ? Math.min(1, Math.max(0, (n / 2 - Math.abs(dist())) / 0.5)) : 1;
    return mix(stackOp, fanOp, spread.get());
  });
  const zIndex = useTransform(() => Math.round(100 - mix(rank(), Math.abs(dist()), spread.get()) * 10));

  return (
    <motion.div
      style={{ rotate: fanRotate, zIndex, opacity, transformOrigin: "50% var(--fan-r)" }}
      className="absolute left-1/2 top-6 w-[220px] -translate-x-1/2 sm:top-8 sm:w-[300px]"
    >
      <motion.div
        style={{ rotate: tilt, y, scale }}
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-xl border bg-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-300",
          expanded && isActive ? "border-primary shadow-[0_24px_50px_-16px] shadow-primary/40" : "border-border"
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
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 640px) 300px, 220px"
              className="object-contain p-2"
            />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-primary/5 to-background p-4 text-center">
            <Award className="size-10 text-primary/70" strokeWidth={1.25} />
            <p className="line-clamp-2 text-xs font-medium text-foreground">{item.title}</p>
          </div>
        )}

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
