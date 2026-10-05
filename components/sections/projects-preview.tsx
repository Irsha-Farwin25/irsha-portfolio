import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCarousel } from "@/components/projects/project-carousel";
import { getI18n } from "@/lib/i18n/server";

export async function ProjectsPreview() {
  const { t, content } = await getI18n();
  const { projects } = content;
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];

  return (
    <section id="projects" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={t.projects.eyebrow}
              title={t.projects.title}
              description={t.projects.previewDescription}
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href="/projects">
                  {t.projects.all} <ArrowRight data-icon="inline-end" className="rtl:-scale-x-100" />
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
