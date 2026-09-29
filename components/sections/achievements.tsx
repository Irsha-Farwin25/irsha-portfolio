import { ExternalLink, GraduationCap, HandHeart, Images, Mic, Newspaper, Trophy } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ImageLightbox } from "@/components/projects/image-lightbox";
import { AchievementTabs, type AchievementTab } from "@/components/achievements/achievement-tabs";
import { CertificateFan } from "@/components/achievements/certificate-fan";
import { GalleryAlbums } from "@/components/achievements/gallery-albums";
import { certificates, gallery, news, volunteering } from "@/data/achievements";
import type { CertificateCategory } from "@/lib/types";

const cardClass =
  "group flex overflow-hidden rounded-xl border border-border bg-background transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_40px_-16px] hover:shadow-primary/30 motion-reduce:hover:translate-y-0";

const linkClass =
  "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary";

type NewsEntry = (typeof news)[number];

function NewsSource({ n }: { n: NewsEntry }) {
  return (
    <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
      <Newspaper className="size-3 shrink-0" /> <span className="truncate">{n.source}</span>
      {n.date && <span className="shrink-0 text-muted-foreground">· {n.date}</span>}
    </p>
  );
}

function NewsLinks({ n }: { n: NewsEntry }) {
  if (!n.link && !n.extraLinks?.length) return null;
  return (
    <div className="mt-auto flex flex-wrap gap-2 pt-2">
      {n.link && (
        <a href={n.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {n.linkLabel ?? "Read article"} <ExternalLink className="size-3" />
        </a>
      )}
      {n.extraLinks?.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {l.label} <ExternalLink className="size-3" />
        </a>
      ))}
    </div>
  );
}

/** Featured layout: the first item as a large card, the rest as compact rows beside it. */
function NewsGrid() {
  const [featured, ...rest] = news;

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <article className={`${cardClass} flex-col ${rest.length > 0 ? "lg:col-span-3" : "lg:col-span-5"}`}>
        {featured.image && (
          <div className="relative aspect-[16/10] border-b border-border bg-secondary/40">
            <ImageLightbox
              src={featured.image}
              alt={featured.title}
              sizes="(min-width: 1024px) 660px, 100vw"
              caption={`${featured.title} — ${featured.source}`}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 p-5">
          <NewsSource n={featured} />
          <h3 className="text-lg font-semibold leading-snug tracking-tight">{featured.title}</h3>
          {featured.summary && <p className="text-sm text-muted-foreground">{featured.summary}</p>}
          <NewsLinks n={featured} />
        </div>
      </article>

      {rest.length > 0 && (
        <div className="flex flex-col gap-5 lg:col-span-2">
          {rest.map((n) => (
            <article key={n.id} className={`${cardClass} flex-1 flex-row`}>
              {n.image && (
                <div className="relative w-28 shrink-0 border-r border-border bg-secondary/40 sm:w-36">
                  <ImageLightbox src={n.image} alt={n.title} sizes="144px" caption={`${n.title} — ${n.source}`} />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
                <NewsSource n={n} />
                <h3 className="line-clamp-3 text-sm font-semibold leading-snug tracking-tight">{n.title}</h3>
                <NewsLinks n={n} />
              </div>
            </article>
          ))}
        </div>
      )}
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
    {
      value: "volunteering",
      label: "Volunteering",
      icon: <HandHeart />,
      count: volunteering.reduce((n, album) => n + album.images.length, 0),
      content: <GalleryAlbums albums={volunteering} />,
    },
    {
      value: "gallery",
      label: "Gallery",
      icon: <Images />,
      count: gallery.reduce((n, album) => n + album.images.length, 0),
      content: <GalleryAlbums albums={gallery} />,
    },
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
