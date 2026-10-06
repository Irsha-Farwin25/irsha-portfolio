"use client";

import { useEffect, useRef, useState, type ComponentType, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { Check, Copy, FileDown, Mail, Zap } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { useContent, useT } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** The headline's last word, swapping every few seconds. */
export function RotatingWord({ words }: { words: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => window.clearInterval(id);
  }, [reduce, words.length]);

  return (
    <span className="relative inline-grid align-bottom">
      {/* The longest word reserves the space, so the line never jumps. */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {words.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ opacity: 0, y: "60%", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
          exit={{ opacity: 0, y: "-60%", filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="col-start-1 row-start-1 bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const TIME_ZONE = "Asia/Colombo";

function partOfDay(hour: number) {
  if (hour < 5) return { key: "lateNight", icon: "🌙" } as const;
  if (hour < 12) return { key: "morning", icon: "☀️" } as const;
  if (hour < 17) return { key: "afternoon", icon: "🌤️" } as const;
  if (hour < 21) return { key: "evening", icon: "🌇" } as const;
  return { key: "night", icon: "🌙" } as const;
}

/**
 * Her status and a live clock in her time zone, so visitors know when she'll see the message.
 * `tag` is a compact glowing pill, for pinning beside Colombo on the contact map; `align`
 * "end" puts its green dot at the right, for when it sits to Colombo's left.
 */
export function LiveStatus({
  variant = "line",
  align = "start",
}: {
  variant?: "line" | "tag";
  align?: "start" | "end";
}) {
  const t = useT();
  const { site } = useContent();
  const mounted = useHasMounted();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(now),
  );
  const day = partOfDay(hour);

  if (variant === "tag") {
    // One glowing pill: "● Open to work · 10:43 ☀️". Right-aligned ("end"), the green dot moves to
    // the far end, next to Colombo (in Arabic the start is already the right, so nothing moves).
    const end = align === "end";
    const short = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" }).format(now);
    return (
      <div
        title={`${site.statusPill} · ${t.contact.localTimeIn(site.location, t.contact.dayParts[day.key])}`}
        className="flex w-max items-center gap-2 rounded-full border border-emerald-500/30 bg-card/85 py-1.5 ps-2.5 pe-3 text-xs font-medium shadow-[0_0_18px_-2px] shadow-emerald-500/35 backdrop-blur-md"
      >
        <span className={cn("relative flex size-2", end && "order-last rtl:order-none")}>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span>{t.contact.openShort}</span>
        {mounted && (
          <>
            <span aria-hidden className="text-muted-foreground/60">·</span>
            <span dir="ltr" className="font-mono text-muted-foreground tabular-nums">
              {short}
            </span>
            <span aria-hidden>{day.icon}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <span className="flex items-center gap-2 font-medium">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        {site.statusPill}
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {mounted ? (
          <>
            <span aria-hidden>{day.icon}</span>
            <span className="font-mono text-foreground tabular-nums">{time}</span>
            <span>
              {t.contact.localTimeIn(site.location, t.contact.dayParts[day.key])}
            </span>
          </>
        ) : (
          <span className="font-mono">--:--:--</span>
        )}
      </span>
    </div>
  );
}

/** Her email as a big pill: one click copies it, and the icon morphs into a check. */
export function CopyEmail() {
  const t = useT();
  const { site } = useContent();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t.contact.emailCopiedAria : t.contact.copyEmailAria(site.email)}
      className="group/copy relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-card/60 p-1.5 pr-3.5 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Mail className="size-4" aria-hidden />
      </span>
      <span dir="ltr" className="min-w-0 flex-1 truncate text-start font-mono text-sm">{site.email}</span>
      <span className="relative flex h-7 min-w-20 items-center justify-end text-xs font-medium">
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="inline-flex items-center gap-1 text-emerald-500"
            >
              <Check className="size-4" aria-hidden /> {t.contact.copied}
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="inline-flex items-center gap-1 text-muted-foreground group-hover/copy:text-foreground"
            >
              <Copy className="size-3.5" aria-hidden /> {t.contact.copy}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}

const SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

/** GitHub and LinkedIn as round buttons that lean towards the cursor. */
export function MagneticSocials() {
  const { socialLinks } = useContent();
  return (
    <div className="flex gap-2">
      {socialLinks
        .filter((l) => l.icon in SOCIAL_ICONS)
        .map((l) => (
          <Magnetic key={l.label} href={l.href} label={l.label} Icon={SOCIAL_ICONS[l.icon]} />
        ))}
    </div>
  );
}

function Magnetic({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.35);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Icon className="size-4" />
    </motion.a>
  );
}

/**
 * For busy recruiters: the three things they need, one click each. The CV button only appears
 * once a resume PDF is in /public, so visitors never see a placeholder. `bare` drops its own frame
 * and shows the whole bio, for when it sits inside another card (the message card's second side).
 */
export function RecruiterPack({ hasResume, bare = false }: { hasResume: boolean; bare?: boolean }) {
  const t = useT();
  const { site } = useContent();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyBio = async () => {
    try {
      await navigator.clipboard.writeText(site.recruiterBio);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className={cn("flex flex-col gap-3", !bare && "rounded-xl border border-border bg-card/60 p-4 backdrop-blur")}>
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Zap className="size-3.5" aria-hidden />
        </span>
        <span className="text-sm font-medium">{t.contact.recruiterPack}</span>
        <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">{t.contact.oneClick}</span>
      </div>

      <p
        className={cn(
          "border-s-2 border-primary/40 ps-3 leading-relaxed text-pretty text-muted-foreground",
          bare ? "text-sm" : "line-clamp-2 text-xs"
        )}
      >
        {site.recruiterBio}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {hasResume && (
          <motion.a
            href={site.resumeUrl}
            download
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <FileDown className="size-4" aria-hidden /> {t.contact.downloadCv}
          </motion.a>
        )}
        <motion.button
          type="button"
          onClick={copyBio}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          aria-label={copied ? t.contact.bioCopied : t.contact.copyBioAria}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2 text-emerald-500"
              >
                <Check className="size-4" aria-hidden /> {t.contact.bioCopied}
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <Copy className="size-4" aria-hidden /> {t.contact.copyBio}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        {/* On phones these would wrap onto a row of their own; the hero and footer have them. */}
        <div className={cn("ms-auto", !bare && "hidden sm:block")}>
          <MagneticSocials />
        </div>
      </div>
    </div>
  );
}
