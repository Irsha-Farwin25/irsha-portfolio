"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { BriefcaseBusiness, FileText, GraduationCap, Landmark, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = { value: number | string; suffix?: string; label: string; icon?: string };

const ICONS: Record<string, LucideIcon> = {
  briefcase: BriefcaseBusiness,
  graduation: GraduationCap,
  paper: FileText,
  landmark: Landmark,
};

/**
 * The hero's proof points as a full-width row of glass cards (2×2 on phones). Each rises in after
 * the one before; numeric values count up; hovering a card lifts it with a soft accent glow.
 */
export function HeroStats({ stats }: { stats: readonly Stat[] }) {
  const reduce = useReducedMotion();
  return (
    // Columns follow the number of cards, so the row never shows an empty slot. On phones (two
    // columns) an odd last card spans the full width.
    <dl className={cn("grid grid-cols-2 gap-3 sm:gap-4", stats.length === 3 ? "sm:grid-cols-3" : "lg:grid-cols-4")}>
      {stats.map((s, i) => {
        const Icon = s.icon ? ICONS[s.icon] : undefined;
        return (
          // The label is the <dt> (it comes first for screen readers); the value shows above it.
          <motion.div
            key={s.label}
            className="group relative flex min-w-0 flex-col gap-1 overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_32px_-14px] hover:shadow-primary/40 odd:last:col-span-2 sm:p-5 sm:odd:last:col-span-1"
            initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Soft accent wash in the top corner that brightens on hover. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-primary/10 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            />
            {Icon && (
              <span
                aria-hidden
                className="relative mb-2 flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
              >
                <Icon className="size-4" />
              </span>
            )}
            <dt className="relative order-2 text-xs leading-snug text-muted-foreground sm:text-[13px]">{s.label}</dt>
            <dd className="relative order-1 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
              {typeof s.value === "number" ? <CountUp to={s.value} /> : s.value}
              {s.suffix && <span className="text-primary">{s.suffix}</span>}
            </dd>
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
    if (!el || !inView || reduce) return;
    const controls = animate(0, to, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  // Renders the final value on the server and without motion; counts up from 0 once on screen.
  return <span ref={ref}>{to}</span>;
}
