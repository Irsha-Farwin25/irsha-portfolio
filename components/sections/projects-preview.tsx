import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { projects } from "@/data/projects";

export function ProjectsPreview() {
  const featured = projects.filter((p) => p.featured).slice(0, 2);
  const rest = projects.filter((p) => !p.featured).slice(0, 2);

  return (
    <section id="projects" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Projects"
              title="Selected work"
              description="A mix of production platforms and applied AI experiments."
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href="/projects">
                  All projects <ArrowRight data-icon="inline-end" />
                </Link>
              }
            />
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.05}>
              <ProjectCard project={project} featured />
            </Reveal>
          ))}
        </div>

        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.05}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
