import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Eyebrow } from "@/components/ui/section-heading";
import { PublicationCard } from "@/components/research/publication-card";
import { ExperimentCard } from "@/components/research/experiment-card";
import { publications, labExperiments } from "@/data/research";

export const metadata: Metadata = {
  title: "Research & AI Lab",
  description:
    "MSc research and applied AI experimentation from Irsha Farwin — publications, presentations, and lab prototypes.",
};

export default function ResearchPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow="Research & AI Lab"
          title="Research & AI Lab"
          description="Postgraduate research and hands-on AI experimentation — presented as active learning, not professional AI expertise."
        />

        <div className="flex flex-col gap-6">
          <Eyebrow>Publications & Presentations</Eyebrow>
          <div className="grid gap-6">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Eyebrow>AI Engineering Lab</Eyebrow>
          <p className="max-w-2xl text-muted-foreground">
            Experiments, prototypes, and coursework projects from my MSc and independent study —
            labeled by status rather than presented as finished products.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {labExperiments.map((exp) => (
              <ExperimentCard key={exp.id} experiment={exp} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
