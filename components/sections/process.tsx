import { Container } from "@/components/ui/container";
import { SignalDivider } from "@/components/motion/signal";
import { SectionBackdrop } from "@/components/ui/section-backdrop";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ProcessFlow } from "@/components/process/process-flow";
import { getI18n } from "@/lib/i18n/server";

/** How she works: the ten steps from a first question to learning from real use. */
export async function Process() {
  const { t } = await getI18n();
  return (
    <section id="process" className="relative isolate py-16 sm:py-24">
      <SignalDivider />
      <SectionBackdrop side="start" />
      <Container className="flex flex-col gap-14">
        <Reveal>
          <SectionHeading eyebrow={t.process.eyebrow} title={t.process.title} description={t.process.description} />
        </Reveal>

        <ProcessFlow />
      </Container>
    </section>
  );
}
