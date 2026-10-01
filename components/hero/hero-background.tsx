"use client";

import { useEffect, useRef } from "react";

const GRID_MASK = "radial-gradient(ellipse 90% 100% at 50% 35%, black 55%, transparent 100%)";
/** Reveals the lit layers only in a circle around the pointer (position set via CSS vars). */
const SPOT_MASK = "radial-gradient(220px circle at var(--spot-x) var(--spot-y), black, transparent 70%)";

/**
 * The hero's dotted grid. On devices with a mouse, the dots around the pointer light up in the
 * accent colour with a soft glow beneath them — a spotlight that follows the cursor. The pointer
 * position is written straight to CSS variables, so moving the mouse never re-renders React.
 */
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${e.clientX - box.left}px`);
        el.style.setProperty("--spot-y", `${e.clientY - box.top}px`);
        el.style.setProperty("--spot-on", "1");
      });
    };
    const onLeave = () => el.style.setProperty("--spot-on", "0");

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [--spot-on:0] [--spot-x:50%] [--spot-y:30%]"
      style={{ maskImage: GRID_MASK, WebkitMaskImage: GRID_MASK }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:22px_22px]" />
      {/* Lit layers: accent dots plus a faint glow, both shown only around the pointer. */}
      <div
        className="absolute inset-0 opacity-[var(--spot-on)] transition-opacity duration-500"
        style={{ maskImage: SPOT_MASK, WebkitMaskImage: SPOT_MASK }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1.2px,transparent_1.2px)] [background-size:22px_22px]" />
        <div className="absolute inset-0 bg-primary/[0.06]" />
      </div>
    </div>
  );
}
