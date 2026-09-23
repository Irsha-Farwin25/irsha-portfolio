import { Award } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { achievements } from "@/data/achievements";

export function Achievements() {
  const items = achievements.filter((a) => !a.isPlaceholder);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-border py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <Reveal>
          <Eyebrow>Achievements</Eyebrow>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <div className="flex gap-3 rounded-lg border border-border p-4">
                <Award className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium leading-snug">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
