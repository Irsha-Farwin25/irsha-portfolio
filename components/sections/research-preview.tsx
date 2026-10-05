import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { PublicationCard } from "@/components/research/publication-card";
import { ExperimentCard } from "@/components/research/experiment-card";
import { getI18n } from "@/lib/i18n/server";

export async function ResearchPreview() {
  const { t, content } = await getI18n();
  const { publications, labExperiments } = content;
  return (
    <section id="research" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={t.research.eyebrow}
              title={t.research.previewTitle}
              description={t.research.previewDescription}
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href="/research">
                  {t.research.all} <ArrowRight data-icon="inline-end" className="rtl:-scale-x-100" />
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
