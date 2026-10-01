"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Playfair_Display, UnifrakturMaguntia } from "next/font/google";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, ExternalLink, MoveHorizontal, Newspaper } from "lucide-react";
import { ImageLightbox } from "@/components/projects/image-lightbox";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";

/** Newspaper type: a heavy serif for headlines, blackletter for the nameplate. */
const headlineFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  // Also exposed as a variable so drop caps (::first-letter) can use it.
  variable: "--font-news-headline",
});
/** Drop cap in the headline face, three lines deep. */
const DROP_CAP =
  "first-letter:float-left first-letter:mt-0.5 first-letter:mr-1.5 first-letter:[font-family:var(--font-news-headline)] first-letter:font-black first-letter:text-[#1c1a17]";
const nameplateFont = UnifrakturMaguntia({ subsets: ["latin"], weight: "400", display: "swap" });

/** Warm, slightly yellowed newsprint rather than screen white. */
const NEWSPRINT = "bg-[#f1ebdd]";
/** Ink colours: near-black body ink and the classic red section label. */
const INK = "text-[#1c1a17]";

/**
 * Newsprint texture: fine fibre noise, plus a soft yellowing toward the page edges. The two
 * layers sit over the page background beneath the content.
 */
function PaperTexture() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .22 0 0 0 .35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(140,110,60,0.18)_100%)]"
      />
    </>
  );
}

/** Shading where the page curves into the spine of the open paper. */
function Gutter({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 w-12 from-black/18 via-black/5 to-transparent",
        side === "right" ? "right-0 bg-linear-to-l" : "left-0 bg-linear-to-r"
      )}
    />
  );
}

/** The photo as printed: slightly desaturated with a halftone dot screen; full colour on hover. */
function PrintedPhoto({ children }: { children: React.ReactNode }) {
  return (
    <div className="group/photo relative h-full w-full">
      <div className="h-full w-full [filter:grayscale(0.45)_sepia(0.2)_contrast(1.08)] transition-[filter] duration-500 group-hover/photo:[filter:none]">
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply transition-opacity duration-500 group-hover/photo:opacity-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.5) 0.7px, transparent 0.9px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}

