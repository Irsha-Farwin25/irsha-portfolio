import type { Locale } from "@/lib/i18n/config";
import { site, socialLinks, navItems } from "@/data/site";
import { experience } from "@/data/experience";
import { education } from "@/data/education";
import { projects } from "@/data/projects";
import { publications, labExperiments } from "@/data/research";
import { skillCategories } from "@/data/skills";
import { recommendations } from "@/data/recommendations";
import { certificates, gallery, news, volunteering } from "@/data/achievements";
import * as ar from "@/data/ar";

const EN = {
  site,
  socialLinks,
  navItems,
  experience,
  education,
  projects,
  publications,
  labExperiments,
  skillCategories,
  recommendations,
  certificates,
  news,
  volunteering,
  gallery,
};

export type Content = typeof EN;

const AR: Content = {
  site: ar.siteAr,
  socialLinks: ar.socialLinksAr,
  navItems: ar.navItemsAr,
  experience: ar.experienceAr,
  education: ar.educationAr,
  projects: ar.projectsAr,
  publications: ar.publicationsAr,
  labExperiments: ar.labExperimentsAr,
  skillCategories: ar.skillCategoriesAr,
  recommendations: ar.recommendationsAr,
  certificates: ar.certificatesAr,
  news: ar.newsAr,
  volunteering: ar.volunteeringAr,
  gallery: ar.galleryAr,
};

/** The portfolio content in a language. */
export function getContent(locale: Locale): Content {
  return locale === "ar" ? AR : EN;
}

/** Template text ("[Your role]") the data files still contain; hidden from Arabic pages. */
export function isPlaceholder(value: string | null | undefined) {
  return !!value && /^\[[\s\S]*\]$/.test(value.trim());
}
