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
  /** Final result, e.g. "First Class Honours" (back of the card). */
  result?: string;
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
}
