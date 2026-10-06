import { GraduationCap, HandHeart, Images, Mic, Newspaper, Trophy } from "lucide-react";
import { SignalDivider } from "@/components/motion/signal";
import { SectionBackdrop } from "@/components/ui/section-backdrop";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { AchievementTabs, type AchievementTab } from "@/components/achievements/achievement-tabs";
import { CertificateFan } from "@/components/achievements/certificate-fan";
import { GalleryAlbums } from "@/components/achievements/gallery-albums";
import { PressCoverage } from "@/components/achievements/press-coverage";
import { getI18n } from "@/lib/i18n/server";
import type { CertificateCategory } from "@/lib/types";

export async function Achievements() {
  const { t, content } = await getI18n();
  const { certificates, gallery, news, volunteering } = content;
  const certTab = (category: CertificateCategory, value: string, label: string, icon: React.ReactNode): AchievementTab => {
    const items = certificates.filter((c) => c.category === category);
    return { value, label, icon, count: items.length, content: <CertificateFan items={items} /> };
  };

  const tabs = [
    certTab("Course", "courses", t.achievements.tabs.courses, <GraduationCap />),
    certTab("Hackathon", "hackathons", t.achievements.tabs.hackathons, <Trophy />),
    certTab("Conference", "conferences", t.achievements.tabs.conferences, <Mic />),
    { value: "news", label: t.achievements.tabs.news, icon: <Newspaper />, count: news.length, content: <PressCoverage /> },
    {
      value: "volunteering",
      label: t.achievements.tabs.volunteering,
      icon: <HandHeart />,
      count: volunteering.reduce((n, album) => n + album.images.length, 0),
      content: <GalleryAlbums albums={volunteering} />,
    },
    {
      value: "gallery",
      label: t.achievements.tabs.gallery,
      icon: <Images />,
      count: gallery.reduce((n, album) => n + album.images.length, 0),
      content: <GalleryAlbums albums={gallery} />,
    },
  ].filter((t) => t.count > 0);

  if (tabs.length === 0) return null;

  return (
    <section id="achievements" className="relative isolate py-16 sm:py-24">
      <SignalDivider />
      <SectionBackdrop side="start" />
      <Container className="flex flex-col gap-12">
        <Reveal>
          <SectionHeading
            eyebrow={t.achievements.eyebrow}
            title={t.achievements.title}
            description={t.achievements.description}
          />
        </Reveal>

        <Reveal>
          <AchievementTabs tabs={tabs} />
        </Reveal>
      </Container>
    </section>
  );
}
