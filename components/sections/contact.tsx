import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ContactComposer } from "@/components/contact/contact-composer";
import { CopyEmail, LiveStatus, RecruiterPack, RotatingWord } from "@/components/contact/contact-extras";
import { resumeExists } from "@/lib/resume";
import { getI18n } from "@/lib/i18n/server";

export async function Contact() {
  const { t } = await getI18n();
  return (
    <section id="contact" className="relative isolate scroll-mt-24 overflow-hidden border-t border-border py-20 sm:py-28">
      {/* Soft aurora behind the section */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="contact-aurora absolute -top-24 left-[10%] size-[420px] rounded-full bg-primary/20 blur-3xl" />
        <div className="contact-aurora absolute right-[5%] bottom-0 size-[360px] rounded-full bg-chart-2/15 blur-3xl [animation-delay:-6s]" />
      </div>

      <Container className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <Reveal>
          <div className="flex flex-col gap-5">
            <Eyebrow>{t.contact.eyebrow}</Eyebrow>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.contact.headline} <RotatingWord words={t.contact.rotating} />
            </h2>
            <p className="max-w-md text-pretty text-muted-foreground">
              {t.contact.intro}
            </p>
            <LiveStatus />
            <CopyEmail />
            <RecruiterPack hasResume={resumeExists()} />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactComposer />
        </Reveal>
      </Container>
    </section>
  );
}
