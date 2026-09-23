import { GithubIcon } from "@/components/icons/brand-icons";
import { Badge } from "@/components/ui/badge";
import type { ExperimentStatus, LabExperiment } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<ExperimentStatus, string> = {
  Research: "border-chart-2/40 text-chart-2",
  Prototype: "border-chart-3/40 text-chart-3",
  Experiment: "border-primary/40 text-primary",
  "In Development": "border-chart-4/40 text-chart-4",
};

export function ExperimentCard({ experiment }: { experiment: LabExperiment }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-dashed border-border p-5">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn("font-mono text-[10px] font-normal", statusStyles[experiment.status])}
        >
          {experiment.status}
        </Badge>
        {experiment.github && experiment.github !== "#" && (
          <a
            href={experiment.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source"
            className="text-muted-foreground hover:text-foreground"
          >
            <GithubIcon className="size-4" />
          </a>
        )}
      </div>

      <h3 className="font-semibold tracking-tight">{experiment.title}</h3>
      <p className="flex-1 text-pretty text-sm text-muted-foreground">{experiment.description}</p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {experiment.technologies.map((t) => (
          <span key={t} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}
