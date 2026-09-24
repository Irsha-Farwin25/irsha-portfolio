import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand-icons";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectThumb } from "@/components/projects/project-thumb";
import { projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title.replace(/[[\]]/g, ""),
    description: project.description,
  };
}

const caseStudySections: {
  key: "overview" | "problem" | "context" | "myRole" | "solution" | "architecture";
  label: string;
}[] = [
  { key: "overview", label: "Overview" },
  { key: "problem", label: "Problem" },
  { key: "context", label: "Context" },
  { key: "myRole", label: "My Role" },
  { key: "solution", label: "Solution" },
  { key: "architecture", label: "Architecture" },
];

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">
) {
  const { slug } = await props.params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const cs = project.caseStudy;

  return (
    <div className="py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <Link
          href="/projects"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All projects
        </Link>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-normal">
              {project.category}
            </Badge>
            {project.isPlaceholder && (
              <Badge variant="secondary" className="font-mono text-xs font-normal text-muted-foreground">
                Sample project — replace with real details
              </Badge>
            )}
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">{project.description}</p>

          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <span key={t} className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {project.github && project.github !== "#" && (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <GithubIcon data-icon="inline-start" /> Source Code
                  </a>
                }
              />
            )}
            {project.liveUrl && project.liveUrl !== "#" && (
              <Button
                nativeButton={false}
                render={
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    Live Demo <ExternalLink data-icon="inline-end" />
                  </a>
                }
              />
            )}
          </div>
        </div>

        <ProjectThumb
          category={project.category}
          image={project.image}
          alt={`${project.title} screenshot`}
          sizes="(min-width: 1152px) 1152px, 100vw"
          priority
          className="aspect-[21/9] w-full"
        />

        {cs ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-10">
              {caseStudySections.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-2">
                  <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">
                    {label}
                  </h2>
                  <p className="text-pretty leading-relaxed text-foreground/90">{cs[key]}</p>
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">
                  Key Features
                </h2>
                <ul className="flex flex-col gap-2">
                  {cs.keyFeatures.map((f) => (
                    <li key={f} className="flex gap-2.5 text-foreground/90">
                      <span className="mt-2.5 size-1 shrink-0 rounded-full bg-primary/60" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">
                  Challenges
                </h2>
                <ul className="flex flex-col gap-2">
                  {cs.challenges.map((c) => (
                    <li key={c} className="flex gap-2.5 text-foreground/90">
                      <span className="mt-2.5 size-1 shrink-0 rounded-full bg-primary/60" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">
                  Engineering Decisions
                </h2>
                <ul className="flex flex-col gap-2">
                  {cs.decisions.map((d) => (
                    <li key={d} className="flex gap-2.5 text-foreground/90">
                      <span className="mt-2.5 size-1 shrink-0 rounded-full bg-primary/60" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">
                  Outcome
                </h2>
                <p className="text-pretty leading-relaxed text-foreground/90">{cs.outcome}</p>
              </div>
            </div>

            <aside className="h-fit rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold">At a glance</h3>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd>{project.category}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Stack</dt>
                  <dd>{project.technologies.join(", ")}</dd>
                </div>
              </dl>
            </aside>
          </div>
        ) : (
          <p className="text-muted-foreground">
            A full case study for this project hasn&apos;t been written up yet.
          </p>
        )}
      </Container>
    </div>
  );
}
