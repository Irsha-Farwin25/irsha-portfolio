"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { useChat } from "@/components/assistant/use-chat";

type ChatMode = "idle" | "thinking" | "talking";

interface ChatContextValue {
  chat: ReturnType<typeof useChat>;
  /** True while the hero card is flipped over to show the chat. */
  open: boolean;
  /** Flips the card to the chat (it's on screen when the "Ask AI" button is used). */
  openChat: () => void;
  closeChat: () => void;
  /**
   * The avatar's click. The chat always lives on the hero card: flip it if it's on screen,
   * otherwise glide back to it (going to the home page first if needed) and flip it on arrival.
   */
  toggleFromAvatar: () => void;
  /** The hero card registers itself so the chat can flip onto it. */
  registerCard: (el: HTMLElement | null) => void;
  /** The avatar subscribes to thinking/talking so she can animate along. */
  setModeListener: (fn: ((mode: ChatMode) => void) | null) => void;
  /**
   * The avatar plays her hand swipe here before an avatar-started flip; the card turns once the
   * returned promise settles. Without one (no 3D avatar), the card flips straight away.
   */
  setFlipAnimator: (fn: ((card: HTMLElement) => Promise<void>) | null) => void;
  /**
   * Has the avatar say a line in her bubble (e.g. the certificate under the spotlight). A no-op
   * while she can't speak; `canNarrate` says whether she can, so callers can show the text instead.
   */
  narrate: (line: string) => void;
  canNarrate: boolean;
  /** The avatar registers how she speaks while she's on screen and not muted. */
  setNarrator: (fn: ((line: string) => void) | null) => void;
  /**
   * A message is on its way: the avatar rides over beside `card` and catches a paper plane
   * launched from `from` (screen coordinates). Resolves once it's caught; straight away when
   * she isn't on screen.
   */
  catchPlane: (from: { x: number; y: number }, card: HTMLElement) => Promise<void>;
  setPlaneCatcher: (fn: PlaneCatcher | null) => void;
}

type PlaneCatcher = (from: { x: number; y: number }, card: HTMLElement) => Promise<void>;

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside <ChatProvider>");
  return ctx;
}

