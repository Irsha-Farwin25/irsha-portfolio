import { Binary, Brain, Building2, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcon: Record<string, typeof Brain> = {
  "Web Platform": Building2,
  "AI / Research": Brain,
  "Government Tech": Landmark,
};

export function ProjectThumb({ category, className }: { category: string; className?: string }) {
  const Icon = categoryIcon[category] ?? Binary;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/40",
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <Icon className="relative size-9 text-primary/50" strokeWidth={1.25} />
    </div>
  );
}
