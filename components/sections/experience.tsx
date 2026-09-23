import { CalendarDays, CircleCheck, GraduationCap, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
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

        <div className="relative flex flex-col gap-8 border-l border-border pl-8">
          {experience.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <article className="relative">
                <span
                  className="absolute -left-[calc(2rem+5px)] top-6 size-2.5 rounded-full border-2 border-background bg-primary"
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-4 rounded-xl border border-border p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{item.role}</h3>
                      <p className="text-sm font-medium text-primary">{item.organization}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {item.location}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary">
                      <CalendarDays className="size-3" />
                      {formatRange(item.startDate, item.endDate)}
                    </span>
                  </div>

                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Type: {item.employmentType} · {item.locationType}
                  </p>

                  {item.summary && (
                    <>
                      <div className="border-t border-border" />
                      <p className="text-pretty text-sm leading-relaxed text-foreground/85">
                        {item.summary}
                      </p>
                    </>
                  )}

                  {item.responsibilities.length > 0 && (
                    <>
                      <div className="border-t border-border" />
                      <div className="flex flex-col gap-2.5">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Key Contributions
                        </p>
                        <ul className="flex flex-col gap-2">
                          {item.responsibilities.map((r) => (
                            <li key={r} className="flex gap-2.5 text-sm text-foreground/85">
                              <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                              <span className="text-pretty leading-relaxed">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.technologies.map((t) => (
                        <Badge key={t} variant="secondary" className="font-mono text-[11px] font-normal">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {item.isPlaceholder && (
                    <p className="font-mono text-[11px] text-muted-foreground/70">
                      Organization name and dates are placeholders — update in data/experience.ts
                    </p>
                  )}
                </div>
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
