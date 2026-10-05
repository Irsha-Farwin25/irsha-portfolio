import type { Locale } from "@/lib/i18n/config";
import { getContent } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Certificate } from "@/lib/types";

/**
 * Everything the avatar says, in English and Modern Standard Arabic. Built from the same data the
 * page renders, so the lines stay accurate. Short and punchy: a hook, then the one fact that
 * matters.
 */

/** "A, B and C". */
function list(items: string[]) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** "1 client", "4 colleagues". */
function count(n: number, noun: string, plural = `${noun}s`) {
  return `${n} ${n === 1 ? noun : plural}`;
}

/** Arabic counted nouns: the noun's form depends on the number (1, 2, 3–10, 11+). */
function countAr(n: number, forms: { one: string; two: string; few: string; many: string }) {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  return `${n} ${n <= 10 ? forms.few : forms.many}`;
}

/** Project titles without placeholder brackets or a " — subtitle". */
function shortTitle(title: string) {
  return title.replace(/[[\]]/g, "").split(" — ")[0];
}

/** Click with a mouse, tap on a touch screen. */
function verb(locale: Locale, touch: boolean) {
  if (locale === "ar") return touch ? "اضغط" : "انقر";
  return touch ? "Tap" : "Click";
}

/** What she says as the visitor reaches each home-page section (by the section's element id). */
export function sectionLines(locale: Locale): Record<string, string> {
  const { site, experience, projects, publications, skillCategories, recommendations } = getContent(locale);
  const current = experience.find((e) => e.endDate === null) ?? experience[0];
  const previous = experience.find((e) => e !== current);
  const publication = publications[0];
  const topSkills = skillCategories
    .slice(0, 3)
    .map((c) => c.skills[0]?.name)
    .filter((s): s is string => !!s);

  if (locale === "ar") {
    const statuses = getDictionary("ar").research.statuses;
    return {
      experience: current
        ? `تعمل ${current.endDate === null ? "الآن" : "مؤخرًا"} ${current.role} في ${current.organization}.${previous ? ` وقبلها في ${previous.organization}.` : ""}`
        : `مسيرة ${site.firstName} المهنية حتى الآن.`,
      projects: `${countAr(projects.length, { one: "مشروع واحد", two: "مشروعان", few: "مشاريع", many: "مشروعًا" })} لمستخدمين حقيقيين. من المنصات الحكومية إلى الذكاء الاصطناعي.`,
      research: publication
        ? `${statuses[publication.status] ?? publication.status} في ${publication.venue}: ذكاء اصطناعي من أجل إرشاد جامعي أكثر إنصافًا.`
        : `أبحاث ${site.firstName} وتجاربها.`,
      skills: `${topSkills.join("، ")}. من الواجهات الأمامية إلى الذكاء الاصطناعي، بشكل متكامل.`,
      recommendations: `${countAr(recommendations.length, { one: "شخص واحد", two: "شخصان", few: "أشخاص", many: "شخصًا" })} يشهدون لها. اقرأ لماذا.`,
      contact: `تبحث عن موظفين؟ إنها ${site.statusPill}. راسلها الآن.`,
    };
  }

  return {
    experience: current
      ? `Now a ${current.role} at the ${current.organization}.${previous ? ` Before that, ${previous.organization}.` : ""}`
      : `${site.firstName}'s work, so far.`,
    projects: `${count(projects.length, "project")}, real users. Government platforms to AI.`,
    research: publication
      ? `${publication.status} at ${publication.venue}: AI for fairer university guidance.`
      : `${site.firstName}'s research and experiments.`,
    skills: `${topSkills.join(". ")}. Frontend to AI, end to end.`,
    recommendations: `${count(recommendations.length, "person", "people")} vouch for her. Read why.`,
    contact: `Hiring? She's ${site.statusPill.toLowerCase()}. Say hi.`,
  };
}

/**
 * What she says once the visitor has stayed on a page other than home (home is narrated section
 * by section instead). Null when the page has nothing to introduce.
 */
