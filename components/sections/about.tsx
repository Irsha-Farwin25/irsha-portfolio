import { GraduationCap, Languages, MapPin, Plane } from "lucide-react";
import { SignalDivider } from "@/components/motion/signal";
import { SectionBackdrop } from "@/components/ui/section-backdrop";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { AboutValues } from "@/components/about/about-values";
import { getI18n } from "@/lib/i18n/server";

/** Renders **marked** phrases in the accent gradient, as the hero highlights its key words. */
function highlight(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <span key={i} className="bg-linear-to-r from-primary to-chart-2 bg-clip-text font-semibold text-transparent rtl:bg-linear-to-l">
        {part}
      </span>
    ) : (
      part
    )
  );
}

/**
 * Who she is beyond the work: her story (a large editorial lead, then two shorter paragraphs)
 * beside what she cares about, and a slim strip of the facts a recruiter abroad looks for first.
 */
export async function About() {
  const { t } = await getI18n();
  const a = t.about;
  const [lead, ...rest] = a.paragraphs;
  const facts = [
    { Icon: MapPin, label: a.facts.based, value: a.facts.basedValue },
    { Icon: Plane, label: a.facts.openTo, value: a.facts.openToValue },
    { Icon: Languages, label: a.facts.languages, value: a.facts.languagesValue },
    { Icon: GraduationCap, label: a.facts.now, value: a.facts.nowValue },
  ];

  return (
    <section id="about" className="relative isolate py-16 sm:py-24">
      <SignalDivider />
      <SectionBackdrop side="end" />
      <Container className="flex flex-col gap-10">
        <Reveal>
          <div className="flex flex-col gap-4">
            <Eyebrow>{a.eyebrow}</Eyebrow>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{a.title}</h2>
          </div>
        </Reveal>

        {/* The story beside what she cares about, starting level with each other. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <Reveal delay={0.05}>
            <div className="flex flex-col gap-5">
              <p className="text-pretty text-lg leading-relaxed text-foreground/90 sm:text-xl">{highlight(lead)}</p>
              {/* The rest of the story, set off by an accent rule. */}
              <div className="flex flex-col gap-4 border-s-2 border-primary/30 ps-5 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                {rest.map((p) => (
                  <p key={p}>{highlight(p)}</p>
                ))}
              </div>
            </div>
          </Reveal>

          <AboutValues label={a.valuesLabel} values={a.values} />
        </div>

        {/* The facts a recruiter abroad looks for first: one slim strip, four cells. */}
        <Reveal delay={0.1}>
          <dl className="grid overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex gap-3 border-border px-4 py-3.5 not-last:border-b sm:nth-[odd]:border-e lg:border-b-0 lg:not-last:border-e"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
                  <dd className="text-[13px] font-medium leading-snug">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
