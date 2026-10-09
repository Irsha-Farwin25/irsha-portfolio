import { Container } from "@/components/ui/container";
import { SignalDivider } from "@/components/motion/signal";
import { Eyebrow } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ContactComposer } from "@/components/contact/contact-composer";
import { ContactMap } from "@/components/contact/contact-map";
import { CopyEmail, RotatingWord } from "@/components/contact/contact-extras";
import { resumeExists } from "@/lib/resume";
import { getI18n } from "@/lib/i18n/server";

export async function Contact() {
  const { t, content } = await getI18n();
  return (
    <section id="contact" className="relative isolate overflow-hidden py-16 sm:py-24">
      <SignalDivider />
      {/* Soft aurora behind the section, over a dotted world map with a route to the visitor and
          her live status pinned at Colombo. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <ContactMap />
        <div className="contact-aurora absolute -top-24 left-[10%] size-[420px] rounded-full bg-primary/20 blur-3xl" />
        <div className="contact-aurora absolute right-[5%] bottom-0 size-[360px] rounded-full bg-chart-2/15 blur-3xl [animation-delay:-6s]" />
      </div>

      <Container className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <Reveal>
          <div className="flex flex-col gap-5">
            {/* The words sit on a soft shadow (no visible shape) that dims the map behind them. */}
            <div className="relative flex flex-col gap-5">
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-16 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_closest-side,var(--background)_45%,transparent)] opacity-90"
              />
              <Eyebrow>{t.contact.eyebrow}</Eyebrow>
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.contact.headline} <RotatingWord words={t.contact.rotating} />
              </h2>
              <p className="max-w-md text-pretty text-muted-foreground">
                {t.contact.intro}
              </p>
              {/* Her status shows as a tag on the map, which screen readers skip; say it here. */}
              <p className="sr-only">{content.site.statusPill}</p>
            </div>
            <CopyEmail />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {/* The recruiter pack lives on the message card's second side. */}
          <ContactComposer hasResume={resumeExists()} />
        </Reveal>
      </Container>
    </section>
  );
}
