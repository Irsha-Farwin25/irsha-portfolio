import { ExternalLink, FlaskConical, GraduationCap, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { HeroTerminalCard } from "@/components/hero/hero-terminal-card";
import { AskAiButton, HeroFlipCard } from "@/components/hero/hero-flip-card";
import { HeroBackground } from "@/components/hero/hero-background";
import { ResumeLink } from "@/components/layout/resume-link";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { site, socialLinks } from "@/data/site";
import { resumeExists } from "@/lib/resume";

const socialIconMap = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  email: Mail,
  researchgate: FlaskConical,
} as const;

const metaChips = [
  { icon: MapPin, label: site.location },
  { icon: GraduationCap, label: site.currentlyFocus },
];

export function Hero() {
  const hasResume = resumeExists();
  const github = socialLinks.find((s) => s.icon === "github");
  const linkedin = socialLinks.find((s) => s.icon === "linkedin");
  const email = socialLinks.find((s) => s.icon === "email");
  const connectLinks = [linkedin, email].filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24">
      <HeroBackground />
      <Container className="grid items-center gap-14 pb-20 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-6">
          <Reveal>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/80 shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-4/60" />
                <span className="relative inline-flex size-2 rounded-full bg-chart-4" />
              </span>
              {site.statusPill}
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {site.name.split(" ")[0]}{" "}
              <span className="text-primary">{site.name.split(" ").slice(1).join(" ")}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-pretty text-base font-semibold text-foreground sm:text-lg">
              {site.roleLine}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
              {site.heroBio}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ResumeLink available={hasResume} variant="default" size="lg" label="Download Resume / CV" />
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
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="flex flex-col gap-2.5 pt-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                Connect
              </span>
              <div className="flex flex-wrap gap-2">
                {connectLinks.map((link) => {
                  const Icon = socialIconMap[link.icon as keyof typeof socialIconMap];
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {Icon ? <Icon className="size-3.5" /> : null}
                      {link.label}
                      {link.icon !== "email" && <ExternalLink className="size-3" />}
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <dl className="flex flex-wrap gap-x-5 gap-y-2 pt-2 font-mono text-xs text-muted-foreground">
              {metaChips.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="size-3.5 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mx-auto w-full min-w-0 lg:mx-0">
          <HeroFlipCard>
            <HeroTerminalCard action={<AskAiButton />} />
          </HeroFlipCard>
        </Reveal>
      </Container>
    </section>
  );
}
