import { GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ExperienceCard } from "@/components/experience/experience-card";
import { EducationPath } from "@/components/experience/education-path";
import { getI18n } from "@/lib/i18n/server";

export async function Experience() {
  const { t, content } = await getI18n();
  const { experience } = content;
  return (
    <section id="experience" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={t.experience.eyebrow}
            title={t.experience.title}
            description={t.experience.description}
          />
        </Reveal>

        <div className="relative flex flex-col gap-5 border-s border-border ps-8">
          {experience.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <article className="relative">
                <span
                  className="absolute -start-[calc(2rem+5px)] top-6 size-2.5 rounded-full border-2 border-background bg-primary"
                  aria-hidden="true"
                />

                <ExperienceCard item={item} defaultOpen={i === 0} />
              </article>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-border pt-14">
          <Reveal>
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              <h3 className="text-lg font-semibold tracking-tight">{t.experience.education}</h3>
            </div>
          </Reveal>

          <EducationPath />
        </div>
      </Container>
    </section>
  );
}
