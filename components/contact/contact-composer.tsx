"use client";

import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  FlaskConical,
  Hand,
  Loader2,
  Rocket,
  Send,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/brand-icons";
import { useChatContext } from "@/components/assistant/chat-context";
import { useContent, useLocale, useT } from "@/components/i18n/locale-provider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

/** What the visitor is reaching out about. Each fills in the sentence and starts the message. */
const INTENTS = [
  { key: "role", icon: Briefcase },
  { key: "project", icon: Rocket },
  { key: "research", icon: FlaskConical },
  { key: "hi", icon: Hand },
] as const;

type IntentKey = (typeof INTENTS)[number]["key"];
type Status = "idle" | "sending" | "sent" | "error";
type FieldError = keyof Dictionary["contact"]["errors"];

export function ContactComposer() {
  const reduce = useReducedMotion();
  const { narrate, toggleFromAvatar, catchPlane } = useChatContext();
  const t = useT();
  const rtl = useLocale() === "ar";
  const { site } = useContent();
  const first = site.firstName;
  const [intent, setIntent] = useState<IntentKey>("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>(t.contact.intents.role.starter);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = t.contact.intents[intent];
  const starters: string[] = INTENTS.map((i) => t.contact.intents[i.key].starter);
  // Only the visitor's own words count towards "done", not the starter we wrote for them.
  const ownWords = message.trim().length >= 10 && !starters.includes(message);
  const filled = [name.trim().length >= 2, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), ownWords];
  const progress = filled.filter(Boolean).length / filled.length;

  const pickIntent = (key: IntentKey) => {
    setIntent(key);
    // Swap the starter only while the visitor hasn't written their own message.
    if (!message.trim() || starters.includes(message)) {
      setMessage(t.contact.intents[key].starter);
    }
  };

  // The card's spotlight follows the cursor.
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // A complete message flies off as a paper plane, and the avatar catches it.
    const button = e.currentTarget.querySelector<HTMLElement>('button[type="submit"]');
    let caught: Promise<void> | null = null;
    if (progress === 1 && button && cardRef.current) {
      const b = button.getBoundingClientRect();
      // The plane icon sits at the button's end: its right side, or its left in Arabic.
      caught = catchPlane({ x: rtl ? b.left + 28 : b.right - 28, y: b.top + b.height / 2 }, cardRef.current);
    }
    setStatus("sending");
    setErrors({});
    setFormError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: t.contact.subject(current.label, name),
          message,
        }),
      });
      const data = await res.json();
      if (res.status === 422) {
        // Show the server's field errors in the visitor's language.
        const fields = (data.errors ?? {}) as Record<string, string>;
        setErrors(
          Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, k in t.contact.errors ? t.contact.errors[k as FieldError] : v]),
          ),
        );
        setStatus("error");
        if (caught) void caught.then(() => narrate(t.contact.avatar.fix));
        return;
      }
      if (!res.ok) {
        setFormError(rtl ? t.contact.errors.generic : (data.error ?? t.contact.errors.generic));
        setStatus("error");
        if (caught) void caught.then(() => narrate(t.contact.avatar.failed));
        return;
      }
      setStatus("sent");
      await caught;
      narrate(t.contact.avatar.caught(first));
    } catch {
      setFormError(t.contact.errors.network);
      setStatus("error");
    }
  }

  const reset = () => {
    setName("");
    setEmail("");
    setMessage(current.starter);
    setStatus("idle");
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={onPointerMove}
      className="contact-border group/card relative rounded-2xl p-px shadow-[0_30px_80px_-30px] shadow-primary/30"
    >
      <div className="relative overflow-hidden rounded-[15px] bg-card">
        {/* Cursor spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklch, var(--primary) 14%, transparent), transparent 65%)",
          }}
        />
        {/* Progress: fills as the message comes together */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-border/60">
          <motion.div
            className="h-full origin-left bg-linear-to-r from-primary/60 via-primary to-chart-2 rtl:origin-right rtl:bg-linear-to-l"
            animate={{ scaleX: status === "sent" ? 1 : Math.max(progress, 0.04) }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {status === "sent" ? (
            <Sent key="sent" reduce={!!reduce} onReset={reset} first={first} />
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              noValidate
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col gap-5 p-5 sm:p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {t.contact.newMessage}
                </p>
                <p className="font-mono text-xs text-muted-foreground tabular-nums">
                  {t.contact.ready(Math.round(progress * 100))}
                </p>
              </div>

              {/* 1 · What it's about */}
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-2.5 text-sm font-medium">{t.contact.whatBrings}</legend>
                <div className="flex flex-wrap gap-2">
                  {INTENTS.map(({ key, icon: Icon }) => {
                    const active = key === intent;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickIntent(key)}
                        className={cn(
                          "relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active
                            ? "border-transparent text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="contact-intent"
                            className="absolute inset-0 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          />
                        )}
                        <Icon className="relative size-3.5" aria-hidden />
                        <span className="relative">{t.contact.intents[key].label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 2 · The sentence */}
              <p className="text-base leading-[2.1] text-pretty text-muted-foreground sm:text-lg">
                {t.contact.sentence.hi(first)}{" "}
                <InlineField
                  id="contact-name"
                  label={t.contact.yourName}
                  placeholder={t.contact.namePlaceholder}
                  value={name}
                  onChange={setName}
                  error={errors.name}
                  autoComplete="name"
                />{" "}
                {t.contact.sentence.love}{" "}
                <span className="relative inline-block font-medium text-foreground">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current.phrase}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      transition={{ duration: 0.3 }}
                      className="inline-block"
                    >
                      {current.phrase}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {t.contact.sentence.reach}{" "}
                <InlineField
                  id="contact-email"
                  label={t.contact.yourEmail}
                  placeholder={t.contact.emailPlaceholder}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  autoComplete="email"
                />
                {t.contact.sentence.end}
              </p>

              {/* 3 · The details */}
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="text-sm font-medium">
                  {t.contact.more}
                </label>
                <textarea
                  id="contact-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm leading-relaxed transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-[0_0_0_4px] focus:shadow-primary/15 aria-invalid:border-destructive"
                />
                {errors.message && (
                  <p id="contact-message-error" className="text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    <TriangleAlert className="size-4 shrink-0" /> {formError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <SendButton sending={status === "sending"} ready={progress === 1} reduce={!!reduce} rtl={rtl} />
                <button
                  type="button"
                  onClick={toggleFromAvatar}
                  className="group/ask inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  {t.contact.askGuide}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover/ask:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/ask:-translate-x-0.5"
                    aria-hidden
                  />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A blank in the sentence: an input that grows with what's typed, underlined like a form field. */
function InlineField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <span className="relative inline-flex flex-col align-baseline">
      <input
        id={id}
        type={type}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Emails stay left to right inside an Arabic sentence.
        dir={type === "email" ? "ltr" : undefined}
        style={{ width: `${Math.max(placeholder.length, value.length) + 1}ch` }}
        className="peer max-w-full bg-transparent px-0.5 font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
      />
      {/* Underline: dim at rest, a primary sweep on focus, red on error. */}
      <span
        aria-hidden
        className={cn("absolute inset-x-0 bottom-1 h-px", error ? "bg-destructive" : "bg-border")}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 peer-focus:scale-x-100 rtl:origin-right"
      />
      {error && (
        <span id={`${id}-error`} className="absolute top-full left-0 text-xs leading-none whitespace-nowrap text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}

/** Send: a shimmer while the message isn't ready, and the plane flies off while it sends. */
function SendButton({ sending, ready, reduce, rtl }: { sending: boolean; ready: boolean; reduce: boolean; rtl: boolean }) {
  const t = useT();
  return (
    <motion.button
      type="submit"
      disabled={sending}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={cn(
        "relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait",
        ready && !sending && "shadow-primary/50",
      )}
    >
      {/* A sheen sweeps across once the message is ready to go. */}
      {ready && !sending && !reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/35 to-transparent"
          animate={{ x: ["0%", "400%"] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
        />
      )}
      <AnimatePresence mode="wait" initial={false}>
        {sending ? (
          <motion.span
            key="sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative inline-flex items-center gap-2"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden /> {t.contact.sending}
          </motion.span>
        ) : (
          <motion.span
            key="send"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: rtl ? -40 : 40, y: -24, rotate: rtl ? 20 : -20, transition: { duration: 0.35 } }}
            className="relative inline-flex items-center gap-2"
          >
            {t.contact.send} <Send className="size-4 rtl:-scale-x-100" aria-hidden />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/** After sending: a check draws itself, sparks burst out, then next steps. */
function Sent({ reduce, onReset, first }: { reduce: boolean; onReset: () => void; first: string }) {
  const t = useT();
  const linkedin = useContent().socialLinks.find((l) => l.icon === "linkedin");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[380px] flex-col items-center justify-center gap-5 p-8 text-center"
      role="status"
    >
      <div className="relative">
        {!reduce &&
          Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                aria-hidden
                className="absolute top-1/2 left-1/2 size-1.5 rounded-full bg-primary"
                initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
                animate={{
                  x: `calc(-50% + ${Math.cos(angle) * 64}px)`,
                  y: `calc(-50% + ${Math.sin(angle) * 64}px)`,
                  opacity: 0,
                  scale: 0.4,
                }}
                transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
              />
            );
          })}
        <svg viewBox="0 0 64 64" className="size-16 text-primary" aria-hidden>
          <motion.circle
            cx="32"
            cy="32"
            r="29"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.path
            d="M20 33 l8 8 l16 -18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.4, ease: "easeOut" }}
          />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xl font-semibold tracking-tight">{t.contact.delivered}</p>
        <p className="max-w-xs text-sm text-pretty text-muted-foreground">
          {t.contact.deliveredBody(first)}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {linkedin && (
          <a
            href={linkedin.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary/60 hover:text-primary"
          >
            <LinkedinIcon className="size-4" /> {t.contact.linkedIn}
          </a>
        )}
        <button
          type="button"
          onClick={onReset}
          className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.contact.another}
        </button>
      </div>
    </motion.div>
  );
}
