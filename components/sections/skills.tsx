import { Container } from "@/components/ui/container";
import { SignalDivider } from "@/components/motion/signal";
import { SectionBackdrop } from "@/components/ui/section-backdrop";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { SkillsExplorer } from "@/components/skills/skills-explorer";
import { getI18n } from "@/lib/i18n/server";

export async function Skills() {
  const { t } = await getI18n();
  return (
    <section id="skills" className="relative isolate py-16 sm:py-24">
      <SignalDivider />
      <SectionBackdrop side="end" />
      <Container className="flex flex-col gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={t.skills.eyebrow}
            title={t.skills.title}
            description={t.skills.description}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <SkillsExplorer />
        </Reveal>
      </Container>
    </section>
  );
}
