import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ResearchShowcase } from "@/components/research/research-showcase";
import { getI18n } from "@/lib/i18n/server";

export async function ResearchPreview() {
  const { t } = await getI18n();
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

        <ResearchShowcase />
      </Container>
    </section>
  );
}
