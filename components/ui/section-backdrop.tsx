import { cn } from "@/lib/utils";
import { PlexusField } from "@/components/motion/plexus-field";

/**
 * A quiet backdrop for a home-page section, running its full height: drifting points joined by fine
 * lines, with the hero's dot grid showing through at one top corner and the opposite bottom
 * corner, each with a soft glow, so the section never reads as flat black behind its content.
 * Alternating `side` from section to section keeps the page from looking like one flat column.
 * Place it inside a `relative isolate` section.
 */
export function SectionBackdrop({ side = "start" }: { side?: "start" | "end" }) {
  const start = side === "start";
  const [a, b] = start ? ["0%", "100%"] : ["100%", "0%"];
  // Two windows onto the grid: a large one at the top corner, a smaller one at the bottom corner.
  const mask = [
    `radial-gradient(ellipse 60% 55% at ${a} 0%, black 10%, transparent 75%)`,
    `radial-gradient(ellipse 45% 45% at ${b} 100%, black 5%, transparent 75%)`,
  ].join(", ");
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Points that drift and join up with fine lines, the full height of the section. */}
      <PlexusField />
      <div
        className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1.2px,transparent_1.2px)] [background-size:22px_22px] rtl:-scale-x-100"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      />
      <div
        className={cn(
          "absolute -top-40 size-[620px] rounded-full bg-primary/10 blur-3xl dark:bg-primary/[0.12]",
          start ? "-start-48" : "-end-48"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-48 size-[520px] rounded-full bg-chart-2/[0.07] blur-3xl dark:bg-chart-2/[0.09]",
          start ? "-end-40" : "-start-40"
        )}
      />
    </div>
  );
}
