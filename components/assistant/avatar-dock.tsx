"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Sparkles, Volume2, VolumeX, XIcon } from "lucide-react";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { useChatContext } from "@/components/assistant/chat-context";
import { Typewriter } from "@/components/assistant/chat-view";
import { SECTION_LINES } from "@/lib/chat/narration";
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

function Dock({ reduceMotion }: { reduceMotion: boolean }) {
  const [supported] = useState(() => !reduceMotion && canRender3D());
  const [hidden, setHidden] = useState(readHidden);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  /** What she's saying above her head: short greetings, or a section's narration (typed out). */
  const [bubble, setBubble] = useState<{ text: string; typed: boolean; id: number } | null>(null);
  const [muted, setMuted] = useState(readMuted);

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
  /** Sections she has introduced since this page loaded (scrolling back won't repeat them). */
  const narrated = useRef(new Set<string>());
  const cardRef = useRef<HTMLElement | null>(null);
  const [spark, setSpark] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    done: () => void;
  } | null>(null);

  const { open: chatOpen, toggleFromAvatar, setModeListener, setFlipAnimator } = useChatContext();

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
    const typing = 150 + line.length * 24 + (line.match(/[.,!?]/g)?.length ?? 0) * 130;
    setBubble({ text: line, typed: true, id: now });
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
    const sections = Object.keys(SECTION_LINES)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const ratios = new Map<string, number>();
    let settle: number | undefined;

    const onSettled = () => {
      if (chatOpenRef.current && atCard.current) return;
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
      narrate(SECTION_LINES[best]);
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
  }, [ready, hidden, muted, narrate]);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  useEffect(
    () => () => {
      window.clearTimeout(bubbleTimer.current);
      window.clearTimeout(talkTimer.current);
    },
    [],
  );

  const toggleMuted = () => {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTED_KEY, next ? "1" : "0");
    } catch {}
    if (next) {
      setBubble(null);
      if (!chatOpenRef.current) signals.current.mode = "idle";
    }
  };


  const onReady = useCallback(() => {
    setReady(true);
    window.setTimeout(() => wave("Hi! Ask me about Irsha 👋"), 500);
  }, [wave]);

  const hide = () => {
    setHidden(true);
    setBubble(null);
    writeHidden(true);
  };
  const show = () => {
    setHidden(false);
    writeHidden(false);
    if (ready) window.setTimeout(() => wave("Welcome back! 👋"), 300);
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
    if (!chatOpen) setBubble(null);
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
        Ask about Irsha
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
            aria-label="Show Irsha's avatar"
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
                aria-label="Chat with Irsha's AI assistant"
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

              <button
                type="button"
                onClick={toggleMuted}
                aria-pressed={muted}
                aria-label={muted ? "Turn guide narration on" : "Mute guide narration"}
                title={muted ? "Turn guide narration on" : "Mute guide narration"}
                className="pointer-events-auto absolute top-2 right-9 flex size-7 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [@media(hover:none)]:opacity-100"
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>

              <button
                type="button"
                onClick={hide}
                aria-label="Hide avatar"
                className="pointer-events-auto absolute top-2 right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [@media(hover:none)]:opacity-100"
              >
                <XIcon className="size-3.5" />
              </button>

              {/* Above her head and anchored to her right edge, so it never covers the hero card
                  beside her or runs off screen; the tail points at her head. */}
              <div aria-live="polite" className="absolute right-0 bottom-full mb-1.5">
                <AnimatePresence>
                  {bubble && !(chatOpen && standingAtCard) && (
                    <motion.p
                      key={bubble.id}
                      initial={{ opacity: 0, y: 6, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 26,
                      }}
                      className={
                        bubble.typed
                          ? "relative w-max max-w-[min(260px,calc(100vw-24px))] origin-bottom-right rounded-2xl border border-border bg-card px-3.5 py-2 text-[13px] leading-snug font-medium text-pretty text-foreground shadow-lg"
                          : "relative w-max origin-bottom-right rounded-2xl border border-border bg-card px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground shadow-lg"
                      }
                    >
                      {bubble.typed ? <Typewriter text={bubble.text} delay={150} speed={22} /> : bubble.text}
                      <span
                        aria-hidden
                        className="absolute right-[54px] -bottom-1.5 size-3 rotate-45 border-r border-b border-border bg-card sm:right-[96px]"
                      />
                    </motion.p>
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
