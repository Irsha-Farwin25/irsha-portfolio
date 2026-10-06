"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The line between sections: a hairline that fades out at both ends, with one signal of light
 * running along it the first time it comes into view (the hero's network, carried down the page).
 * Place it first inside a `relative` section.
 */
export function SignalDivider() {
  const reduce = useReducedMotion();
  return (
    // A band taller than the line, centred on the section's top edge, so the signal's glow isn't clipped.
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-6 -translate-y-1/2 overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      {!reduce && (
        <motion.span
          className="absolute inset-y-0 w-48"
          initial={{ insetInlineStart: "-12rem", opacity: 0 }}
          whileInView={{ insetInlineStart: "100%", opacity: [0, 1, 1, 0] }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 2.2, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }}
        >
          {/* A soft glow under a bright core. */}
          <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-linear-to-r from-transparent via-primary/60 to-transparent blur-[3px]" />
          <span className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-primary to-transparent" />
        </motion.span>
      )}
    </div>
  );
}

/**
 * The short line before a section label: it draws itself in, and a node at its end lights up
 * with one soft pulse, like a signal arriving.
 */
export function EyebrowLine() {
  const reduce = useReducedMotion();
  return (
    <span aria-hidden className="relative flex h-px w-6 items-center">
      <motion.span
        className="h-px w-full origin-left bg-primary/60 rtl:origin-right"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      <motion.span
        className="absolute -end-0.5 size-1.5 rounded-full bg-primary"
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.5, ease: EASE }}
      >
        {!reduce && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary"
            initial={{ scale: 1, opacity: 0 }}
            whileInView={{ scale: [1, 3.2], opacity: [0.6, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
          />
        )}
      </motion.span>
    </span>
  );
}
