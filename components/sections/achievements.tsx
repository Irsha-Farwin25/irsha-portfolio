import { GraduationCap, HandHeart, Images, Mic, Newspaper, Trophy } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { AchievementTabs, type AchievementTab } from "@/components/achievements/achievement-tabs";
import { CertificateFan } from "@/components/achievements/certificate-fan";
import { GalleryAlbums } from "@/components/achievements/gallery-albums";
import { NewsClippings } from "@/components/achievements/news-clippings";
import { certificates, gallery, news, volunteering } from "@/data/achievements";
import type { CertificateCategory } from "@/lib/types";

export function Achievements() {
  const certTab = (category: CertificateCategory, value: string, label: string, icon: React.ReactNode): AchievementTab => {
    const items = certificates.filter((c) => c.category === category);
    return { value, label, icon, count: items.length, content: <CertificateFan items={items} /> };
  };

  const tabs = [
    certTab("Course", "courses", "Courses", <GraduationCap />),
    certTab("Hackathon", "hackathons", "Hackathons", <Trophy />),
    certTab("Conference", "conferences", "Conferences", <Mic />),
    { value: "news", label: "News", icon: <Newspaper />, count: news.length, content: <NewsClippings news={news} /> },
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
