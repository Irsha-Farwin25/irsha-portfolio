"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Newspaper, Sparkles, XIcon } from "lucide-react";
import { useContent, useT } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";
import { outletLogos } from "@/data/achievements";
import type { NewsItem, NewsStory } from "@/lib/types";

/** Editorial serif for the masthead and headlines (Arabic falls back to the site's Arabic face). */
const serif = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });

const EASE = [0.22, 1, 0.36, 1] as const;

const grid: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

/** Her part in each story has its own colour: led (accent), team (second accent), author (green). */
const ROLE_TONES: Record<NewsStory["kind"], string> = {
  lead: "border-primary/35 bg-primary/10 text-primary",
  team: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  author: "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

/** The newsroom red, for kickers, the ticker label, and headline underlines. */
const RED = "text-[#e5484d]";

/** Avatar colours for outlets, cycled in order. */
const OUTLET_TONES = [
  "from-primary/45 to-primary/15 text-primary",
  "from-chart-2/45 to-chart-2/15 text-chart-2",
  "from-chart-4/45 to-chart-4/15 text-chart-4",
  "from-emerald-500/40 to-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "from-chart-3/45 to-chart-3/15 text-chart-3",
];

/** "News 1st" → "N1", "Daily Mirror" → "DM", "Newswire" → "NE", "ICODE 2026 Proceedings" → "IC". */
const outletInitials = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0] ?? "";
  // An acronym (ICODE) or a single word keeps its own first two letters.
  if (words.length === 1 || /^[A-Z]{2,}$/.test(first)) return first.slice(0, 2).toUpperCase();
  return (first[0] + words[1][0]).toUpperCase();
};

