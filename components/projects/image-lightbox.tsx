"use client";

import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { Maximize2, XIcon } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

/**
 * Clickable project thumbnail that opens the full screenshot in a lightbox.
 * Closes on Esc, backdrop click, or the close button.
 */
export function ImageLightbox({
  src,
  alt,
  sizes,
  priority,
  fit = "cover",
  caption,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** "contain" shows the whole image in the thumbnail (e.g. certificates). */
  fit?: "cover" | "contain";
  /** Shown under the full-size image. */
  caption?: string;
}) {
  const t = useT();
  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label={t.achievements.viewImage(alt)}
        className="group/thumb absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`${fit === "contain" ? "object-contain p-2" : "object-cover"} transition-transform duration-500 ease-out group-hover/thumb:scale-105 motion-reduce:transition-none`}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover/thumb:bg-black/40">
          <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-md transition-opacity duration-300 group-hover/thumb:opacity-100">
            <Maximize2 className="size-3.5" /> View image
          </span>
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4 transition duration-200 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-10">
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <Dialog.Close className="absolute inset-0 cursor-zoom-out" aria-label={t.achievements.closeImage} />
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1080}
            sizes="95vw"
            className="relative h-auto max-h-[80vh] w-auto max-w-full rounded-lg border border-white/10 shadow-2xl"
          />
          {caption && <p className="relative max-w-2xl text-center text-sm text-white/90">{caption}</p>}
          <Dialog.Close
            aria-label={t.common.close}
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <XIcon className="size-5" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