export function pageLine(pathname: string, locale: Locale): string | null {
  const { projects, publications } = getContent(locale);
  const ar = locale === "ar";
  if (pathname === "/projects") {
    return ar
      ? "جميع المشاريع في مكان واحد. صنّفها حسب الفئة، أو ابحث بالتقنية."
      : `All ${count(projects.length, "project")}. Filter by category, or search by tech.`;
  }
  if (pathname === "/research") {
    const publication = publications[0];
    if (ar) {
      return publication
        ? `ورقتها البحثية في ${publication.venue}، وتجاربها الحالية في الذكاء الاصطناعي.`
        : "تجاربها الحالية في الذكاء الاصطناعي.";
    }
    return publication
      ? `Her ${publication.venue} paper, plus the AI she's experimenting with.`
      : "The AI she's experimenting with.";
  }
  const slug = pathname.match(/^\/projects\/([^/]+)$/)?.[1];
  const project = slug && projects.find((p) => p.slug === slug);
  if (project) {
    if (project.pitch) return project.pitch;
    return ar
      ? `${shortTitle(project.title)}. مبني باستخدام ${project.technologies.join(" و")}.`
      : `${shortTitle(project.title)}. Built with ${list(project.technologies)}.`;
  }
  return null;
}

/**
 * What she says about the certificate under the spotlight: its own narration, else its
 * description, else a line built from who issued it and when.
 */
export function certificateLine(c: Certificate, locale: Locale): string {
  if (c.narration) return c.narration;
  if (c.description) return c.description;
  if (locale === "ar") {
    const when = c.date ? ` في ${c.date}` : "";
    switch (c.category) {
      case "Hackathon":
        return `شاركت في هذا الهاكاثون الذي نظّمه ${c.issuer}${when}.`;
      case "Conference":
        return `حضرت هذا المؤتمر الذي استضافه ${c.issuer}${when}.`;
      default:
        return `أتمّت هذه الدورة مع ${c.issuer.replace(" · ", " عبر ")}${when}.`;
    }
  }
  const when = c.date ? ` in ${c.date}` : "";
  switch (c.category) {
    case "Hackathon":
      return `She took part in this one, run by ${c.issuer}${when}.`;
    case "Conference":
      return `She attended this one, hosted by ${c.issuer}${when}.`;
    default:
      // "Meta · Coursera" reads as "Meta on Coursera".
      return `She completed this with ${c.issuer.replace(" · ", " on ")}${when}.`;
  }
}

/** Roughly how long the avatar takes to type out (say) a line in her bubble, in ms. */
export function narrationMs(line: string) {
  return 150 + line.length * 24 + (line.match(/[.,!?،؟]/g)?.length ?? 0) * 130;
}

/** Her opening line for a first-time visitor: a hook for hiring managers and how to start. */
export function introLine(locale: Locale, touch: boolean): string {
  const { site } = getContent(locale);
  const v = verb(locale, touch);
  return locale === "ar"
    ? `مرحبًا، أنا المرشدة الذكية لـ${site.firstName} 👋 تبحث عن موظفين؟ ${v} عليّ، وسأخبرك لماذا هي الأنسب.`
    : `Hi, I'm ${site.firstName}'s AI guide 👋 Hiring? ${v} me. I'll tell you why she fits.`;
}

/** Her short greeting when narration is muted (no intro speech). */
export function mutedGreeting(locale: Locale, touch: boolean): string {
  const { site } = getContent(locale);
  const v = verb(locale, touch);
  return locale === "ar" ? `${v} عليّ لتسأل عن ${site.firstName} 👋` : `${v} me to ask about ${site.firstName} 👋`;
}

/** What she says to a returning visitor who has chatted with her before. */
export function returnLine(locale: Locale): string {
  return locale === "ar" ? "أهلًا بعودتك! 👋 اسألني عن أي شيء." : "Welcome back! 👋 Ask me anything.";
}

/** Nudges for a visitor who hasn't clicked her yet, said one at a time during quiet moments. */
export function nudgeLines(locale: Locale, touch: boolean): string[] {
  const { site } = getContent(locale);
  const years = site.heroStats.find((s) => s.icon === "briefcase")?.value;
  const v = verb(locale, touch);
  if (locale === "ar") {
    return [
      `وقتك ضيق؟ ${v} عليّ لعرض سريع في 30 ثانية.`,
      `لديك وظيفة شاغرة؟ ${v} عليّ، وسأطابق خبرتها معها.`,
      typeof years === "number"
        ? `أكثر من ${years} سنوات في بناء أنظمة حقيقية. ${v} عليّ لتعرف القصة.`
        : `${v} عليّ لتعرف قصة أعمالها.`,
    ];
  }
  return [
    `Short on time? ${v} me for a 30-second pitch.`,
    `Got a role open? ${v} me. I'll match her to it.`,
    typeof years === "number"
      ? `${years}+ years shipping real systems. ${v} me for the story.`
      : `${v} me for the story behind her work.`,
  ];
}
