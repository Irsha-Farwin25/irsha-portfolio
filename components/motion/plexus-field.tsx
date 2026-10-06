"use client";

import { useEffect, useRef } from "react";

/** Points closer than this are joined by a line, in px. */
const LINK = 150;
/** How far the pointer reaches out to join nearby points, in px. */
const REACH = 170;
/** Roughly one point per this many square pixels, so density stays even at any size. */
const AREA_PER_POINT = 15000;
const MAX_POINTS = 150;

type Point = { x: number; y: number; vx: number; vy: number };

/**
 * A light constellation for the sections below the hero: points drift slowly and join with fine
 * lines when they come near each other, and the pointer joins the points around it. Paused off
 * screen and in background tabs; a still frame for visitors who prefer reduced motion.
 */
export function PlexusField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let color = "";
    let dark = true;
    const pointer = { x: 0, y: 0, on: false };

    const readColors = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      dark = document.documentElement.classList.contains("dark");
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(MAX_POINTS, Math.round((width * height) / AREA_PER_POINT));
      points = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 9; // px per second: a slow drift
        return { x: Math.random() * width, y: Math.random() * height, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
      });
      if (reduce) draw();
    };

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      // Quieter on a light page, where dark lines stack up and crowd the headings.
      const strength = dark ? 1 : 0.6;
      ctx!.strokeStyle = color;
      ctx!.fillStyle = color;
      ctx!.lineWidth = 0.7;

      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          const d = Math.hypot(dx, dy);
          if (d > LINK) continue;
          ctx!.globalAlpha = (1 - d / LINK) * 0.3 * strength;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      // The pointer joins the points around it, brighter the closer they are.
      if (pointer.on) {
        for (const p of points) {
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (d > REACH) continue;
          ctx!.globalAlpha = (1 - d / REACH) * 0.6 * strength;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(pointer.x, pointer.y);
          ctx!.stroke();
        }
      }

      for (const p of points) {
        const near = pointer.on ? Math.max(0, 1 - Math.hypot(p.x - pointer.x, p.y - pointer.y) / REACH) : 0;
        ctx!.globalAlpha = Math.min(1, (0.45 + 0.5 * near) * strength);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.5 + near, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    let raf = 0;
    let last = 0;
    let visible = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      for (const p of points) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Wrap around the edges, so the field never thins out.
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduce || raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readColors();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // Theme switches toggle a class on <html>; re-read the colour when they do.
    const mo = new MutationObserver(() => {
      readColors();
      if (reduce) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const section = canvas.closest("section");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
      pointer.on = true;
    };
    const onLeave = () => (pointer.on = false);
    if (fine && section && !reduce) {
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      section?.removeEventListener("pointermove", onMove);
      section?.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}
