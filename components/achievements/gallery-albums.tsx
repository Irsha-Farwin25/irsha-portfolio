"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Images, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryAlbum } from "@/lib/types";
import { useT } from "@/components/i18n/locale-provider";

const navButtonClass =
  "relative flex size-10 shrink-0 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Cover collage: one large photo plus up to two smaller ones. */
function AlbumCover({ album }: { album: GalleryAlbum }) {
  const [first, ...rest] = album.images;
  const side = rest.slice(0, 2);
  const sizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw";

  return (
    <div className="absolute inset-0 flex gap-1">
      <div className="relative flex-[2] overflow-hidden">
        <Image
          src={first.src}
          alt={first.caption}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>
      {side.length > 0 && (
        <div className="flex flex-1 flex-col gap-1">
          {side.map((img) => (
            <div key={img.id} className="relative flex-1 overflow-hidden">
              <Image
                src={img.src}
                alt={img.caption}
                fill
                sizes="(min-width: 1024px) 180px, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AlbumCard({ album }: { album: GalleryAlbum }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const [index, setIndex] = useState(0);
  const count = album.images.length;
  const current = album.images[index];

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  const onKeyDown = (e: KeyboardEvent) => {
    if (count < 2) return;
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setIndex(0);
      }}
    >
      <Dialog.Trigger
        aria-label={t.achievements.openAlbum(album.title, count)}
        className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl border border-border text-start transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_40px_-16px] hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0"
      >
        <AlbumCover album={album} />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-white">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold leading-snug">{album.title}</span>
            {album.date && <span className="font-mono text-[11px] uppercase tracking-wider text-white/75">{album.date}</span>}
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium backdrop-blur-sm">
            <Images className="size-3" /> {count}
          </span>
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 transition duration-200 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-10"
        >
          <Dialog.Title className="sr-only">{album.title}</Dialog.Title>
          <Dialog.Close className="absolute inset-0 cursor-zoom-out" aria-label={t.achievements.closeAlbum} />

          <div dir="ltr" className="relative flex w-full max-w-6xl items-center justify-center gap-3">
            {count > 1 && (
              <button type="button" aria-label={t.achievements.prevPhoto} onClick={() => go(-1)} className={cn(navButtonClass, "hidden sm:flex")}>
                <ChevronLeft className="size-5" />
              </button>
            )}
            <Image
              key={current.id}
              src={current.src}
              alt={current.caption}
              width={1920}
              height={1080}
              sizes="90vw"
              className="relative h-auto max-h-[65vh] w-auto max-w-full min-w-0 rounded-lg border border-white/10 shadow-2xl"
            />
            {count > 1 && (
              <button type="button" aria-label={t.achievements.nextPhoto} onClick={() => go(1)} className={cn(navButtonClass, "hidden sm:flex")}>
                <ChevronRight className="size-5" />
              </button>
            )}
          </div>

          <div className="relative flex max-w-2xl flex-col items-center gap-1 text-center">
            <p className="text-sm text-white/90">{current.caption}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/60">
              {album.title} · {index + 1} / {count}
            </p>
          </div>

          {count > 1 && (
            <div className="relative flex max-w-full gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {album.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={t.achievements.showPhoto(i + 1, img.caption)}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition-[opacity,border-color] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-16",
                    i === index ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-90"
                  )}
                >
                  <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <Dialog.Close
            aria-label={t.common.close}
            className="absolute top-4 end-4 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <XIcon className="size-5" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Gallery grouped by event: one collage card per album, each opening a swipeable viewer. */
export function GalleryAlbums({ albums }: { albums: GalleryAlbum[] }) {
  return (
    // Flex-wrap rather than a grid, so a short last row (or a tab with only two albums) centres
    // under the tabs instead of hugging the left edge. Widths match a 1/2/3-column grid with gap-5.
    <div className="flex flex-wrap justify-center gap-5">
      {albums.map((album) => (
        <div key={album.id} className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
          <AlbumCard album={album} />
        </div>
      ))}
    </div>
  );
}
