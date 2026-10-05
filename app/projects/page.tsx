import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectFilterGrid } from "@/components/projects/project-filter-grid";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.projects.metaTitle, description: t.projects.metaDescription };
}

export default async function ProjectsPage() {
  const { t, content } = await getI18n();
  return (
    <div className="py-16 sm:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={t.projects.eyebrow}
          title={t.projects.title}
          description={t.projects.pageDescription}
        />
        <ProjectFilterGrid projects={content.projects} />
      </Container>
    </div>
  );
}
