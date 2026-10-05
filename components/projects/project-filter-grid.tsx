"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export function ProjectFilterGrid({ projects }: { projects: Project[] }) {
  const t = useT();
  // "" is the "All" filter; the label comes from the dictionary.
  const categories = useMemo(() => ["", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  const filtered = projects.filter((p) => {
    const matchesCategory = !category || p.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.technologies.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {c || t.projects.allFilter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.projects.filterPlaceholder}
            className="ps-8"
            aria-label={t.projects.filterAria}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          {t.projects.none}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
