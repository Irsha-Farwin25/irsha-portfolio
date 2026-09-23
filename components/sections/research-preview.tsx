import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { PublicationCard } from "@/components/research/publication-card";
import { ExperimentCard } from "@/components/research/experiment-card";
import { publications, labExperiments } from "@/data/research";

export function ResearchPreview() {
  return (
    <section id="research" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Research & AI Lab"
              title="Where I'm developing AI depth"
              description="Postgraduate research alongside hands-on experimentation — not claims of professional AI expertise."
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href="/research">
                  All research <ArrowRight data-icon="inline-end" />
                </Link>
              }
            />
          </div>
        </Reveal>

        <div className="grid gap-6">
          {publications.map((pub, i) => (
            <Reveal key={pub.id} delay={i * 0.05}>
              <PublicationCard publication={pub} />
            </Reveal>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.slice(0, 3).map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <ExperimentCard experiment={exp} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
