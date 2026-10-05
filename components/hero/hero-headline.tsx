"use client";

import { useEffect, useRef, useState } from "react";
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
  // Letters and digits in any script, so Arabic words match too.
  const bare = (w: string) => w.replace(/[^\p{L}\p{M}\p{N}'-]/gu, "");
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
 * The hero headline. Each word rises out of a blur in turn; the `decode` words then take turns in
 * place of the first one, each scrambling into the next like code compiling (and again on hover);
 * the accent phrase carries a slowly flowing gradient, a hand-drawn underline that draws itself in
 * and then glints, and a few twinkling sparkles.
 */
export function HeroHeadline({ text, accent, decode = [] }: { text: string; accent: string; decode?: string[] }) {
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
            ) : decode.length > 0 && piece.text === decode[0] ? (
              <Decode words={decode} startAt={0.1 + i * WORD_STAGGER + WORD_DURATION * 0.5} reduce={!!reduce} />
            ) : (
              piece.text
            )}
          </motion.span>
          {/* The line ends after the changing word, so a shorter word never leaves a gap mid-line. */}
          {i < pieces.length - 1 && (decode.length > 1 && piece.text === decode[0] ? <br /> : " ")}
        </span>
      ))}
    </>
  );
}

const LATIN = "abcdefghijklmnopqrstuvwxyz<>/{}[]=_$#";
const ARABIC = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";

/** How long each word holds before decoding into the next. */
const HOLD_MS = 3500;
/** How long a word takes to decode (scramble, then lock in letter by letter). */
const DECODE_MS = 900;

/**
 * Words that take turns: each "decodes" into the next, its letters cycling through random
 * characters and locking in left to right (in reading order), like code compiling. The first
 * decode plays as the word lands; hovering replays the current one. Every word sits invisibly in
 * the same spot, so the slot is always as wide as the longest and nothing around it shifts.
 */
function Decode({ words, startAt, reduce }: { words: string[]; startAt: number; reduce: boolean }) {
  // What's on screen: the letters already locked in, and the scrambled rest ("" when settled).
  // Both always render, so updates only change text and never add or remove DOM nodes (which
  // browser translators and extensions can disturb, crashing React's removeChild).
  const [frame, setFrame] = useState({ locked: words[0] ?? "", noise: "" });
  const indexRef = useRef(0);
  // Lets a hover replay the current word through the chain below.
  const replay = useRef<(() => void) | null>(null);

  // One chain at a time: decode a word, hold it, then decode the next. Starting a decode cancels
  // whatever was pending, so a hover or a return to the tab can never overlap two animations.
  useEffect(() => {
    if (reduce) return;
    let raf: number | null = null;
    let hold: ReturnType<typeof setTimeout> | null = null;
    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      if (hold !== null) clearTimeout(hold);
      raf = hold = null;
    };

    const decode = (to: number) => {
      stop();
      const target = words[to];
      const letters = [...target];
      const charset = /\p{Script=Arabic}/u.test(target) ? ARABIC : LATIN;
      const noise = (from: number) =>
        letters
          .slice(from)
          .map((ch) => (ch === " " ? " " : charset[Math.floor(Math.random() * charset.length)]))
          .join("");

      // The new word goes in with the first scrambled frame, so it never flashes before scrambling.
      indexRef.current = to;
      setFrame({ locked: "", noise: noise(0) });

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DECODE_MS);
        const locked = Math.floor(progress * letters.length);
        if (progress < 1) {
          setFrame({ locked: letters.slice(0, locked).join(""), noise: noise(locked) });
          raf = requestAnimationFrame(tick);
          return;
        }
        raf = null;
        setFrame({ locked: target, noise: "" });
        if (words.length > 1) hold = setTimeout(() => decode((indexRef.current + 1) % words.length), HOLD_MS);
      };
      raf = requestAnimationFrame(tick);
    };

    replay.current = () => {
      if (raf === null) decode(indexRef.current); // only between decodes, never mid-scramble
    };
    // The first decode plays as the word lands; the chain carries on from there.
    hold = setTimeout(() => decode(0), startAt * 1000);
    return () => {
      stop();
      replay.current = null;
    };
  }, [words, startAt, reduce]);

  return (
    <span className="relative inline-grid" onPointerEnter={() => replay.current?.()}>
      {/* Every word, invisible, in one grid cell: the slot takes the widest one's width. */}
      {words.map((w) => (
        <span key={w} aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {w}
        </span>
      ))}
      {/* Screen readers hear every word once ("software / AI"), not the animation. */}
      <span className="sr-only">{words.join(" / ")}</span>
      {/* Laid over the slot rather than in it, so wide scrambled characters can't stretch it. */}
      <span aria-hidden className="absolute inset-y-0 start-0 whitespace-nowrap">
        {/* Locked letters already look final; only the still-scrambling ones are tinted. */}
        <span>{frame.locked}</span>
        <span className="text-primary/80">{frame.noise}</span>
      </span>
    </span>
  );
}

/** Where the sparkles sit around the accent phrase, and when each first twinkles. */
const SPARKLES = [
  { className: "-top-[0.18em] start-[8%] size-[0.28em]", delay: 0 },
  { className: "-top-[0.3em] end-[18%] size-[0.2em]", delay: 1.1 },
  { className: "top-[30%] -end-[0.32em] size-[0.24em]", delay: 2.2 },
  { className: "bottom-[0.05em] start-[42%] size-[0.16em]", delay: 3.0 },
];

function Accent({ word, drawAt, reduce }: { word: string; drawAt: number; reduce: boolean }) {
  return (
    // Kept on one line from tablets up, so the underline and sparkles stay with the words. (On
    // phones it may wrap; the headline sizes are chosen so it fits each layout's column.)
    <span className="relative inline-block sm:whitespace-nowrap">
      <motion.span
        className="bg-linear-to-r from-primary via-chart-2 to-primary bg-[length:200%_100%] bg-clip-text text-transparent"
        animate={reduce ? undefined : { backgroundPositionX: ["0%", "200%"] }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      >
        {word}
      </motion.span>

      {/* Twinkling sparkles around the phrase. */}
      {!reduce &&
        SPARKLES.map((s, i) => (
          <motion.svg
            key={i}
            aria-hidden
            viewBox="0 0 24 24"
            className={`pointer-events-none absolute text-chart-2 ${s.className}`}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 90, 180] }}
            transition={{ duration: 1.6, delay: drawAt + 0.6 + s.delay, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
          >
            <path fill="currentColor" d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" />
          </motion.svg>
        ))}

      {/* Hand-drawn underline, slightly uneven like a pen stroke. */}
      <svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.22em] w-full overflow-visible text-primary"
      >
        <defs>
          {/* A short bright band that slides along the stroke: the glint. */}
          <motion.linearGradient
            id="headline-glint"
            gradientUnits="userSpaceOnUse"
            x1="-60"
            x2="0"
            y1="0"
            y2="0"
            animate={reduce ? undefined : { x1: [-60, 200], x2: [0, 260] }}
            transition={{ duration: 1.4, delay: drawAt + 1, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" }}
          >
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.5" stopColor="white" stopOpacity="0.9" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </motion.linearGradient>
        </defs>
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
        {!reduce && (
          <motion.path
            d="M3,9 C40,4 80,3 120,6 C150,8 175,7 197,4"
            fill="none"
            stroke="url(#headline-glint)"
            strokeWidth={5}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: drawAt + 0.8 }}
          />
        )}
      </svg>
    </span>
  );
}