/** The outlet's name set as a newspaper nameplate, with a date line and a double rule. */
function Nameplate({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
  return (
    <div className="shrink-0 text-center">
      <p
        className={cn(
          nameplateFont.className,
          "leading-none text-balance",
          INK,
          compact ? "text-[1.6rem]" : "text-[2.1rem]"
        )}
      >
        {item.source}
      </p>
      <div className="mt-2 flex items-center justify-between border-y border-[#1c1a17]/70 py-0.5 font-serif text-[8px] uppercase tracking-[0.18em] text-[#1c1a17]/70">
        <span>{item.date ?? "Press"}</span>
        <span>In the news</span>
      </div>
      <div className="mt-[2px] border-t-2 border-[#1c1a17]" />
    </div>
  );
}

interface PageFlipController {
  flipNext: () => void;
  flipPrev: () => void;
  /** Turns (animated) to the given page index. */
  flip: (page: number) => void;
  getCurrentPageIndex: () => number;
  getPageCount: () => number;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function ClippingLinks({ item }: { item: NewsItem }) {
  if (!item.link && !item.extraLinks?.length) return null;
  // "Continued" lines in newspaper style: small caps in ink, with the red rule on hover.
  const linkClass =
    "group/link inline-flex w-fit items-center gap-1.5 font-serif text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c1a17] transition-colors hover:text-[#9b1c1c]";
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <span className="border-b border-[#1c1a17]/40 pb-0.5 transition-colors group-hover/link:border-[#9b1c1c]">
            {item.linkLabel ?? "Read the full story"}
          </span>
          <ExternalLink className="size-3 shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      )}
      {item.extraLinks?.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <span className="border-b border-[#1c1a17]/40 pb-0.5 transition-colors group-hover/link:border-[#9b1c1c]">{l.label}</span>
          <ExternalLink className="size-3 shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      ))}
    </div>
  );
}

/**
 * Desktop left page: the featured image, captioned like a press photo.
 *
 * react-pageflip needs a ref to each page's root node, and it overwrites that
 * node's inline `style.cssText` wholesale (position/display/width/height) to
 * position it inside the book — which silently kills any Tailwind `flex`/`h-full`
 * classes on that same element (inline `display: block` beats the `flex` class).
 * So the ref'd div stays a plain anchor, and all real layout — including the
 * `fill` images, which need a definitively-sized ancestor — lives on an inner
 * `absolute inset-0` wrapper that isn't touched by the library.
 */
const ImagePage = forwardRef<HTMLDivElement, { item: NewsItem }>(function ImagePage({ item }, ref) {
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className={cn("absolute inset-0 flex h-full w-full flex-col gap-3 overflow-hidden p-5", NEWSPRINT)}>
        <PaperTexture />
        <Gutter side="right" />
        <div className="relative flex min-h-0 flex-1 flex-col gap-3">
          <Nameplate item={item} />
          <figure className="flex min-h-0 flex-1 flex-col gap-1.5">
            <div className="relative min-h-0 flex-1 overflow-hidden bg-[#e4dccb] ring-1 ring-[#1c1a17]/15">
              {item.image ? (
                <PrintedPhoto>
                  <ImageLightbox src={item.image} alt={item.title} sizes="380px" fit="cover" caption={`${item.title} — ${item.source}`} />
                </PrintedPhoto>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <Newspaper className="size-8 text-[#1c1a17]/25" strokeWidth={1.25} />
                </div>
              )}
            </div>
            <figcaption className="shrink-0 border-b border-[#1c1a17]/25 pb-1.5 font-serif text-[10px] leading-snug text-[#1c1a17]/70 italic">
              {item.title}. <span className="not-italic">Photo: {item.source}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
});

/** Small-caps label over a rule, as used for boxes and indexes on a newspaper page. */
function SectionRule({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-b-2 border-[#1c1a17] pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#1c1a17]">
      {children}
    </p>
  );
}

/**
 * "Also reported by": the other outlets that covered the same event, in a ruled box. Each outlet
 * turns the book to its own spread.
 */
function AlsoReported({ others, onGoTo }: { others: { item: NewsItem; index: number }[]; onGoTo: (index: number) => void }) {
  if (!others.length) return null;
  return (
    <div className="shrink-0 border border-[#1c1a17]/30 bg-[#1c1a17]/[0.03] px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9b1c1c]">Also reported by</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-semibold">
        {others.map(({ item, index }, i) => (
          <span key={item.id} className="inline-flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-[8px] text-[#1c1a17]/40">✦</span>}
            <button
              type="button"
              onClick={() => onGoTo(index)}
              className="underline decoration-[#1c1a17]/25 underline-offset-[3px] transition-colors hover:text-[#9b1c1c] hover:decoration-[#9b1c1c]"
            >
              {item.source}
            </button>
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * "In this edition": a contents column listing other stories in the book (other events first),
 * each turning to its spread, with the page number like a real index.
 */
function EditionIndex({ entries, onGoTo }: { entries: { item: NewsItem; index: number }[]; onGoTo: (index: number) => void }) {
  if (!entries.length) return null;
  return (
    <div className="shrink-0">
      <SectionRule>In this edition</SectionRule>
      <ul className="divide-y divide-[#1c1a17]/15">
        {entries.map(({ item, index }) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onGoTo(index)}
              className="group/idx flex w-full items-baseline gap-3 py-1.5 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[8.5px] uppercase tracking-[0.16em] text-[#1c1a17]/55">{item.source}</span>
                <span
                  className={cn(
                    headlineFont.className,
                    "line-clamp-1 text-[12.5px] leading-snug font-bold transition-colors group-hover/idx:text-[#9b1c1c]"
                  )}
                >
                  {item.title}
                </span>
              </span>
              <span className="shrink-0 text-[9px] text-[#1c1a17]/50 italic">p. {index * 2 + 1}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Desktop right page: section label, headline, newsprint-column body and the article link. See ImagePage for why layout is on an inner wrapper. */
const TextPage = forwardRef<
  HTMLDivElement,
  {
    item: NewsItem;
    others: { item: NewsItem; index: number }[];
    edition: { item: NewsItem; index: number }[];
    onGoTo: (index: number) => void;
  }
>(function TextPage({ item, others, edition, onGoTo }, ref) {
  // Long stories set in two ruled columns like a real paper; short ones stay one column.
  const columns = (item.summary?.length ?? 0) > 200;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className={cn("absolute inset-0 flex h-full w-full flex-col overflow-hidden", NEWSPRINT)}>
        <PaperTexture />
        <Gutter side="left" />
        <div className={cn("relative flex flex-1 flex-col gap-3.5 overflow-hidden p-6 font-serif", INK)}>
          {/* Running head, like the top of an inside page. */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#1c1a17]/40 pb-1 text-[8px] uppercase tracking-[0.18em] text-[#1c1a17]/65">
            <span>{item.source}</span>
            <span>{item.date}</span>
          </div>

          <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9b1c1c]">In the news</p>

          <h3
            className={cn(
              headlineFont.className,
              "shrink-0 border-b border-[#1c1a17]/30 pb-3 text-[1.45rem] leading-[1.08] font-black tracking-tight text-balance"
            )}
          >
            {item.title}
          </h3>

          {item.summary && (
            <div className="min-h-0 shrink overflow-hidden">
              <p
                className={cn(
                  "hyphens-auto text-justify text-[13.5px] leading-[1.55] text-[#1c1a17]/85",
                  DROP_CAP,
                  "first-letter:text-[3.1rem] first-letter:leading-[0.8]",
                  columns && "columns-2 gap-5 [column-rule:1px_solid_rgba(28,26,23,0.2)]"
                )}
                lang="en"
              >
                {item.summary}
              </p>
            </div>
          )}

          <AlsoReported others={others} onGoTo={onGoTo} />

          {/* The contents column fills the lower page, like the index on an inside page. */}
          <div className="mt-auto flex shrink-0 flex-col gap-3">
            <EditionIndex entries={edition} onGoTo={onGoTo} />
            <div className="border-t-2 border-[#1c1a17] pt-2.5">
              <ClippingLinks item={item} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/** Mobile page: nameplate, photo and story stacked on one page, since there's no room for a spread. See ImagePage for why layout is on an inner wrapper. */
const CombinedPage = forwardRef<HTMLDivElement, { item: NewsItem }>(function CombinedPage({ item }, ref) {
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className={cn("absolute inset-0 flex h-full w-full flex-col overflow-hidden", NEWSPRINT)}>
        <PaperTexture />
        <div className={cn("relative flex flex-1 flex-col gap-2.5 overflow-hidden p-4 font-serif", INK)}>
          <Nameplate item={item} compact />
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#e4dccb] ring-1 ring-[#1c1a17]/15">
            {item.image ? (
              <PrintedPhoto>
                <Image src={item.image} alt={item.title} fill sizes="420px" className="object-cover" />
              </PrintedPhoto>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Newspaper className="size-8 text-[#1c1a17]/25" strokeWidth={1.25} />
              </div>
            )}
          </div>
          <h3 className={cn(headlineFont.className, "line-clamp-3 text-lg leading-tight font-black tracking-tight text-balance")}>
            {item.title}
          </h3>
          {item.summary && (
            <p
              lang="en"
              className={cn(
                "line-clamp-4 hyphens-auto text-justify text-[13px] leading-relaxed text-[#1c1a17]/85",
                DROP_CAP,
                "first-letter:text-3xl first-letter:leading-[0.8]"
              )}
            >
              {item.summary}
            </p>
          )}
          <div className="mt-auto border-t-2 border-[#1c1a17] pt-2">
            <ClippingLinks item={item} />
          </div>
        </div>
      </div>
    </div>
  );
});

/** News stories as an open, physically page-turnable book (powered by react-pageflip's page-curl engine). */
export function NewsClippings({ news }: { news: NewsItem[] }) {
  const n = news.length;
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const flipRef = useRef<{ pageFlip: () => PageFlipController } | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pagesPerItem = isDesktop ? 2 : 1;
  const pageCount = n * pagesPerItem;
  const articleIndex = Math.min(n - 1, Math.floor(pageIndex / pagesPerItem));
  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < pageCount - pagesPerItem;

  const flipNext = () => flipRef.current?.pageFlip().flipNext();
  const flipPrev = () => flipRef.current?.pageFlip().flipPrev();
  /** Turns the book to the spread for story `index` (from the index or "also reported by"). */
  const goTo = (index: number) => flipRef.current?.pageFlip().flip(index * pagesPerItem);

  const entries = news.map((item, index) => ({ item, index }));
  /** Other outlets' coverage of the same event. */
  const othersFor = (item: NewsItem) =>
    item.story ? entries.filter((e) => e.item !== item && e.item.story === item.story) : [];
  /**
   * The contents column for a story's page: other events first (one each), then anything left.
   * Fewer entries when the headline and summary already take up much of the page.
   */
  const editionFor = (item: NewsItem) => {
    const candidates = entries.filter((e) => e.item !== item && (!item.story || e.item.story !== item.story));
    const seen = new Set<string>();
    const firsts: typeof entries = [];
    const rest: typeof entries = [];
    for (const c of candidates) {
      const key = c.item.story ?? c.item.id;
      (seen.has(key) ? rest : firsts).push(c);
      seen.add(key);
    }
    const weight = item.title.length + (item.summary?.length ?? 0);
    const max = weight > 230 ? 1 : weight > 160 ? 2 : 3;
    return [...firsts, ...rest].slice(0, max);
  };

  if (n === 0) return null;

  return (
    <div className={cn("flex flex-col items-center gap-6", headlineFont.variable)}>
      <div className="relative w-full max-w-3xl pb-8">
        {/* Soft ground shadow the resting book casts on the page. */}
        <div aria-hidden className="absolute inset-x-10 bottom-1 h-8 rounded-[100%] bg-black/20 blur-2xl" />

        <div className="relative mx-auto overflow-hidden rounded-sm shadow-[0_20px_45px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
          {!mounted ? (
            <div className={cn("h-[520px] w-full animate-pulse", NEWSPRINT)} />
          ) : isDesktop ? (
            // Portrait pages (taller than wide), like an open broadsheet rather than a sheet of paper.
            <HTMLFlipBook
              key="desktop"
              ref={flipRef}
              className=""
              style={{}}
              startPage={0}
              size="stretch"
              width={360}
              height={500}
              minWidth={280}
              maxWidth={460}
              minHeight={420}
              maxHeight={620}
              drawShadow
              flippingTime={700}
              usePortrait={false}
              startZIndex={10}
              autoSize
              maxShadowOpacity={0.5}
              showCover={false}
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick={false}
              onFlip={(e: { data: number }) => setPageIndex(e.data)}
            >
              {news.flatMap((item) => [
                <ImagePage key={`${item.id}-img`} item={item} />,
                <TextPage
                  key={`${item.id}-text`}
                  item={item}
                  others={othersFor(item)}
                  edition={editionFor(item)}
                  onGoTo={goTo}
                />,
              ])}
            </HTMLFlipBook>
          ) : (
            <HTMLFlipBook
              key="mobile"
              ref={flipRef}
              className=""
              style={{}}
              startPage={0}
              size="stretch"
              width={340}
              height={520}
              minWidth={280}
              maxWidth={420}
              minHeight={460}
              maxHeight={620}
              drawShadow
              flippingTime={700}
              usePortrait
              startZIndex={10}
              autoSize
              maxShadowOpacity={0.5}
              showCover={false}
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick={false}
              onFlip={(e: { data: number }) => setPageIndex(e.data)}
            >
              {news.map((item) => (
                <CombinedPage key={item.id} item={item} />
              ))}
            </HTMLFlipBook>
          )}
        </div>
      </div>

      {n > 1 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <NavButton label="Previous story" onClick={flipPrev} disabled={!canGoBack}>
              <ChevronLeft className="size-4" />
            </NavButton>
            <span className="min-w-14 text-center font-mono text-xs tabular-nums text-muted-foreground">
              {articleIndex + 1} / {n}
            </span>
            <NavButton label="Next story" onClick={flipNext} disabled={!canGoForward}>
              <ChevronRight className="size-4" />
            </NavButton>
          </div>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MoveHorizontal className="size-3" /> Turn the page — click, drag, or use the arrows
          </p>
        </div>
      )}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
