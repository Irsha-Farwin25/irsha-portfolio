"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import Image from "next/image";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, ExternalLink, MoveHorizontal, Newspaper } from "lucide-react";
import { ImageLightbox } from "@/components/projects/image-lightbox";
import type { NewsItem } from "@/lib/types";

// A very subtle dot-grain texture so the pages read as paper, not flat vector white.
const PAPER_GRAIN: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 0.5px, transparent 0.5px)",
  backgroundSize: "4px 4px",
};

interface PageFlipController {
  flipNext: () => void;
  flipPrev: () => void;
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
  const linkClass =
    "group/link inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-primary transition-colors hover:text-neutral-900";
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <span className="border-b border-primary/40 pb-0.5 transition-colors group-hover/link:border-neutral-900">
            {item.linkLabel ?? "Read Full Article"}
          </span>
          <ExternalLink className="size-3 shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      )}
      {item.extraLinks?.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <span className="border-b border-primary/40 pb-0.5 transition-colors group-hover/link:border-neutral-900">{l.label}</span>
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
      <div className="absolute inset-0 flex h-full w-full flex-col gap-2 bg-white p-4">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={PAPER_GRAIN} />
        <div className="relative min-h-0 flex-1 overflow-hidden border border-neutral-200 bg-neutral-50">
          {item.image ? (
            <ImageLightbox src={item.image} alt={item.title} sizes="380px" fit="cover" caption={`${item.title} — ${item.source}`} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Newspaper className="size-8 text-neutral-300" strokeWidth={1.25} />
            </div>
          )}
        </div>
        <p className="shrink-0 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">
          {item.source}
          {item.date && ` · ${item.date}`}
        </p>
      </div>
    </div>
  );
});

/** Desktop right page: kicker, headline, true newsprint-column body, and the article link. See ImagePage for why layout is on an inner wrapper. */
const TextPage = forwardRef<HTMLDivElement, { item: NewsItem }>(function TextPage({ item }, ref) {
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={PAPER_GRAIN} />
        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5 font-serif text-neutral-900 sm:p-6">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
              <Newspaper className="size-2.5 shrink-0" />
              {item.source}
            </span>
            {item.date && (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">{item.date}</span>
            )}
          </div>

          <h3 className="shrink-0 border-b-2 border-neutral-900 pb-3 text-lg leading-[1.1] font-black tracking-tight text-balance sm:text-xl">
            {item.title}
          </h3>

          {item.summary && (
            <div className="flex min-h-0 flex-1 items-center overflow-hidden">
              <p className="text-pretty text-[15px] leading-relaxed text-neutral-700 first-letter:float-left first-letter:mr-1.5 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.75] first-letter:font-black first-letter:text-neutral-900 sm:text-base">
                {item.summary}
              </p>
            </div>
          )}

          <div className="shrink-0 border-t border-neutral-200 pt-3">
            <ClippingLinks item={item} />
          </div>
        </div>
      </div>
    </div>
  );
});

/** Mobile page: image and details stacked together, since there's no room for a spread. See ImagePage for why layout is on an inner wrapper. */
const CombinedPage = forwardRef<HTMLDivElement, { item: NewsItem }>(function CombinedPage({ item }, ref) {
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={PAPER_GRAIN} />
        <div className="relative aspect-[16/10] w-full shrink-0 border-b border-neutral-200 bg-neutral-50 p-2">
          {item.image ? (
            <Image src={item.image} alt={item.title} fill sizes="420px" className="object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Newspaper className="size-8 text-neutral-300" strokeWidth={1.25} />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-4 font-serif text-neutral-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white">
              <Newspaper className="size-2.5 shrink-0" />
              {item.source}
            </span>
            {item.date && <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{item.date}</span>}
          </div>
          <h3 className="line-clamp-3 text-base leading-tight font-black tracking-tight text-balance">{item.title}</h3>
          {item.summary && (
            <p className="line-clamp-4 text-[13px] leading-relaxed text-neutral-700 first-letter:float-left first-letter:mr-1 first-letter:font-serif first-letter:text-3xl first-letter:leading-[0.75] first-letter:font-black">
              {item.summary}
            </p>
          )}
          <ClippingLinks item={item} />
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

  if (n === 0) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-3xl pb-8">
        {/* Soft ground shadow the resting book casts on the page. */}
        <div aria-hidden className="absolute inset-x-10 bottom-1 h-8 rounded-[100%] bg-black/20 blur-2xl" />

        <div className="relative mx-auto overflow-hidden rounded-sm shadow-[0_20px_45px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
          {!mounted ? (
            <div className="h-[420px] w-full animate-pulse bg-white sm:h-[420px]" style={PAPER_GRAIN} />
          ) : isDesktop ? (
            <HTMLFlipBook
              key="desktop"
              ref={flipRef}
              className=""
              style={{}}
              startPage={0}
              size="stretch"
              width={380}
              height={420}
              minWidth={300}
              maxWidth={500}
              minHeight={360}
              maxHeight={500}
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
              {news.flatMap((item) => [<ImagePage key={`${item.id}-img`} item={item} />, <TextPage key={`${item.id}-text`} item={item} />])}
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
              height={460}
              minWidth={280}
              maxWidth={420}
              minHeight={400}
              maxHeight={560}
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
