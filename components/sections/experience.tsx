import { GraduationCap } from "lucide-react";
import { SignalDivider } from "@/components/motion/signal";
import { SectionBackdrop } from "@/components/ui/section-backdrop";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ExperienceExplorer } from "@/components/experience/experience-explorer";
import { EducationCredentials } from "@/components/experience/education-credentials";
import { getI18n } from "@/lib/i18n/server";

export async function Experience() {
  const { t } = await getI18n();
  return (
    <section id="experience" className="relative isolate py-16 sm:py-24">
      <SignalDivider />
      <SectionBackdrop side="start" />
      <Container className="flex flex-col gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={t.experience.eyebrow}
            title={t.experience.title}
            description={t.experience.description}
          />
        </Reveal>

        <ExperienceExplorer />

        {/* Its own id so the avatar introduces Education separately from the jobs above it. */}
        <div id="education" className="flex scroll-mt-24 flex-col gap-6 border-t border-border pt-14">
          <Reveal>
            {/* Same quiet label style as the panels above, so Education reads as part of the section. */}
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <GraduationCap className="size-4.5" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{t.experience.education}</h3>
              <span aria-hidden className="h-px flex-1 bg-linear-to-r from-border to-transparent rtl:bg-linear-to-l" />
            </div>
          </Reveal>

          <EducationCredentials />
        </div>
      </Container>
    </section>
  );
}
