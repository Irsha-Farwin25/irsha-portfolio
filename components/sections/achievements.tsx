import { ExternalLink, GraduationCap, Images, Mic, Newspaper, Trophy } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ImageLightbox } from "@/components/projects/image-lightbox";
import { AchievementTabs, type AchievementTab } from "@/components/achievements/achievement-tabs";
import { CertificateFan } from "@/components/achievements/certificate-fan";
import { certificates, gallery, news } from "@/data/achievements";
import type { CertificateCategory } from "@/lib/types";

const gridSizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw";

const cardClass =
  "group flex h-full overflow-hidden rounded-xl border border-border bg-background transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_40px_-16px] hover:shadow-primary/30 motion-reduce:hover:translate-y-0";

const linkClass =
  "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary";

function NewsGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {news.map((n) => (
        <article key={n.id} className={`${cardClass} flex-col`}>
          {n.image && (
            <div className="relative aspect-[16/10] border-b border-border bg-secondary/40">
              <ImageLightbox src={n.image} alt={n.title} sizes={gridSizes} caption={`${n.title} — ${n.source}`} />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
              <Newspaper className="size-3" /> {n.source}
              {n.date && <span className="text-muted-foreground">· {n.date}</span>}
            </p>
            <h3 className="text-base font-semibold leading-snug tracking-tight">{n.title}</h3>
            {n.summary && <p className="text-sm text-muted-foreground">{n.summary}</p>}
            {n.link && (
              <div className="mt-auto pt-3">
                <a href={n.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Read article <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function GalleryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {gallery.map((g) => (
        <figure key={g.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
          <ImageLightbox
            src={g.src}
            alt={g.caption}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            caption={g.caption}
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-xs font-medium text-white">
            <span className="line-clamp-2">{g.caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Achievements() {
  const certTab = (category: CertificateCategory, value: string, label: string, icon: React.ReactNode): AchievementTab => {
    const items = certificates.filter((c) => c.category === category);
    return { value, label, icon, count: items.length, content: <CertificateFan items={items} /> };
  };

  const tabs = [
    certTab("Course", "courses", "Courses", <GraduationCap />),
    certTab("Hackathon", "hackathons", "Hackathons", <Trophy />),
    certTab("Conference", "conferences", "Conferences", <Mic />),
    { value: "news", label: "News", icon: <Newspaper />, count: news.length, content: <NewsGrid /> },
    { value: "gallery", label: "Gallery", icon: <Images />, count: gallery.length, content: <GalleryGrid /> },
  ].filter((t) => t.count > 0);

  if (tabs.length === 0) return null;

  return (
    <section id="achievements" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <SectionHeading
            eyebrow="Achievements"
            title="Certificates & recognition"
            description="Courses, hackathons, and conferences that have shaped how I build — alongside moments worth remembering."
          />
        </Reveal>

        <Reveal>
          <AchievementTabs tabs={tabs} />
        </Reveal>
      </Container>
    </section>
  );
}
