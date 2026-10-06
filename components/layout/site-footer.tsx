import Link from "next/link";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { Container } from "@/components/ui/container";
import { ResumeLink } from "@/components/layout/resume-link";
import { getI18n } from "@/lib/i18n/server";

const iconMap = { github: GithubIcon, linkedin: LinkedinIcon, email: Mail } as const;

/** The grid is strongest along the bottom edge and fades out towards the top of the footer. */
const FOOTER_FADE = "linear-gradient(to top, black, transparent 90%)";

export async function SiteFooter({ hasResume }: { hasResume: boolean }) {
  const { t, content } = await getI18n();
  const { navItems, site, socialLinks } = content;
  return (
    <footer className="relative isolate overflow-hidden border-t border-border">
      {/* The hero's dot grid closes the page, with a slow band of light passing through it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ maskImage: FOOTER_FADE, WebkitMaskImage: FOOTER_FADE }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="footer-wave absolute inset-0 bg-[radial-gradient(var(--color-primary)_1.6px,transparent_1.6px)] [background-size:22px_22px] motion-reduce:hidden" />
      </div>
      <Container className="flex flex-col gap-8 py-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="font-mono text-sm font-medium text-foreground">
              {site.name}
              <span className="text-primary">.</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{site.role}</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label={t.nav.footer}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-start gap-3">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon as keyof typeof iconMap] ?? Mail;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {site.name}. {t.footer.builtWith}
            <span className="block pt-1 text-muted-foreground/70">
              {t.footer.avatarCredit}{" "}
              <a
                href="https://www.meshy.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Meshy
              </a>{" "}
              (
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                CC BY 4.0
              </a>
              ) {t.footer.animated}
            </span>
          </p>
          <ResumeLink available={hasResume} variant="ghost" />
        </div>
      </Container>
    </footer>
  );
}
