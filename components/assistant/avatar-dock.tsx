"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Send, Sparkles, Volume2, VolumeX, XIcon } from "lucide-react";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/components/assistant/chat-context";
import { Typewriter } from "@/components/assistant/chat-view";
import {
  introLine,
  mutedGreeting,
  narrationMs,
  nudgeLines,
  pageLine,
  returnLine,
  sectionLines,
} from "@/lib/chat/narration";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { speak, stopSpeaking } from "@/lib/chat/voice";
import {
  GESTURE_FLICK_MS,
  type AvatarModelUrls,
  type AvatarSignals,
  type HandPosition,
} from "@/components/assistant/avatar-scene";

const AvatarScene = dynamic(
  () => import("@/components/assistant/avatar-scene"),
  { ssr: false },
);

/** Mixamo exports of the Meshy character (CC BY 4.0): skinned greeting + skeleton-only idle. */
const MODEL_URLS: AvatarModelUrls = {
  character: "/avatar/irsha-greeting.fbx",
  idle: "/avatar/irsha-idle.fbx",
  // Bump the version when the texture file changes so browsers don't keep a cached copy.
  texture: "/avatar/irsha-texture.jpg?v=4",
};
const HIDDEN_KEY = "avatar-dock-hidden";

/** Where the bubble's corner meets her (just left of her hijab), as a fraction of the dock's width from its right edge. */
const MOUTH_FROM_RIGHT = 0.58;

