import Image from "next/image";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function AvatarView({
  src,
  size = 56,
  className,
}: {
  src: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={site.name}
        width={size}
        height={size}
        className={cn("rounded-full border border-border object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-full border border-border bg-primary/10 font-mono text-sm font-medium text-primary",
        className
      )}
      aria-hidden="true"
    >
      {site.initials}
    </div>
  );
}
