import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { HeroBackground } from "@/components/hero/hero-background";
import { SectionHeading } from "@/components/ui/section-heading";
import { Eyebrow } from "@/components/ui/section-heading";
import { PublicationCard } from "@/components/research/publication-card";
import { ExperimentCard } from "@/components/research/experiment-card";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.research.pageTitle, description: t.research.metaDescription };
}

export default async function ResearchPage() {
  const { t, content } = await getI18n();
  const { publications, labExperiments } = content;
  return (
    <div className="relative isolate overflow-hidden py-16 sm:py-24">
      {/* The hero's dot grid and cursor spotlight behind the page header, without the network. */}
      <HeroBackground network={false} className="bottom-auto h-[640px]" />
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow={t.research.eyebrow}
          title={t.research.pageTitle}
          description={t.research.pageDescription}
        />

        <div className="flex flex-col gap-6">
          <Eyebrow>{t.research.publications}</Eyebrow>
          <div className="grid gap-6">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Eyebrow>{t.research.lab}</Eyebrow>
          <p className="max-w-2xl text-muted-foreground">
            {t.research.labIntro}
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