/** A hero card at least this visible counts as "on screen". */
const CARD_VISIBLE_RATIO = 0.6;
/** If the scroll to the card never brings it fully into view, flip anyway after this long. */
const FLIP_FALLBACK_MS = 1600;

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [cardEl, setCardEl] = useState<HTMLElement | null>(null);
  const cardRatio = useRef(0);
  /** Set when the avatar asked for the chat but the card still has to come into view. */
  const pendingFlip = useRef(false);
  const fallbackTimer = useRef<number | undefined>(undefined);
  const opener = useRef<HTMLElement | null>(null);
  const modeListener = useRef<((mode: ChatMode) => void) | null>(null);
  const flipAnimator = useRef<((card: HTMLElement) => Promise<void>) | null>(null);
  const animating = useRef(false);

  const chat = useChat(
    useCallback((mode: ChatMode) => {
      modeListener.current?.(mode);
    }, [])
  );

  /** Flips the card; `viaAvatar` lets her swipe it over first (a short gesture + spark). */
  const flipNow = useCallback(
    (viaAvatar = false) => {
      pendingFlip.current = false;
      window.clearTimeout(fallbackTimer.current);
      const animate = viaAvatar ? flipAnimator.current : null;
      if (!animate || !cardEl) return setOpen(true);
      if (animating.current) return;
      animating.current = true;
      animate(cardEl)
        .catch(() => {})
        .finally(() => {
          animating.current = false;
          setOpen(true);
        });
    },
    [cardEl]
  );

  const scrollToCard = useCallback(
    (el: HTMLElement) => {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    },
    [reduce]
  );

  // Track how much of the hero card is on screen, and finish a pending flip once it arrives.
  useEffect(() => {
    if (!cardEl) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        cardRatio.current = entry.intersectionRatio;
        if (pendingFlip.current && entry.intersectionRatio >= CARD_VISIBLE_RATIO) flipNow(true);
      },
      { threshold: [0, 0.2, 0.4, CARD_VISIBLE_RATIO, 0.8, 1] }
    );
    io.observe(cardEl);

    // Arrived on the home page from another page to open the chat: bring the card into view.
    if (pendingFlip.current) {
      requestAnimationFrame(() => scrollToCard(cardEl));
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = window.setTimeout(() => flipNow(true), FLIP_FALLBACK_MS);
    }
    return () => io.disconnect();
  }, [cardEl, flipNow, scrollToCard]);

  useEffect(() => () => window.clearTimeout(fallbackTimer.current), []);

  const registerCard = useCallback((el: HTMLElement | null) => {
    setCardEl(el);
    if (!el) {
      cardRatio.current = 0;
      setOpen(false); // left the page the card lives on
    }
  }, []);

  const rememberOpener = () => {
    if (document.activeElement instanceof HTMLElement) opener.current = document.activeElement;
  };

  const openChat = useCallback(() => {
    rememberOpener();
    flipNow();
  }, [flipNow]);

  const closeChat = useCallback(() => {
    setOpen(false);
    const el = opener.current;
    opener.current = null;
    // Wait a frame so the flip back doesn't swallow the focus.
    requestAnimationFrame(() => el?.isConnected && el.focus({ preventScroll: true }));
  }, []);

  const toggleFromAvatar = useCallback(() => {
    const onScreen = !!cardEl && cardRatio.current >= CARD_VISIBLE_RATIO;
    if (open) {
      // Open but scrolled away: bring the visitor back to the conversation rather than closing it.
      if (onScreen) closeChat();
      else if (cardEl) scrollToCard(cardEl);
      return;
    }

    rememberOpener();
    if (cardEl && onScreen) return flipNow(true);

    pendingFlip.current = true;
    window.clearTimeout(fallbackTimer.current);
    if (cardEl) {
      scrollToCard(cardEl);
      fallbackTimer.current = window.setTimeout(() => flipNow(true), FLIP_FALLBACK_MS);
    } else {
      // The card lives on the home page; the flip finishes once it registers there.
      router.push("/");
    }
  }, [open, cardEl, closeChat, flipNow, router, scrollToCard]);

  const setModeListener = useCallback((fn: ((mode: ChatMode) => void) | null) => {
    modeListener.current = fn;
  }, []);

  const setFlipAnimator = useCallback((fn: ((card: HTMLElement) => Promise<void>) | null) => {
    flipAnimator.current = fn;
  }, []);

  // State rather than a ref: whether she can speak changes what the page renders.
  const [narrator, setNarratorFn] = useState<((line: string) => void) | null>(null);
  const setNarrator = useCallback((fn: ((line: string) => void) | null) => {
    setNarratorFn(() => fn);
  }, []);
  const narrate = useCallback((line: string) => narrator?.(line), [narrator]);

  const planeCatcher = useRef<PlaneCatcher | null>(null);
  const setPlaneCatcher = useCallback((fn: PlaneCatcher | null) => {
    planeCatcher.current = fn;
  }, []);
  const catchPlane = useCallback<PlaneCatcher>(
    (from, card) => planeCatcher.current?.(from, card).catch(() => {}) ?? Promise.resolve(),
    [],
  );

  const value = useMemo(
    () => ({
      chat,
      open,
      openChat,
      closeChat,
      toggleFromAvatar,
      registerCard,
      setModeListener,
      setFlipAnimator,
      narrate,
      canNarrate: !!narrator,
      setNarrator,
      catchPlane,
      setPlaneCatcher,
    }),
    [
      chat,
      open,
      openChat,
      closeChat,
      toggleFromAvatar,
      registerCard,
      setModeListener,
      setFlipAnimator,
      narrate,
      narrator,
      setNarrator,
      catchPlane,
      setPlaneCatcher,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
