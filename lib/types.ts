export type SkillCategoryKey = "frontend" | "backend" | "ai-data" | "tools";

export interface SocialLink {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "email" | "twitter" | "researchgate";
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  location: string;
  locationType: "On-site" | "Remote" | "Hybrid";
  summary: string;
  responsibilities: string[];
  technologies: string[];
  isPlaceholder?: boolean;
  /** Letters for the company badge, e.g. "UDA". Falls back to the organisation's initials. */
  monogram?: string;
  /** Company logo under /public, shown in place of the monogram. */
  logo?: string;
  /** "cover" fills the badge (square logos); "contain" sits on white with padding (default). */
  logoFit?: "cover" | "contain";
  /** Slugs of projects built in this role; shown as "Shipped here" links. */
  projects?: string[];
  /** Who the work was for: a government body, or an international company. */
  sector?: "government" | "international";
  /** One line on what the organisation is, for the "About the workplace" block. */
  about?: string;
  /**
   * For remote roles: where the work was done from, and the time difference to the employer
   * in hours (a range when daylight saving shifts it), e.g. Colombo, 4.5–5.5 h to Sydney.
   */
  remote?: { from: string; gapHours: [number, number] };
  /** The organisation's official website. */
  website?: string;
  /** Headcount band, e.g. "51–200", shown as a chip in "About the workplace". */
  teamSize?: string;
  /**
   * Headline results from the role, each shown as an Experience stat card, e.g. LKR 10M+ in client
   * payments. `segments` lights that many cells in the card's meter (e.g. months).
   */
  headlineStats?: { prefix?: string; value: number; suffix?: string; label: string; proof: string; segments: number }[];
  /** A public business-register entry proving the organisation, e.g. its ABN record. */
  registry?: { id: string; href: string };
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  location: string;
  description: string;
  status: "in-progress" | "completed";
  isPlaceholder?: boolean;
  /**
   * Machine-readable months ("2026-01") for the progress bar. The bar shows a percentage only
   * when `expectedEnd` is set; until then it shows "in progress".
   */
  period?: { start: string; expectedEnd?: string };
  /** What she's studying right now, e.g. "Deep Learning" (shown as "Currently studying"). */
  currentModule?: string;
  /** Focus areas or key modules, listed on the back of the card. */
  modules?: string[];
  /** Final result, e.g. "First Class Honours". */
  result?: string;
  /** Final-year thesis or project title. */
  thesis?: string;
  /** How the degree is studied, e.g. "Part-time, alongside work". */
  mode?: string;
  /** The institution's own site. */
  website?: string;
  /** One line on the institution's standing, for readers who don't know it; **phrases** are highlighted. */
  about?: string;
  /** University crest under /public, e.g. "/education/moratuwa.png". Falls back to `monogram`. */
  logo?: string;
  /** Short letters for the crest badge when there's no logo, e.g. "UoM". */
  monogram?: string;
  /** Where this study shows up in her work: chips linking to projects, research, etc. */
  links?: { label: string; href: string }[];
}

export interface Skill {
  name: string;
  /** Key into the tech icon registry (components/icons/tech-icons.tsx). */
  icon?: string;
}

export interface SkillCategory {
  key: SkillCategoryKey;
  title: string;
  description: string;
  skills: Skill[];
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  /** What the avatar says on the project's page: one short, punchy line. */
  pitch?: string;
  category: string;
  technologies: string[];
  /** Thumbnail path under /public, e.g. "/projects/my-project.png". Falls back to a category icon. */
  image?: string;
  role?: string;
  github?: string;
  liveUrl?: string;
  featured?: boolean;
  isPlaceholder?: boolean;
  caseStudy?: ProjectCaseStudy;
}

export interface ProjectCaseStudy {
  overview: string;
  problem: string;
  context: string;
  myRole: string;
  solution: string;
  architecture: string;
  keyFeatures: string[];
  challenges: string[];
  decisions: string[];
  outcome: string;
}

export type ExperimentStatus = "Research" | "Prototype" | "Experiment" | "In Development";

export interface LabExperiment {
  id: string;
  title: string;
  status: ExperimentStatus;
  description: string;
  technologies: string[];
  github?: string;
  demo?: string;
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: string;
  area: string;
  summary: string;
  link?: string;
  status: "Presented" | "Accepted" | "In Progress" | "Submitted";
  /** Slug of the project this research produced; shown as its live prototype. */
  project?: string;
  /** Supporting material, labelled by kind so the labels can be translated. */
  resources?: { kind: "slides" | "proceedings"; href: string }[];
}

export type CertificateCategory = "Course" | "Hackathon" | "Conference";

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  category: CertificateCategory;
  date?: string;
  description?: string;
  /** What the avatar says when it's under the spotlight (falls back to the description). */
  narration?: string;
  /** Path under /public, e.g. "/achievements/certificates/aws.jpg" */
  image?: string;
  /** Verification / credential URL */
  link?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  /** Publication or outlet, e.g. "Daily News" */
  source: string;
  /** Items about the same event share a key (e.g. "uda-payments"), so each can list the others. */
  story?: string;
  date?: string;
  summary?: string;
  /** Path under /public, e.g. "/achievements/news/icode.jpg" */
  image?: string;
  /** Link to the original article */
  link?: string;
  /** Button text for the link; defaults to "Read article" */
  linkLabel?: string;
  /** Extra buttons shown after the main link */
  extraLinks?: { label: string; href: string }[];
}

/**
 * One event the press covered, grouping the clippings that share its `story` key: what it was,
 * her part in it, and what it achieved.
 */
export interface NewsStory {
  /** Matches `NewsItem.story`. */
  id: string;
  /** The news section it ran under, shown as the kicker (e.g. "GovTech", "Research"). */
  section: string;
  title: string;
  /** Her part in it, shown as a chip; `kind` picks its colour. */
  role: string;
  kind: "lead" | "team" | "author";
  /** One line on what it achieved. */
  impact: string;
  date: string;
}

export interface GalleryImage {
  id: string;
  /** Path under /public, e.g. "/achievements/gallery/award-night.jpg" */
  src: string;
  caption: string;
}

/** A group of gallery photos from one event, shown as a single card. */
export interface GalleryAlbum {
  id: string;
  title: string;
  date?: string;
  /** The first image is the album cover. */
  images: GalleryImage[];
}

export interface Recommendation {
  id: string;
  name: string;
  /** Recommender's job title / company, e.g. "Software Engineer, UnicornShift" */
  title: string;
  /** How they know each other, e.g. "Worked with Irsha on the same team" */
  relationship: string;
  date: string;
  /** Full recommendation text. Use "\n\n" to separate paragraphs. */
  quote: string;
  /** LinkedIn-verified recommender (shown with a small badge). */
  verified?: boolean;
  /** Short relationship label shown on the card. */
  kind: "Client" | "Teammate" | "Peer";
  /**
   * Pull-quote shown as the card headline. Must be copied verbatim from `quote`
   * so it can be highlighted in the full text.
   */
  highlight: string;
  /** Shown as the large spotlight card. Only the first featured item is used. */
  featured?: boolean;
  /** Id of the role in data/experience.ts where they worked together (shows its logo and a link). */
  experience?: string;
  /** Words inside `highlight` a highlighter marks on the note. Must be copied verbatim from it. */
  keyPhrase?: string;
}
