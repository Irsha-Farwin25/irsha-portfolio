import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { HeroTerminalCard } from "@/components/hero/hero-terminal-card";
import { AskAiButton, AskAiPrompt, HeroFlipCard } from "@/components/hero/hero-flip-card";
import { HeroBackground } from "@/components/hero/hero-background";
import { HeroStats } from "@/components/hero/hero-stats";
import { HeroHeadline } from "@/components/hero/hero-headline";
import { ResumeLink } from "@/components/layout/resume-link";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { site, socialLinks } from "@/data/site";
import { resumeExists } from "@/lib/resume";

/** A light sweep across the primary button on hover. */
const SHINE =
  "relative overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1/3 before:-translate-x-[150%] before:-skew-x-12 before:bg-linear-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-[400%] motion-reduce:before:hidden";

export function Hero() {
  const hasResume = resumeExists();
  const github = socialLinks.find((s) => s.icon === "github");
  const linkedin = socialLinks.find((s) => s.icon === "linkedin");
  const email = socialLinks.find((s) => s.icon === "email");
  const iconLinks = [
    linkedin && { ...linkedin, Icon: LinkedinIcon },
    email && { ...email, Icon: Mail },
  ].filter((l) => !!l);

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24">
      <HeroBackground />
      <Container className="flex flex-col gap-14 pb-20 sm:pb-28 lg:gap-16">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-7">
            <Reveal>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/80 shadow-sm">
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
              <h1 className="max-w-[16ch] text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                <span className="sr-only">{site.name}: </span>
                <HeroHeadline text={site.headline} accent={site.headlineAccent} />
              </h1>

              <Reveal delay={0.1}>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
                  <span className="font-semibold text-foreground">{site.name}</span>
                  <span aria-hidden className="h-px w-5 bg-border" />
                  <span className="text-foreground/80">{site.role}</span>
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <p className="max-w-[34rem] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {site.heroIntro}
                </p>
              </Reveal>
            </div>

            {/* One row of actions: the CV and GitHub, then icon-only LinkedIn and email. */}
            <Reveal delay={0.2}>
              <div className="flex flex-wrap items-center gap-3">
                <ResumeLink available={hasResume} variant="default" size="lg" label="Download CV" className={SHINE} />
                {github && (
                  <Button
                    size="lg"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a href={github.href} target="_blank" rel="noopener noreferrer">
                        <GithubIcon data-icon="inline-start" className="size-4" /> GitHub
                        <ExternalLink data-icon="inline-end" className="size-3.5" />
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

          <Reveal delay={0.15} className="mx-auto w-full min-w-0 lg:mx-0">
            <HeroFlipCard>
              <HeroTerminalCard action={<AskAiButton />} footer={<AskAiPrompt />} />
            </HeroFlipCard>
          </Reveal>
        </div>

        {/* Proof points as their own full-width row of cards, closing the hero. */}
        <HeroStats stats={site.heroStats} />
      </Container>
    </section>
  );
}
