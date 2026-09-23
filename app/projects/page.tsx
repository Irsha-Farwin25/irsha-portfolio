import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectFilterGrid } from "@/components/projects/project-filter-grid";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Production platforms and applied AI projects built by Irsha Farwin — software engineer and AI engineer in training.",
};

export default function ProjectsPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Projects"
          title="Selected work"
          description="A mix of production platforms built in a government digital transformation context, and applied AI/research projects."
        />
        <ProjectFilterGrid projects={projects} />
      </Container>
    </div>
  );
}
