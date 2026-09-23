import { Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { site, socialLinks } from "@/data/site";

const iconMap = { github: GithubIcon, linkedin: LinkedinIcon, email: Mail } as const;

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <div className="flex flex-col gap-6">
            <Eyebrow>Contact</Eyebrow>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Let&apos;s build something meaningful.
            </h2>
            <p className="text-pretty text-muted-foreground">
              Have a project, research idea, or engineering problem you&apos;d like to discuss? I&apos;d
              like to hear about it.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" /> {site.location}
              </div>
              {socialLinks.map((link) => {
                const Icon = iconMap[link.icon as keyof typeof iconMap] ?? Mail;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    <Icon className="size-4 text-primary" /> {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-xl border border-border p-6 sm:p-8">
            <ContactForm />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
