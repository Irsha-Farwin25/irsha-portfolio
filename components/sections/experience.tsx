import { GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { ExperienceCard } from "@/components/experience/experience-card";
import { experience } from "@/data/experience";
import { education } from "@/data/education";

function formatRange(start: string, end: string | null) {
  return `${start} — ${end ?? "Present"}`;
}

export function Experience() {
  return (
    <section id="experience" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Experience"
            title="Where I've been building"
            description="Production engineering work alongside postgraduate study in artificial intelligence."
          />
        </Reveal>

        <div className="relative flex flex-col gap-5 border-l border-border pl-8">
          {experience.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <article className="relative">
                <span
                  className="absolute -left-[calc(2rem+5px)] top-6 size-2.5 rounded-full border-2 border-background bg-primary"
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
              <h3 className="text-lg font-semibold tracking-tight">Education</h3>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2">
            {education.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <div className="flex h-full flex-col gap-2 rounded-lg border border-border p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatRange(item.startDate, item.endDate)}
                    </span>
                    {item.status === "in-progress" && (
                      <Badge className="font-mono text-[10px]">In Progress</Badge>
                    )}
                  </div>
                  <h4 className="font-semibold">
                    {item.degree} {item.field}
                  </h4>
                  <p className="text-sm font-medium text-primary">{item.institution}</p>
                  <p className="text-sm text-foreground/80">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
