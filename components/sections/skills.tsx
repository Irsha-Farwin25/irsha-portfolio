import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { skillCategories } from "@/data/skills";

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Skills"
            title="Tools I build with"
            description="Grouped by where they show up in my work — not ranked by arbitrary percentages."
          />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {skillCategories.map((category, i) => (
            <Reveal key={category.key} delay={i * 0.05}>
              <div className="flex h-full flex-col gap-4 rounded-lg border border-border p-6">
                <div>
                  <h3 className="font-semibold tracking-tight">{category.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <li
                      key={skill.name}
                      className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 font-mono text-xs text-foreground/85"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
