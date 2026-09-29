import { CircleCheck, Compass, Sparkles, Target, User } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import {
  aboutParagraphs,
  careerObjective,
  researchAreas,
  researchInterests,
} from "@/data/site";
import type { LucideIcon } from "lucide-react";

function AboutCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-border p-6">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <SectionHeading eyebrow="About Me" title="Background & focus" />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Reveal>
              <AboutCard icon={User} title="Biography">
                <div className="flex flex-col gap-4">
                  {aboutParagraphs.map((p, i) => (
                    <p key={i} className="text-pretty text-sm leading-relaxed text-foreground/85">
                      {p}
                    </p>
                  ))}
                </div>
              </AboutCard>
            </Reveal>

            <Reveal delay={0.05}>
              <AboutCard icon={Target} title="Career & Academic Objective">
                <p className="text-pretty text-sm leading-relaxed text-foreground/85">
                  {careerObjective}
                </p>
              </AboutCard>
            </Reveal>
          </div>

          <div className="flex flex-col gap-6">
            <Reveal delay={0.1}>
              <AboutCard icon={Sparkles} title="Research Interests">
                <ul className="flex flex-wrap gap-2">
                  {researchInterests.map((interest) => (
                    <li
                      key={interest}
                      className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground/85"
                    >
                      {interest}
                    </li>
                  ))}
                </ul>
              </AboutCard>
            </Reveal>

            <Reveal delay={0.15}>
              <AboutCard icon={Compass} title="Research Areas">
                <ul className="flex flex-col gap-3">
                  {researchAreas.map((area) => (
                    <li key={area} className="flex gap-2.5 text-sm text-foreground/85">
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-pretty leading-relaxed">{area}</span>
                    </li>
                  ))}
                </ul>
              </AboutCard>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
