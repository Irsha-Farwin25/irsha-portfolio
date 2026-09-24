import { Binary, Brain, Building2, Landmark } from "lucide-react";
import { ImageLightbox } from "@/components/projects/image-lightbox";
import { cn } from "@/lib/utils";

const categoryIcon: Record<string, typeof Brain> = {
  "Web Platform": Building2,
  "AI / Research": Brain,
  "Government Tech": Landmark,
};

export function ProjectThumb({
  category,
  image,
  alt = "",
  sizes = "100vw",
  priority = false,
  className,
}: {
  category: string;
  image?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const Icon = categoryIcon[category] ?? Binary;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/40",
        className
      )}
    >
      {image ? (
        <ImageLightbox src={image} alt={alt} sizes={sizes} priority={priority} />
      ) : (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <Icon className="relative size-9 text-primary/50" strokeWidth={1.25} />
        </>
      )}
    </div>
  );
}