function canRender3D() {
  try {
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (conn?.saveData) return false;
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

function readHidden() {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

const MUTED_KEY = "avatar-guide-muted";

function readMuted() {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Set once the visitor has clicked her, so the "click me" hints stop for good. */
const CHATTED_KEY = "avatar-chat-tried";

function readChatted() {
  try {
    return localStorage.getItem(CHATTED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Touch screen (she says "tap") or mouse ("click"). */
function isTouch() {
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Quiet time (no bubble) before she nudges a visitor who hasn't clicked her yet. */
const NUDGE_AFTER_QUIET_MS = 15000;

function writeHidden(hidden: boolean) {
  try {
    localStorage.setItem(HIDDEN_KEY, hidden ? "1" : "0");
  } catch {}
}

/**
 * A 3D character pinned to the bottom-right corner that greets, idles and reacts to the cursor and
 * scrolling; clicking her opens the portfolio chat assistant. Without WebGL, or with reduced motion,
 * a plain "Ask about Irsha" button opens the same chat.
 */
export function AvatarDock() {
  const mounted = useHasMounted();
  const reduce = useReducedMotion();
  if (!mounted) return null;
  return <Dock reduceMotion={!!reduce} />;
}

/** How long the visitor stays on a page before she introduces it. */
const PAGE_DWELL_MS = 3000;

function Dock({ reduceMotion }: { reduceMotion: boolean }) {
  const [supported] = useState(() => !reduceMotion && canRender3D());
  const [hidden, setHidden] = useState(readHidden);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  /** What she's saying above her head: short greetings, or a section's narration (typed out). */
  const [bubble, setBubble] = useState<{ text: string; typed: boolean; id: number } | null>(null);
  const [muted, setMuted] = useState(readMuted);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  const [chatted, setChatted] = useState(readChatted);
  /** When her current line finishes, so other lines wait their turn instead of cutting her off. */
  const speakingUntil = useRef(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const signals = useRef<AvatarSignals>({
    waveAt: 0,
    pointer: { x: -0.35, y: 0.1 },
    scrollVelocity: 0,
    mode: "idle",
    gestureAt: 0,
    traveling: false,
  });
  /** Her right hand on screen (fractions of the canvas), updated while she swipes. */
  const hand = useRef<HandPosition>({ x: 0.3, y: 0.45 });
  /** The spark flying from her hand to the card; the card flips when it lands. */
  /** Where her fingertip touches the card — a ripple plays there as it flips. */
  const [touch, setTouch] = useState<{ x: number; y: number; id: number } | null>(null);
  /** Offset of the whole dock from its corner while she stands beside the hero card. */
  const travelX = useMotionValue(0);
  const travelY = useMotionValue(0);
  const atCard = useRef(false);
  /** Mirrors `atCard` for rendering: her bubble hides while she stands at the open chat card. */
  const [standingAtCard, setStandingAtCard] = useState(false);
  const setAtCard = (value: boolean) => {
    atCard.current = value;
    setStandingAtCard(value);
  };
  const pathname = usePathname();
  const t = useT();
  const locale = useLocale();
  /** For callbacks that outlive a render (timers, speech): the language she speaks right now. */
  const localeRef = useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);
  /** Sections and pages she has introduced this visit (coming back won't repeat them). */
  const narrated = useRef(new Set<string>());
  const cardRef = useRef<HTMLElement | null>(null);
  /** A sent message's paper plane, flying from the send button to her hand. */
  const [plane, setPlane] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    done: () => void;
  } | null>(null);
  const planeHomeTimer = useRef<number | undefined>(undefined);
  const [spark, setSpark] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    done: () => void;
  } | null>(null);

  const { open: chatOpen, toggleFromAvatar, setModeListener, setFlipAnimator, setNarrator, setPlaneCatcher } =
    useChatContext();

  // Thinking / talking from the chat (wherever it's showing) drives her animation.
  useEffect(() => {
    setModeListener((mode) => {
      signals.current.mode = mode;
    });
    return () => setModeListener(null);
  }, [setModeListener]);

  const wave = useCallback((line?: string) => {
    const now = performance.now();
    signals.current.waveAt = now;
    if (!line) return;
    setBubble({ text: line, typed: false, id: now });
    speakingUntil.current = now + 2800;
    if (!mutedRef.current) speak(line, localeRef.current);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2800);
  }, []);

  const chatOpenRef = useRef(false);
  const talkTimer = useRef<number | undefined>(undefined);

  /** Narrates a line: she points toward the page, "talks" while it types out, then it fades. */
  const narrate = useCallback((line: string) => {
    const now = performance.now();
    signals.current.gestureAt = now;
    signals.current.mode = "talking";
    const typing = narrationMs(line);
    setBubble({ text: line, typed: true, id: now });
    speakingUntil.current = now + typing + 2000;
    if (!mutedRef.current) speak(line, localeRef.current);
    window.clearTimeout(talkTimer.current);
    talkTimer.current = window.setTimeout(() => {
      if (!chatOpenRef.current) signals.current.mode = "idle";
    }, typing);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), typing + 3500);
  }, []);

  // Load the ~3 MB model only once the page is idle, so it never competes with the hero.
  useEffect(() => {
    if (!supported || hidden || enabled) return;
    const start = () => setEnabled(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    // Safari has no requestIdleCallback.
    const id = globalThis.setTimeout(start, 2500);
    return () => globalThis.clearTimeout(id);
  }, [supported, hidden, enabled]);

  // Cursor → head/eye direction, scroll → lean.
  useEffect(() => {
    if (!enabled) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let settle: number | undefined;

    const onPointer = (e: PointerEvent) => {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height * 0.3;
      signals.current.pointer.x = Math.max(
        -1,
        Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)),
      );
      signals.current.pointer.y = Math.max(
        -1,
        Math.min(1, -(e.clientY - cy) / (window.innerHeight / 2)),
      );
    };
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastT);
      signals.current.scrollVelocity = (window.scrollY - lastY) / dt;
      lastY = window.scrollY;
      lastT = now;
      window.clearTimeout(settle);
      settle = window.setTimeout(
        () => (signals.current.scrollVelocity = 0),
        120,
      );
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  }, [enabled]);

  // Guide mode: when the visitor pauses on a home-page section, she introduces it once per visit.
  // Quiet while the chat is open, while muted, and during fast scrolling.
  useEffect(() => {
    if (!ready || hidden || muted) return;
    const lines = sectionLines(locale);
    const sections = Object.keys(lines)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const ratios = new Map<string, number>();
    let settle: number | undefined;

    const onSettled = () => {
      if (chatOpenRef.current && atCard.current) return;
      const busy = speakingUntil.current - performance.now();
      if (busy > 0) {
        settle = window.setTimeout(onSettled, busy);
        return;
      }
      let best: string | null = null;
      let bestShare = 0.3; // the section fills at least 30% of the screen
      for (const [id, share] of ratios) {
        if (share > bestShare) {
          best = id;
          bestShare = share;
        }
      }
      if (!best || narrated.current.has(best)) return;
      narrated.current.add(best);
      narrate(lines[best]);
    };
    const schedule = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(onSettled, 700);
    };

    const io = new IntersectionObserver(
      (entries) => {
        // Tall sections never reach a high ratio, so measure how much of the screen each fills.
        for (const e of entries) ratios.set(e.target.id, e.intersectionRect.height / window.innerHeight);
        schedule();
      },
      { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] },
    );
    sections.forEach((el) => io.observe(el));
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.clearTimeout(settle);
    };
    // `pathname`: the sections only exist on the home page, so look again after navigating.
  }, [ready, hidden, muted, narrate, pathname, locale]);

  // On other pages, she introduces the page once the visitor has stayed on it for a moment
  // (long enough for her greeting to finish on a first visit). Once per page per visit.
  useEffect(() => {
    if (!ready || hidden || muted) return;
    const line = pageLine(pathname, locale);
    if (!line || narrated.current.has(pathname)) return;
    let id: number | undefined;
    const speak = () => {
      if (chatOpenRef.current && atCard.current) return;
      const busy = speakingUntil.current - performance.now();
      if (busy > 0) {
        id = window.setTimeout(speak, busy);
        return;
      }
      narrated.current.add(pathname);
      narrate(line);
    };
    id = window.setTimeout(speak, PAGE_DWELL_MS);
    return () => window.clearTimeout(id);
  }, [ready, hidden, muted, narrate, pathname, locale]);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  // Browsers keep her silent until the visitor first clicks, taps or types. If she's mid-line
  // (usually her intro) at that moment, she says it aloud then.
  const bubbleRef = useRef(bubble);
  useEffect(() => {
    bubbleRef.current = bubble;
  }, [bubble]);
  useEffect(() => {
    const onFirst = () => {
      const b = bubbleRef.current;
      if (b && !mutedRef.current && performance.now() < speakingUntil.current) speak(b.text, localeRef.current);
    };
    window.addEventListener("pointerdown", onFirst, { once: true, capture: true });
    window.addEventListener("keydown", onFirst, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst, { capture: true });
      window.removeEventListener("keydown", onFirst, { capture: true });
    };
  }, []);

  // Until the visitor first clicks her, she drops a short, hiring-focused hint during quiet
  // moments, each one once per visit.
  useEffect(() => {
    if (!ready || hidden || muted || chatted) return;
    const lines = nudgeLines(locale, isTouch());
    let next = 0;
    const id = window.setInterval(() => {
      if (next >= lines.length) return window.clearInterval(id);
      if (chatOpenRef.current) return;
      if (performance.now() - speakingUntil.current < NUDGE_AFTER_QUIET_MS) return;
      narrate(lines[next++]);
    }, 2000);
    return () => window.clearInterval(id);
  }, [ready, hidden, muted, chatted, narrate, locale]);

  // Lets the page hand her lines to say (e.g. the certificate under the spotlight). Only while
  // she's on screen and not muted, so the page knows to show the text itself otherwise.
  useEffect(() => {
    if (!ready || hidden || muted) return;
    setNarrator((line) => {
      if (chatOpenRef.current && atCard.current) return;
      narrate(line);
    });
    return () => setNarrator(null);
  }, [ready, hidden, muted, narrate, setNarrator]);

  useEffect(
    () => () => {
      window.clearTimeout(bubbleTimer.current);
      window.clearTimeout(talkTimer.current);
      stopSpeaking();
    },
    [],
  );

  /**
   * Where her bubble goes and how wide it may grow. Beside her mouth it opens leftward into the
   * empty margin between the page content and her (up to 270px). When that margin is too narrow
   * it sits above her head instead, spanning the margin from her right edge, so it never covers
   * the content. Only where neither fits (small screens) does it keep a readable 200px beside
   * her and reach over the content's edge (its glass is near-opaque).
   */
  const [bubbleMaxW, setBubbleMaxW] = useState(270);
  const [bubbleAbove, setBubbleAbove] = useState(false);
  const fitBubble = useCallback(() => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const container = document.querySelector<HTMLElement>("[data-page-container]");
    let contentRight = 0;
    if (container) {
      const r = container.getBoundingClientRect();
      contentRight = r.right - parseFloat(getComputedStyle(container).paddingRight);
    }
    const mouthX = box.left + box.width * (1 - MOUTH_FROM_RIGHT);
    const beside = mouthX - contentRight - 12;
    const above = box.right - contentRight - 12;
    if (beside < 200 && above >= 180) {
      setBubbleAbove(true);
      setBubbleMaxW(Math.min(270, above));
      return;
    }
    setBubbleAbove(false);
    // Never wider than the screen allows to the left of her mouth.
    setBubbleMaxW(Math.min(Math.max(200, Math.min(270, beside)), mouthX - 16));
  }, []);

  useEffect(() => {
    if (!bubble) return;
    fitBubble();
    window.addEventListener("resize", fitBubble);
    return () => window.removeEventListener("resize", fitBubble);
  }, [bubble, fitBubble]);

  const toggleMuted = () => {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTED_KEY, next ? "1" : "0");
    } catch {}
    if (next) {
      stopSpeaking();
      setBubble(null);
      if (!chatOpenRef.current) signals.current.mode = "idle";
    }
  };


  const onReady = useCallback(() => {
    setReady(true);
    window.setTimeout(() => {
      if (readChatted()) wave(returnLine(localeRef.current));
      // First visit: she introduces herself and says how to start, unless narration is muted.
      else if (readMuted()) wave(mutedGreeting(localeRef.current, isTouch()));
      else {
        signals.current.waveAt = performance.now();
        narrate(introLine(localeRef.current, isTouch()));
      }
    }, 500);
  }, [wave, narrate]);

  const hide = () => {
    setHidden(true);
    setBubble(null);
    stopSpeaking();
    writeHidden(true);
  };
  const show = () => {
    setHidden(false);
    writeHidden(false);
    if (ready) window.setTimeout(() => wave(t.avatar.welcomeBack), 300);
  };

  /**
   * Offset that puts her beside the card's right edge (her reaching hand just meets it), standing
   * level with its bottom. Null when there's no room beside the card (narrow screens).
   */
  const offsetBesideCard = useCallback(
    (card: HTMLElement) => {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return null;
      const homeLeft = box.left - travelX.get();
      const homeTop = box.top - travelY.get();
      const c = card.getBoundingClientRect();
      const left = c.right - box.width * 0.06;
      if (left + box.width > window.innerWidth - 8) return null;
      const top = Math.min(
        Math.max(c.bottom + box.height * 0.08 - box.height, 72),
        window.innerHeight - box.height - 8,
      );
      return { x: left - homeLeft, y: top - homeTop };
    },
    [travelX, travelY],
  );

  /** Rides the platform to an offset from the corner (0,0 = home), glowing while it moves. */
  const rideTo = useCallback(
    async (to: { x: number; y: number }) => {
      signals.current.traveling = true;
      const spring = { type: "spring" as const, stiffness: 70, damping: 16 };
      await Promise.all([animate(travelX, to.x, spring), animate(travelY, to.y, spring)]);
      signals.current.traveling = false;
    },
    [travelX, travelY],
  );

  // She flips the hero card herself: she rides her platform over beside it, reaches out, and the
  // card turns where her hand touches it. Without room beside the card, she reaches from where
  // she stands and a spark carries the flip across instead.
  useEffect(() => {
    if (!ready || hidden) return;
    setFlipAnimator(async (card) => {
      setBubble(null);
      const beside = offsetBesideCard(card);
      if (beside) {
        cardRef.current = card;
        await rideTo(beside);
        setAtCard(true);
      }
      signals.current.gestureAt = performance.now();
      await new Promise((r) => window.setTimeout(r, GESTURE_FLICK_MS));
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      const fingertip = {
        x: box.left + hand.current.x * box.width,
        y: box.top + hand.current.y * box.height,
      };
      if (beside) {
        setTouch({ ...fingertip, id: performance.now() });
        await new Promise((r) => window.setTimeout(r, 160));
        return;
      }
      const target = card.getBoundingClientRect();
      await new Promise<void>((done) =>
        setSpark({
          from: fingertip,
          to: { x: target.right - target.width * 0.12, y: target.top + target.height * 0.18 },
          done,
        }),
      );
    });
    return () => setFlipAnimator(null);
  }, [ready, hidden, setFlipAnimator, offsetBesideCard, rideTo]);

  // A message is sent from the contact card: she rides over beside it (when there's room and the
  // chat isn't holding her at the hero card), catches the paper plane, waves, and heads home.
  useEffect(() => {
    if (!ready || hidden) return;
    setPlaneCatcher(async (from, card) => {
      setBubble(null);
      stopSpeaking();
      window.clearTimeout(planeHomeTimer.current);
      const beside = chatOpenRef.current ? null : offsetBesideCard(card);
      if (beside) await rideTo(beside);
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      const palm = { x: box.left + hand.current.x * box.width, y: box.top + hand.current.y * box.height };
      await new Promise<void>((done) => setPlane({ from, to: palm, done }));
      signals.current.waveAt = performance.now();
      if (beside) {
        planeHomeTimer.current = window.setTimeout(() => {
          if (!chatOpenRef.current && !atCard.current) void rideTo({ x: 0, y: 0 });
        }, 4500);
      }
    });
    return () => {
      setPlaneCatcher(null);
      window.clearTimeout(planeHomeTimer.current);
    };
  }, [ready, hidden, setPlaneCatcher, offsetBesideCard, rideTo]);

  // While the chat is open she stays beside the card as the page scrolls; if the card leaves the
  // screen she rides home, and comes back when it returns. Closing the chat sends her home.
  useEffect(() => {
    if (!chatOpen) {
      if (atCard.current) {
        setAtCard(false);
        void rideTo({ x: 0, y: 0 });
      }
      return;
    }
    let riding = false;
    const follow = () => {
      const card = cardRef.current;
      if (!card?.isConnected || riding) return;
      const c = card.getBoundingClientRect();
      const visible = c.bottom > 120 && c.top < window.innerHeight - 120;
      const beside = visible ? offsetBesideCard(card) : null;
      if (atCard.current && beside) {
        travelX.set(beside.x);
        travelY.set(beside.y);
      } else if (atCard.current && !beside) {
        setAtCard(false);
        riding = true;
        void rideTo({ x: 0, y: 0 }).then(() => (riding = false));
      } else if (!atCard.current && beside) {
        riding = true;
        void rideTo(beside).then(() => {
          riding = false;
          setAtCard(true);
          follow();
        });
      }
    };
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
    };
  }, [chatOpen, offsetBesideCard, rideTo, travelX, travelY]);

  // Opening plays the swipe above as part of the flip; closing flips straight back.
  const onAvatarClick = () => {
    if (!chatOpen) {
      setBubble(null);
      stopSpeaking();
    }
    if (!chatted) {
      setChatted(true);
      try {
        localStorage.setItem(CHATTED_KEY, "1");
      } catch {}
    }
    toggleFromAvatar();
  };

  if (!supported) {
    return (
      <button
        type="button"
        onClick={onAvatarClick}
        aria-expanded={chatOpen}
        className="fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:right-6 sm:bottom-6"
      >
        <Sparkles className="size-4 text-primary" aria-hidden />
        {t.avatar.fallbackButton}
      </button>
    );
  }

  return (
    <>
      {spark && (
        <Spark
          from={spark.from}
          to={spark.to}
          onDone={() => {
            setSpark(null);
            spark.done();
          }}
        />
      )}
      {plane && (
        <PaperPlane
          from={plane.from}
          to={plane.to}
          onDone={() => {
            setPlane(null);
            plane.done();
          }}
        />
      )}
      {touch && <TouchRipple key={touch.id} x={touch.x} y={touch.y} onDone={() => setTouch(null)} />}
      <motion.div
        className="pointer-events-none fixed right-3 bottom-3 z-30 sm:right-6 sm:bottom-5"
        style={{ x: travelX, y: travelY }}
      >
      <AnimatePresence>
        {hidden ? (
          <motion.button
            key="restore"
            type="button"
            onClick={show}
            aria-label={t.avatar.show}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-border bg-card text-lg shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span aria-hidden>👋</span>
          </motion.button>
        ) : (
          enabled && (
            <motion.div
              key="dock"
              ref={boxRef}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={
                ready
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 24, scale: 0.9 }
              }
              exit={{ opacity: 0, y: 24, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="group relative h-[210px] w-[120px] sm:h-[360px] sm:w-[204px]"
            >
              <span
                aria-hidden
                className="absolute inset-x-2 top-[8%] bottom-[10%] rounded-full bg-primary/15 blur-2xl dark:bg-primary/25"
              />

              <button
                type="button"
                aria-label={t.avatar.chat}
                aria-expanded={chatOpen}
                onClick={onAvatarClick}
                className="pointer-events-auto absolute inset-0 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <AvatarScene
                  urls={MODEL_URLS}
                  signals={signals}
                  onReady={onReady}
                  handRef={hand}
                />
              </button>

              {/* Until the visitor first clicks her, a chip at her feet says she's clickable. */}
              <AnimatePresence>
                {ready && !chatted && !chatOpen && (
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: 1.2 }}
                    className="pointer-events-none absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-primary/40 bg-card/95 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-foreground shadow-md shadow-primary/20 backdrop-blur"
                  >
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    {t.avatar.chip}
                  </motion.span>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={toggleMuted}
                aria-pressed={muted}
                aria-label={muted ? t.avatar.unmute : t.avatar.mute}
                title={muted ? t.avatar.unmute : t.avatar.mute}
                className="pointer-events-auto absolute top-2 right-9 flex size-7 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [@media(hover:none)]:opacity-100"
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>

              <button
                type="button"
                onClick={hide}
                aria-label={t.avatar.hide}
                className="pointer-events-auto absolute top-2 right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [@media(hover:none)]:opacity-100"
              >
                <XIcon className="size-3.5" />
              </button>

              {/* While she narrates, soft sound waves ripple out from her mouth toward the bubble. */}
              <AnimatePresence>
                {bubble?.typed && !(chatOpen && standingAtCard) && (
                  <VoiceWaves key={`waves-${bubble.id}`} ms={narrationMs(bubble.text)} />
                )}
              </AnimatePresence>

              {/* The bubble's squared-off bottom-right corner sits just beside her mouth — about
                  18% down the dock, just left of her hijab — and it opens up and to the left. No
                  tail: the sound waves from her mouth carry the link. */}
              <div
                aria-live="polite"
                className={cn(
                  "absolute flex w-max justify-end",
                  bubbleAbove ? "right-0 bottom-[97%]" : "right-[58%] bottom-[82%]",
                )}
              >
                <AnimatePresence>
                  {bubble && !(chatOpen && standingAtCard) && (
                    <motion.div
                      key={bubble.id}
                      // `layout` lets the bubble ease taller as each new line is typed.
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.92, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -4, scale: 0.96, filter: "blur(4px)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      // Gradient hairline border: a 1px gradient frame around the glass body.
                      className="relative w-max origin-bottom-right rounded-[18px] rounded-br-[5px] bg-linear-to-br from-primary/60 via-primary/15 to-primary/45 p-px shadow-[0_10px_32px_-10px] shadow-primary/40"
                    >
                      <motion.div
                        layout="position"
                        style={{ maxWidth: bubbleMaxW }}
                        className={cn(
                          "relative z-10 rounded-[17px] rounded-br-[4px] bg-card/95 text-foreground backdrop-blur-xl",
                          bubble.typed
                            ? "flex items-start gap-2.5 px-3.5 py-2.5 text-[13px] leading-snug font-medium text-pretty"
                            : "px-3.5 py-1.5 text-xs font-medium text-pretty"
                        )}
                      >
                        {bubble.typed && <SpeakingWave ms={narrationMs(bubble.text)} />}
                        <p>
                          {bubble.typed ? <Typewriter text={bubble.text} delay={150} speed={22} grow /> : bubble.text}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
}

/** A small sound-wave that pulses while she's talking (about as long as the line takes to type). */
function SpeakingWave({ ms }: { ms: number }) {
  const reduce = useReducedMotion();
  const cycle = 0.7;
  const repeat = Math.max(0, Math.ceil(ms / 1000 / cycle) - 1);
  return (
    <span aria-hidden className="mt-[3px] flex h-3 shrink-0 items-center gap-[2px]">
      {[0.55, 1, 0.75].map((peak, i) => (
        <motion.span
          key={i}
          className="h-full w-[3px] origin-center rounded-full bg-primary"
          initial={{ scaleY: 0.35 }}
          animate={reduce ? { scaleY: peak } : { scaleY: [0.35, peak, 0.35] }}
          transition={reduce ? { duration: 0 } : { duration: cycle, repeat, delay: i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/**
 * Thin arcs rippling out from her mouth toward the bubble (up and to the left) while she talks —
 * the modern voice-assistant cue in place of a speech-bubble tail. Placed at her mouth in the
 * dock's own proportions, so it follows her size on every screen.
 */
function VoiceWaves({ ms }: { ms: number }) {
  const reduce = useReducedMotion();
  const cycle = 1.2;
  const repeat = Math.max(0, Math.ceil(ms / 1000 / cycle) - 1);
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute top-[17%] left-[47%] size-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          // A ring with only its upper-left quarter drawn: an arc facing the bubble.
          className="absolute top-0 left-0 size-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full border-l-[1.5px] border-primary"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={reduce ? { scale: 0.6 + i * 0.35, opacity: 0.5 } : { scale: [0.4, 1.6], opacity: [0, 0.85, 0] }}
          transition={
            reduce ? { duration: 0 } : { duration: cycle, repeat, delay: i * (cycle / 3), ease: "easeOut" }
          }
        />
      ))}
    </motion.span>
  );
}

/** A quick expanding ring where her fingertip touches the card. */
function TouchRipple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none fixed z-50 -mt-4 -ml-4 size-8 rounded-full border-2 border-primary shadow-[0_0_16px_2px] shadow-primary/60"
      style={{ left: x, top: y }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: 2.2, opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      onAnimationComplete={onDone}
    />
  );
}

/** A glowing dot that arcs from her hand to the card, with a short fading trail. */
/** A paper plane gliding in an arc from the send button into her hand, trailing a dashed path. */
function PaperPlane({
  from,
  to,
  onDone,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  onDone: () => void;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Loop up and over before diving into her hand.
  const lift = Math.min(220, Math.hypot(dx, dy) * 0.45 + 60);
  const xs = [0, dx * 0.35, dx * 0.75, dx];
  const ys = [0, dy * 0.35 - lift, dy * 0.75 - lift * 0.6, dy];
  const flight = { duration: 1.15, ease: [0.45, 0, 0.25, 1] as const, times: [0, 0.35, 0.75, 1] };
  const heading = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <div aria-hidden className="pointer-events-none fixed z-50" style={{ left: from.x, top: from.y }}>
      {[0.08, 0.16, 0.24].map((lag, i) => (
        <motion.span
          key={lag}
          className="absolute -top-0.5 -left-0.5 size-1 rounded-full bg-primary"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: xs, y: ys, opacity: [0, 0.7 - i * 0.2, 0.5 - i * 0.15, 0] }}
          transition={{ ...flight, delay: lag }}
        />
      ))}
      <motion.span
        className="absolute -top-3 -left-3 flex size-6 items-center justify-center text-primary drop-shadow-[0_0_8px_var(--primary)]"
        // The icon points up-right (-45°); turning it by heading + 45 points it along the flight.
        initial={{ x: 0, y: 0, scale: 0.6, rotate: 0 }}
        animate={{ x: xs, y: ys, scale: [0.6, 1.25, 1.1, 0.5], rotate: [0, -15, heading + 20, heading + 45] }}
        transition={flight}
        onAnimationComplete={onDone}
      >
        <Send className="size-5 fill-primary/20" />
      </motion.span>
    </div>
  );
}

function Spark({
  from,
  to,
  onDone,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  onDone: () => void;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Arc upward: the midpoint sits above the straight line between hand and card.
  const lift = Math.min(160, Math.hypot(dx, dy) * 0.35);
  const xs = [0, dx * 0.5, dx];
  const ys = [0, dy * 0.5 - lift, dy];
  const flight = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, times: [0, 0.5, 1] };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50"
      style={{ left: from.x, top: from.y }}
    >
      {[0.12, 0.06].map((lag, i) => (
        <motion.span
          key={lag}
          className="absolute -top-1 -left-1 size-2 rounded-full bg-primary/60 blur-[2px]"
          initial={{ x: 0, y: 0, opacity: 0.6 - i * 0.2 }}
          animate={{ x: xs, y: ys, opacity: 0 }}
          transition={{ ...flight, delay: lag }}
        />
      ))}
      <motion.span
        className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-primary shadow-[0_0_12px_4px] shadow-primary/70"
        initial={{ x: 0, y: 0, scale: 0.4 }}
        animate={{ x: xs, y: ys, scale: [0.4, 1.2, 0.9] }}
        transition={flight}
        onAnimationComplete={onDone}
      />
    </div>
  );
}
