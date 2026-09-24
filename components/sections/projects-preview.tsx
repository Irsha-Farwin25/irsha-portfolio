import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCarousel } from "@/components/projects/project-carousel";
import { projects } from "@/data/projects";

export function ProjectsPreview() {
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];

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

        <Reveal>
          <ProjectCarousel projects={ordered} />
        </Reveal>
      </Container>
    </section>
  );
}
