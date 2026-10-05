"use client";

import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectThumb } from "@/components/projects/project-thumb";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const t = useT();
  const hasRealLinks = (project.github && project.github !== "#") || (project.liveUrl && project.liveUrl !== "#");

  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-4 rounded-lg border p-5 transition-colors hover:border-primary/40",
        project.isPlaceholder ? "border-dashed border-border" : "border-border",
        featured && "sm:p-6"
      )}
    >
      <ProjectThumb
        category={project.category}
        image={project.image}
        alt={t.projects.screenshot(project.title)}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
        className={featured ? "aspect-[16/9]" : "aspect-[16/10]"}
      />

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] font-normal">
                {project.category}
              </Badge>
              {project.isPlaceholder && (
                <Badge variant="secondary" className="font-mono text-[10px] font-normal text-muted-foreground">
                  {t.projects.sample}
                </Badge>
              )}
            </div>
            <h3 className={cn("mt-2 font-semibold tracking-tight", featured ? "text-xl" : "text-lg")}>
              {project.title}
            </h3>
          </div>
        </div>

        <p className="flex-1 text-pretty text-sm text-muted-foreground">{project.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((t) => (
            <span key={t} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-1 text-sm">
          {hasRealLinks && project.github && project.github !== "#" && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <GithubIcon className="size-3.5" /> {t.common.source}
            </a>
          )}
          {hasRealLinks && project.liveUrl && project.liveUrl !== "#" && (
            <Button
              size="sm"
              className="ms-auto"
              nativeButton={false}
              render={
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  {t.common.liveDemo} <ExternalLink data-icon="inline-end" className="rtl:-scale-x-100" />
                </a>
              }
            />
          )}
        </div>
      </div>
    </article>
  );
}
