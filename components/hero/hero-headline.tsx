"use client";

import { motion, useReducedMotion } from "motion/react";

const WORD_STAGGER = 0.07;
const WORD_DURATION = 0.7;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Splits the headline into the pieces that animate in turn: single words, except the accent
 * phrase (one or more words), which stays together so it shares one gradient and underline.
 * Punctuation right after the accent ("potential.") stays outside the highlight.
 */
function segment(text: string, accent: string) {
  const words = text.split(" ");
  const accentWords = accent.split(" ");
  const bare = (w: string) => w.replace(/[^\w'-]/g, "");
  const start = words.findIndex((_, i) =>
    accentWords.every((a, j) => bare(words[i + j] ?? "") === a)
  );
  if (start === -1) return words.map((w) => ({ text: w, accent: false, trailing: "" }));

  const last = words[start + accentWords.length - 1];
  const trailing = last.slice(bare(last).length);
  return [
    ...words.slice(0, start).map((w) => ({ text: w, accent: false, trailing: "" })),
    { text: accent, accent: true, trailing },
    ...words.slice(start + accentWords.length).map((w) => ({ text: w, accent: false, trailing: "" })),
  ];
}

/**
 * The hero headline. Each word rises out of a blur in turn; the accent phrase carries a slowly
 * flowing gradient and a hand-drawn underline that draws itself in once the line has landed.
 */
export function HeroHeadline({ text, accent }: { text: string; accent: string }) {
  const reduce = useReducedMotion();
  const pieces = segment(text, accent);
  const landed = pieces.length * WORD_STAGGER + WORD_DURATION * 0.6;

  return (
    <>
      {pieces.map((piece, i) => (
        <span key={i}>
          <motion.span
            className="inline-block"
            initial={reduce ? false : { opacity: 0, y: "0.35em", filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: WORD_DURATION, delay: 0.1 + i * WORD_STAGGER, ease: EASE }}
          >
            {piece.accent ? (
              <>
                <Accent word={piece.text} drawAt={landed} reduce={!!reduce} />
                {piece.trailing}
              </>
            ) : (
              piece.text
            )}
          </motion.span>
          {i < pieces.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

function Accent({ word, drawAt, reduce }: { word: string; drawAt: number; reduce: boolean }) {
  return (
    <span className="relative inline-block">
      <motion.span
        className="bg-linear-to-r from-primary via-chart-2 to-primary bg-[length:200%_100%] bg-clip-text text-transparent"
        animate={reduce ? undefined : { backgroundPositionX: ["0%", "200%"] }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      >
        {word}
      </motion.span>
      {/* Hand-drawn underline, slightly uneven like a pen stroke. */}
      <svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.22em] w-full overflow-visible text-primary"
      >
        <motion.path
          d="M3,9 C40,4 80,3 120,6 C150,8 175,7 197,4"
          fill="none"
          stroke="currentColor"
          // In viewBox units, so it scales with the type. (No non-scaling-stroke: that measures
          // the draw-in in screen pixels, which cut the line short under wide phrases.)
          strokeWidth={5}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 0.8, delay: drawAt, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
    </span>
  );
}
