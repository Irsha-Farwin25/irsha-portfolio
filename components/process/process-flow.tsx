"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import {
  CircleCheck,
  CircleDashed,
  Compass,
  CornerDownRight,
  GitBranch,
  Hammer,
  LoaderCircle,
  PenLine,
  RefreshCw,
  Rocket,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** One icon per phase, in the dictionary's order. */
const PHASE_ICONS: LucideIcon[] = [Compass, PenLine, Hammer, Rocket];
/** How long each step "runs" before it passes. */
const STEP_MS = 650;

type State = "queued" | "running" | "passed";

const pad = (n: number) => String(n).padStart(2, "0");

/** The status icon for a step or a job. */
function StatusIcon({ state, className }: { state: State; className?: string }) {
  if (state === "passed") return <CircleCheck className={cn("text-chart-4", className)} aria-hidden />;
  if (state === "running") return <LoaderCircle className={cn("animate-spin text-primary", className)} aria-hidden />;
  return <CircleDashed className={cn("text-muted-foreground/50", className)} aria-hidden />;
}

/**
 * How she works, framed as a CI/CD pipeline run: the four phases are jobs on a board, and once the
 * board scrolls into view its ten steps run one after another (a spinner, then a green check).
 * Each step carries a line of proof from her real projects. A closing line loops the last step
 * back to the first; "Re-run" plays it again. With reduced motion, every step simply shows passed.
 */
export function ProcessFlow() {
  const t = useT();
  const p = t.process;
  const reduce = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boardRef, { once: true, amount: 0.25 });

  // Steps are numbered straight through the phases (01–10), so each phase starts where the last ended.
  const starts = p.phases.map((_, i) => p.phases.slice(0, i).reduce((sum, ph) => sum + ph.steps.length, 0));
  const total = p.phases.reduce((sum, ph) => sum + ph.steps.length, 0);

  // How many steps have passed. Runs once the board is on screen; "Re-run" restarts it.
  const [done, setDone] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => {
      setDone((d) => {
        if (d + 1 >= total) window.clearInterval(id);
        return Math.min(total, d + 1);
      });
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [inView, reduce, run, total]);

  const passed = reduce ? total : done;
  const running = inView && passed < total;
  const finished = passed >= total;
  const stepState = (i: number): State => (i < passed ? "passed" : running && i === passed ? "running" : "queued");
  const jobState = (first: number, count: number): State =>
    passed >= first + count ? "passed" : running && passed >= first ? "running" : "queued";
  const label = (s: State) => p.run[s];

  const rerun = () => {
    setDone(0);
    setRun((r) => r + 1);
  };

  return (
    <div
      ref={boardRef}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-50px] shadow-primary/40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
      />

      {/* Title bar: the workflow file, the branch, the run's status and a re-run button. */}
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-3 sm:px-5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-primary/60" />
        </span>
        <span dir="ltr" className="truncate font-mono text-xs text-muted-foreground">
          ~/pipeline/<span className="text-primary">{p.run.file}</span>
        </span>
        <span dir="ltr" className="hidden items-center gap-1 font-mono text-[11px] text-muted-foreground/80 sm:inline-flex">
          <GitBranch className="size-3" aria-hidden /> main
        </span>

        <div className="ms-auto flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-colors",
              finished
                ? "border-chart-4/40 text-chart-4"
                : running
                  ? "border-primary/40 text-primary"
                  : "border-border text-muted-foreground",
            )}
            aria-live="polite"
          >
            <StatusIcon state={finished ? "passed" : running ? "running" : "queued"} className="size-3" />
            {finished ? p.run.passed : running ? `${p.run.running} · ${passed}/${total}` : p.run.queued}
          </span>
          {!reduce && (
            <button
              type="button"
              onClick={rerun}
              disabled={!finished}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors enabled:hover:border-primary/50 enabled:hover:text-primary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <RotateCw className="size-3" aria-hidden /> {p.run.rerun}
            </button>
          )}
        </div>

        {/* Run progress along the bottom of the bar. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px">
          <div
            className="h-full bg-linear-to-r from-primary to-chart-4 transition-[width] duration-500 ease-out rtl:ms-auto rtl:bg-linear-to-l"
            style={{ width: `${(passed / total) * 100}%` }}
          />
        </div>
      </div>

      {/* The jobs, side by side on large screens. */}
      <ol className="relative grid sm:grid-cols-2 lg:grid-cols-4">
        {p.phases.map((phase, pi) => {
          const Icon = PHASE_ICONS[pi] ?? Compass;
          const first = starts[pi];
          const job = jobState(first, phase.steps.length);
          return (
            // Dividers between jobs: stacked rows on phones, a 2×2 grid on tablets, one row on desktop.
            <li
              key={phase.job}
              className="flex flex-col gap-3 border-border p-4 not-first:border-t sm:p-5 sm:not-first:border-t-0 sm:nth-[n+3]:border-t sm:nth-[odd]:border-e lg:nth-[n+3]:border-t-0 lg:nth-[odd]:border-e-0 lg:not-last:border-e"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-500",
                    job === "queued" ? "border-border text-muted-foreground" : "border-primary/40 bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="flex min-w-0 flex-col">
                  <h3 className="text-sm font-semibold tracking-tight">{phase.name}</h3>
                  <span dir="ltr" className="font-mono text-[10px] text-muted-foreground">
                    job: {phase.job} · {pad(first + 1)}–{pad(first + phase.steps.length)}
                  </span>
                </div>
                <span className="ms-auto" title={label(job)}>
                  <StatusIcon state={job} className="size-4" />
                  <span className="sr-only">{label(job)}</span>
                </span>
              </div>

              <ol className="flex flex-col gap-2">
                {phase.steps.map((step, si) => {
                  const n = first + si;
                  const state = stepState(n);
                  return (
                    <li
                      key={step.title}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-xl border p-3 transition-[opacity,border-color,background-color] duration-500",
                        state === "queued" && "border-border/60 opacity-50",
                        state === "running" && "border-primary/50 bg-primary/5",
                        state === "passed" && "border-border bg-background/50",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <StatusIcon state={state} className="mt-px size-3.5 shrink-0" />
                        <span dir="ltr" className="font-mono text-[11px] leading-5 text-primary/80 tabular-nums">
                          {pad(n + 1)}
                        </span>
                        <h4 className="text-[13px] leading-5 font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-pretty text-xs leading-snug text-muted-foreground">{step.body}</p>
                      {/* Proof from her real work. */}
                      <p className="flex gap-1.5 border-t border-dashed border-border pt-1.5 text-[11px] leading-snug">
                        <CornerDownRight className="mt-0.5 size-3 shrink-0 text-primary/70 rtl:-scale-x-100" aria-hidden />
                        <span>
                          <span className="sr-only">{p.run.proofLabel}: </span>
                          <span className="font-mono font-medium text-primary">{step.proof.project}</span>
                          <span className="text-foreground/75"> · {step.proof.text}</span>
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>

      {/* The loop: the last step feeds the first. */}
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border bg-primary/5 px-4 py-3 sm:px-5">
        {finished ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-chart-4">
            <CircleCheck className="size-3.5" aria-hidden /> {p.run.allPassed(total)}
          </span>
        ) : null}
        <p className="flex items-center gap-2 text-pretty text-sm text-foreground/85">
          <RefreshCw className="size-3.5 shrink-0 text-primary" aria-hidden />
          {p.loop}
        </p>
        <span dir="ltr" className="ms-auto hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
          {pad(total)} → {pad(1)}
        </span>
      </div>
    </div>
  );
}
