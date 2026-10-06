import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand-icons";
import { Container } from "@/components/ui/container";
import { HeroBackground } from "@/components/hero/hero-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectThumb } from "@/components/projects/project-thumb";
import { projects } from "@/data/projects";
import { getI18n } from "@/lib/i18n/server";
import { isPlaceholder } from "@/lib/i18n/content";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const { t, content } = await getI18n();
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) return { title: t.projects.notFoundTitle };

  return {
    title: project.title.replace(/[[\]]/g, ""),
    description: project.description,
  };
}

const caseStudySections = ["overview", "problem", "context", "myRole", "solution", "architecture"] as const;

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">
) {
  const { slug } = await props.params;
  const { locale, t, content } = await getI18n();
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const cs = project.caseStudy;
  // The case studies still hold "[Describe …]" prompts for Irsha to fill in. They read as notes
  // to self in English; in Arabic they'd be untranslated English, so they're left out there.
  const shown = (text: string | undefined) => !!text && !(locale === "ar" && isPlaceholder(text));
  const list = (items: string[]) => items.filter(shown);

  const bulletList = (title: string, items: string[]) =>
    items.length > 0 && (
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">{title}</h2>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-foreground/90">
              <span className="mt-2.5 size-1 shrink-0 rounded-full bg-primary/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className="relative isolate overflow-hidden py-16 sm:py-24">
      {/* The hero's dot grid and cursor spotlight behind the page header, without the network. */}
      <HeroBackground network={false} className="bottom-auto h-[640px]" />
      <Container className="flex flex-col gap-10">
        <Link
          href="/projects"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 rtl:-scale-x-100" /> {t.projects.back}
        </Link>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-normal">
              {project.category}
            </Badge>
            {project.isPlaceholder && (
              <Badge variant="secondary" className="font-mono text-xs font-normal text-muted-foreground">
                {t.projects.sampleFull}
              </Badge>
            )}
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">{project.description}</p>

          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech} className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground">
                {tech}
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
                    <GithubIcon data-icon="inline-start" /> {t.common.sourceCode}
                  </a>
                }
              />
            )}
            {project.liveUrl && project.liveUrl !== "#" && (
              <Button
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

        <ProjectThumb
          category={project.category}
          image={project.image}
          alt={t.projects.screenshot(project.title)}
          sizes="(min-width: 1152px) 1152px, 100vw"
          priority
          className="aspect-[21/9] w-full"
        />

        {cs ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-10">
              {caseStudySections
                .filter((key) => shown(cs[key]))
                .map((key) => (
                  <div key={key} className="flex flex-col gap-2">
                    <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">
                      {t.projects.sections[key]}
                    </h2>
                    <p className="text-pretty leading-relaxed text-foreground/90">{cs[key]}</p>
                  </div>
                ))}

              {bulletList(t.projects.keyFeatures, list(cs.keyFeatures))}
              {bulletList(t.projects.challenges, list(cs.challenges))}
              {bulletList(t.projects.decisions, list(cs.decisions))}

              {shown(cs.outcome) && (
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-primary">
                    {t.projects.outcome}
                  </h2>
                  <p className="text-pretty leading-relaxed text-foreground/90">{cs.outcome}</p>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold">{t.projects.atAGlance}</h3>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t.projects.category}</dt>
                  <dd>{project.category}</dd>
                </div>
                {shown(project.role) && (
                  <div>
                    <dt className="text-muted-foreground">{t.projects.role}</dt>
                    <dd>{project.role}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">{t.projects.stack}</dt>
                  <dd>{project.technologies.join(locale === "ar" ? "، " : ", ")}</dd>
                </div>
              </dl>
            </aside>
          </div>
        ) : (
          <p className="text-muted-foreground">{t.projects.noCaseStudy}</p>
        )}
      </Container>
    </div>
  );
}
