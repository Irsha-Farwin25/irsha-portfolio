import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { HeroTerminalCard } from "@/components/hero/hero-terminal-card";
import { AskAiButton, AskAiPrompt, HeroFlipCard } from "@/components/hero/hero-flip-card";
import { HeroBackground } from "@/components/hero/hero-background";
import { CareerStats } from "@/components/experience/experience-explorer";
import { HeroHeadline } from "@/components/hero/hero-headline";
import { ResumeLink } from "@/components/layout/resume-link";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { getI18n } from "@/lib/i18n/server";
import { resumeExists } from "@/lib/resume";

/** A light sweep across the primary button on hover. */
const SHINE =
  "relative overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1/3 before:-translate-x-[150%] before:-skew-x-12 before:bg-linear-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-[400%] motion-reduce:before:hidden";

export async function Hero() {
  const { t, content } = await getI18n();
  const { site, socialLinks } = content;
  const hasResume = resumeExists();
  const github = socialLinks.find((s) => s.icon === "github");
  const linkedin = socialLinks.find((s) => s.icon === "linkedin");
  const email = socialLinks.find((s) => s.icon === "email");
  const iconLinks = [
    linkedin && { ...linkedin, Icon: LinkedinIcon },
    email && { ...email, Icon: Mail },
  ].filter((l) => !!l);

  return (
    // On large screens the hero fills the viewport below the fixed header (4rem), so the stat row
    // rests near the bottom of the screen whatever its height, rather than floating up under the intro.
    <section className="relative flex flex-col overflow-hidden pt-10 sm:pt-12 lg:min-h-[calc(100svh-4rem)]">
      <HeroBackground />
      {/* The intro centres in whatever room is left; the gap below is only the minimum. */}
      <Container className="flex flex-1 flex-col gap-10 pb-20 sm:gap-12 sm:pb-28 lg:gap-10 lg:pb-12">
        <div className="grid items-center gap-14 lg:flex-1 lg:grid-cols-[1.1fr_0.9fr] lg:content-center lg:gap-12">
          <div className="flex min-w-0 flex-col gap-7">
            <Reveal>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/80 shadow-sm xl:px-4 xl:py-2 xl:text-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-4/60" />
                  <span className="relative inline-flex size-2 rounded-full bg-chart-4" />
                </span>
                {site.statusPill}
              </span>
            </Reveal>

            {/* The positioning statement leads; her name and role sit beneath it as the byline. */}
            <div className="flex flex-col gap-5">
              {/* The words animate in themselves (blur-in, one by one), so no Reveal wrapper here. */}
              <h1 className="max-w-[16ch] text-balance text-[2.8rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.7rem] lg:text-[3.7rem] xl:text-[4.25rem] 2xl:text-[4.7rem]">
                <span className="sr-only">{site.name}: </span>
                <HeroHeadline text={site.headline} accent={site.headlineAccent} decode={site.headlineDecode} />
              </h1>

              {/* Her name, role and credentials sit beside her photo in the card. */}
              <Reveal delay={0.1}>
                <p className="max-w-[36rem] text-pretty text-base leading-relaxed text-foreground/75 sm:text-lg">
                  {site.heroIntro}
                </p>
              </Reveal>
            </div>

            {/* One row of actions: the CV and GitHub, then icon-only LinkedIn and email. */}
            <Reveal delay={0.2}>
              <div className="flex flex-wrap items-center gap-3">
                <ResumeLink available={hasResume} variant="default" size="lg" label={t.resume.download} className={SHINE} />
                {github && (
                  <Button
                    size="lg"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a href={github.href} target="_blank" rel="noopener noreferrer">
                        <GithubIcon data-icon="inline-start" className="size-4" /> GitHub
                        <ExternalLink data-icon="inline-end" className="size-3.5 rtl:-scale-x-100" />
                      </a>
                    }
                  />
                )}
                <span aria-hidden className="mx-1 hidden h-6 w-px bg-border sm:block" />
                {iconLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right-aligned on large screens, so the card's edge lines up with the stat row below. */}
          <Reveal delay={0.15} className="flex w-full min-w-0 justify-center lg:justify-end">
            <HeroFlipCard>
              <HeroTerminalCard action={<AskAiButton />} footer={<AskAiPrompt />} />
            </HeroFlipCard>
          </Reveal>
        </div>

        {/* Career impact as its own full-width row of cards, closing the hero. */}
        <CareerStats />
      </Container>
    </section>
  );
}