/** "Newswire & News 1st", "Daily Mirror, The Morning & Hiru News". */
function joinOutlets(names: string[], and: string) {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}`;
}

/** The stories in display order, each with its clippings. */
function useStories() {
  const { news, newsStories } = useContent();
  return newsStories
    .map((story) => ({ story, items: news.filter((n) => n.story === story.id) }))
    .filter((s) => s.items.length > 0);
}

type Story = ReturnType<typeof useStories>[number];

/**
 * Press coverage as a modern newsroom front page: a breaking-news ticker of the real headlines, a
 * masthead, then the lead story large beside a column of the others, each with a red kicker, a
 * serif headline, its impact as the standfirst, and a byline of the outlets that covered it.
 * A story opens its coverage, one tab per outlet.
 */
export function PressCoverage() {
  const t = useT();
  const { news } = useContent();
  const stories = useStories();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (stories.length === 0) return null;
  const outlets = new Set(news.map((n) => n.source)).size;
  const years = news.map((n) => n.date?.match(/\d{4}/)?.[0]).filter(Boolean) as string[];
  const span = years.length ? [...new Set([Math.min(...years.map(Number)), Math.max(...years.map(Number))])].join("–") : "";
  const [lead, ...rest] = stories;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>("[data-tile]")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Ticker items={news} />

      {/* Masthead: the paper's name between rules, with the dateline. */}
      <div className="flex flex-col items-center gap-1.5 border-y-[3px] border-double border-border py-3 text-center">
        <h3 className={cn(serif.className, "text-3xl font-extrabold tracking-tight sm:text-4xl")}>{t.achievements.pressRoom}</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {t.achievements.dateline(news.length, outlets, span)}
        </p>
      </div>

      <motion.div
        variants={grid}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        onPointerMove={onMove}
        className="project-grid grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-0"
      >
        <motion.div variants={rise} className="min-w-0 lg:pe-6">
          <LeadStory data={lead} onOpen={() => openAt(0)} />
        </motion.div>

        {/* The other stories, in a column ruled off from the lead like a newspaper's. */}
        <div className="flex min-w-0 flex-col gap-6 lg:border-s lg:border-border lg:ps-6">
          {rest.map((s, i) => (
            <motion.div
              key={s.story.id}
              variants={rise}
              className={cn("min-w-0", i > 0 && "border-t border-border pt-6")}
            >
              <SideStory data={s} onOpen={() => openAt(i + 1)} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <CoverageDialog stories={stories} index={index} open={open} onOpenChange={setOpen} onIndexChange={setIndex} />
    </div>
  );
}

/** A breaking-news ticker: a red "In the news ●" label, then every real headline scrolling past. */
function Ticker({ items }: { items: NewsItem[] }) {
  const t = useT();
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-2 whitespace-nowrap">
          <OutletLogo source={it.source} size={16} />
          <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-foreground uppercase">{it.source}</span>
          <span className="text-sm text-muted-foreground">{it.title}</span>
          <span aria-hidden className={cn("mx-6 text-[10px]", RED)}>
            ◆
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-border bg-card">
      <span className="relative z-10 flex shrink-0 items-center gap-2 bg-[#e5484d] px-3 py-2 font-mono text-[10px] font-bold tracking-[0.18em] text-white uppercase sm:px-4">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        {t.achievements.inTheNews}
      </span>
      {/* The headlines always run left to right; each keeps its own direction. */}
      <div dir="ltr" className="marquee marquee-row min-w-0 flex-1 overflow-hidden py-2">
        <div className="marquee-track flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

/** A clipping image filling its box, or a quiet placeholder when there's none. */
function ClippingImage({ item, sizes, className }: { item?: NewsItem; sizes: string; className?: string }) {
  const t = useT();
  if (!item?.image) {
    return (
      <span className="flex size-full items-center justify-center bg-secondary">
        <Newspaper className="size-8 text-muted-foreground/40" strokeWidth={1.25} />
      </span>
    );
  }
  return (
    <Image src={item.image} alt={t.achievements.clipping(item.source)} fill sizes={sizes} className={cn("object-cover object-top", className)} />
  );
}

/** An outlet's icon, small and square-cornered, when there is one. */
function OutletLogo({ source, size }: { source: string; size: number }) {
  const logo = outletLogos[source];
  if (!logo) return null;
  return (
    <span className="relative shrink-0 overflow-hidden rounded-[4px] bg-white" style={{ width: size, height: size }}>
      <Image src={logo} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}

/** Overlapping marks for each outlet that covered the story: its icon, else its initials. */
function OutletAvatars({ items }: { items: NewsItem[] }) {
  return (
    <span className="flex items-center -space-x-2 rtl:space-x-reverse">
      {items.map((it, i) => {
        const logo = outletLogos[it.source];
        return (
          <span
            key={it.id}
            title={it.source}
            dir="ltr"
            className={cn(
              "relative flex size-7 items-center justify-center overflow-hidden rounded-full border-2 border-card font-mono text-[9px] font-bold",
              logo ? "bg-white" : cn("bg-linear-to-br", OUTLET_TONES[i % OUTLET_TONES.length])
            )}
          >
            {logo ? <Image src={logo} alt={it.source} fill sizes="28px" className="object-cover" /> : outletInitials(it.source)}
          </span>
        );
      })}
    </span>
  );
}

/** "GOVTECH · LED END-TO-END": the section in newsroom red, then her role in its own colour. */
function Kicker({ story }: { story: NewsStory }) {
  return (
    <span className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
      <span className={cn("flex items-center gap-2", RED)}>
        <span aria-hidden className="h-[2px] w-4 bg-current" />
        {story.section}
      </span>
      <span className={cn("rounded-full border px-2 py-0.5 font-medium tracking-wider", ROLE_TONES[story.kind])}>{story.role}</span>
    </span>
  );
}

/** A headline whose red underline draws in under the text on hover, as on news sites. */
function Headline({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(serif.className, "text-balance font-bold tracking-tight", className)}>
      <span className="bg-[linear-gradient(#e5484d,#e5484d)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_2px] rtl:bg-[position:100%_100%]">
        {children}
      </span>
    </span>
  );
}

/** "Covered by Newswire & News 1st · Mar 2026", with the outlets' avatars. */
function Byline({ data }: { data: Story }) {
  const t = useT();
  const names = data.items.map((i) => i.source);
  return (
    <span className="flex items-center gap-3">
      <OutletAvatars items={data.items} />
      <span className="min-w-0 text-xs text-muted-foreground">
        {t.achievements.coveredBy(joinOutlets(names, t.achievements.and))}
        <span className="text-muted-foreground/60"> · {data.story.date}</span>
      </span>
    </span>
  );
}

/** The lead story: a big image, then kicker, headline, standfirst and byline. */
function LeadStory({ data, onOpen }: { data: Story; onOpen: () => void }) {
  const t = useT();
  const { story, items } = data;
  return (
    <button
      type="button"
      data-tile
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={t.achievements.coverageOf(story.title)}
      className="project-tile group relative flex w-full flex-col gap-4 rounded-2xl p-2 text-start transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="relative block aspect-[16/9] overflow-hidden rounded-xl border border-border bg-secondary">
        <ClippingImage
          item={items[0]}
          sizes="(min-width: 1024px) 640px, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        {/* The other outlets' clippings, as small thumbnails stacked in the corner. */}
        {items.length > 1 && (
          <span className="absolute end-3 bottom-3 flex -space-x-6 rtl:space-x-reverse">
            {items.slice(1, 3).map((it, i) => (
              <span
                key={it.id}
                className="relative block aspect-[4/3] w-20 overflow-hidden rounded-md border-2 border-card shadow-lg transition-transform duration-300 group-hover:-translate-y-1"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <ClippingImage item={it} sizes="80px" />
              </span>
            ))}
          </span>
        )}
      </span>

      <span className="flex flex-col gap-3 px-1">
        <Kicker story={story} />
        <Headline className="text-2xl leading-tight sm:text-[2rem]">{story.title}</Headline>
        <span className={cn(serif.className, "text-pretty text-base leading-relaxed text-foreground/75 italic sm:text-lg")}>
          {story.impact}
        </span>
        <span className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <Byline data={data} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            {t.achievements.readCoverage}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
          </span>
        </span>
      </span>
    </button>
  );
}

/** A secondary story: thumbnail beside kicker, headline, standfirst and byline. */
function SideStory({ data, onOpen }: { data: Story; onOpen: () => void }) {
  const t = useT();
  const { story, items } = data;
  return (
    <button
      type="button"
      data-tile
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={t.achievements.coverageOf(story.title)}
      className="project-tile group relative flex w-full flex-col gap-3 rounded-2xl p-2 text-start focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:gap-4"
    >
      <span className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-border bg-secondary sm:aspect-[4/3] sm:w-36">
        <ClippingImage
          item={items[0]}
          sizes="(min-width: 640px) 144px, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <Kicker story={story} />
        <Headline className="text-lg leading-snug">{story.title}</Headline>
        <span className={cn(serif.className, "text-pretty text-sm leading-relaxed text-foreground/70 italic")}>{story.impact}</span>
        <span className="mt-1">
          <Byline data={data} />
        </span>
      </span>
    </button>
  );
}

const navButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * A story's coverage, styled like the project dialog: one tab per outlet with its clipping in full
 * colour, headline, summary, and links. The arrows step between stories; arrow keys between outlets.
 */
function CoverageDialog({
  stories,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  stories: Story[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState(0);
  const { story, items } = stories[index];
  const item = items[Math.min(tab, items.length - 1)];
  const count = stories.length;

  const goStory = (dir: number) => {
    setTab(0);
    onIndexChange((index + dir + count) % count);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("a")) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    if (step && items.length > 1) setTab((i) => (i + step + items.length) % items.length);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setTab(0);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <Dialog.Popup
            onKeyDown={onKeyDown}
            className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-[0_40px_120px_-30px] shadow-primary/40 transition duration-300 ease-out outline-none data-ending-style:translate-y-8 data-ending-style:opacity-0 data-starting-style:translate-y-8 data-starting-style:opacity-0 sm:rounded-2xl sm:data-ending-style:translate-y-0 sm:data-ending-style:scale-95 sm:data-starting-style:translate-y-0 sm:data-starting-style:scale-95"
          >
            <div aria-hidden className="pointer-events-none absolute -top-24 start-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl rtl:translate-x-1/2" />

            {/* Header: the story, her role, and stepping between stories. */}
            <div className="relative flex items-start gap-3 border-b border-border px-4 py-3 sm:px-5">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", ROLE_TONES[story.kind])}>
                    {story.role}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {story.date} · {t.achievements.outlets(items.length)}
                  </span>
                </div>
                <Dialog.Title className="truncate text-base font-semibold">{story.title}</Dialog.Title>
              </div>
              <div className="flex items-center gap-2">
                {count > 1 && (
                  <>
                    <button type="button" aria-label={t.common.previous} onClick={() => goStory(-1)} className={navButtonClass}>
                      <ChevronLeft className="size-4 rtl:-scale-x-100" />
                    </button>
                    <button type="button" aria-label={t.common.next} onClick={() => goStory(1)} className={navButtonClass}>
                      <ChevronRight className="size-4 rtl:-scale-x-100" />
                    </button>
                  </>
                )}
                <Dialog.Close aria-label={t.common.close} className={navButtonClass}>
                  <XIcon className="size-4" />
                </Dialog.Close>
              </div>
            </div>

            {/* One tab per outlet that covered it. */}
            {items.length > 1 && (
              <div role="tablist" className="relative flex gap-1 overflow-x-auto border-b border-border px-3 py-2 [scrollbar-width:none] sm:px-4">
                {items.map((it, i) => {
                  const selected = it === item;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setTab(i)}
                      className={cn(
                        "relative shrink-0 rounded-lg px-3 py-1.5 font-serif text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId="press-tab"
                          className="absolute inset-0 rounded-lg border border-primary/40 bg-primary/10"
                          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative flex items-center gap-2">
                        <OutletLogo source={it.source} size={16} />
                        {it.source}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }}
                exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.12 } }}
                className="relative grid min-h-0 flex-1 gap-5 overflow-y-auto p-4 sm:p-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
              >
                {/* The clipping, in full colour, opening the article. */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/clip relative block aspect-[16/11] overflow-hidden rounded-xl border border-border bg-secondary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={t.achievements.clipping(item.source)}
                      fill
                      sizes="(min-width: 768px) 520px, 100vw"
                      className="object-cover object-top transition-transform duration-500 group-hover/clip:scale-[1.03]"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center">
                      <Newspaper className="size-10 text-muted-foreground/40" strokeWidth={1.25} />
                    </span>
                  )}
                </a>

                <div className="flex min-w-0 flex-col gap-3">
                  <p className="font-serif text-xs font-bold tracking-tight text-muted-foreground">
                    {item.source} · {item.date}
                  </p>
                  <Dialog.Description render={<h4 />} className="text-pretty text-lg leading-snug font-semibold">
                    {item.title}
                  </Dialog.Description>
                  {item.summary && <p className="text-pretty text-sm leading-relaxed text-foreground/80">{item.summary}</p>}
                  <p className="flex gap-2 rounded-lg border border-border bg-background/50 p-3 text-sm leading-relaxed">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {story.impact}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {item.linkLabel ?? t.achievements.readOn(item.source)}
                        <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
                      </a>
                    )}
                    {item.extraLinks?.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {l.label}
                        <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
