import type { NavItem, SocialLink } from "@/lib/types";

/**
 * PLACEHOLDER CONTENT — update before launch:
 * - `url` is a placeholder domain (used for SEO metadata/canonical URLs) — swap
 *   in the real deployed domain once you have one.
 * - `email` and `socialLinks` (GitHub/LinkedIn) are real.
 * - `resumeUrl` points to /resume.pdf — the Resume button auto-detects
 *   whether that file exists in /public and shows "coming soon" until it does.
 */
export const site = {
  name: "Irsha Farwin",
  /** Used in sentences ("Irsha's AI guide") and by the spoken voice. */
  firstName: "Irsha",
  initials: "IF",
  /** Her title everywhere it appears (hero byline, profile card, footer, page title). */
  role: "Software Engineer & AI Researcher",
  roleLine: "MSc in Artificial Intelligence | Software Engineer | Independent AI Researcher",
  shortRole: "Software Engineer",
  tagline:
    "Building digital products with software engineering and artificial intelligence.",
  description:
    "I'm Irsha Farwin, a software engineer working on real-world digital platforms while pursuing an MSc in Artificial Intelligence.",
  heroBio:
    "Software Engineer with 4+ years building production systems for government, civil infrastructure, and public-facing platforms, now pivoting into AI safety research through a Master's in Artificial Intelligence, applied LLM deployment work, and first-author research on equitable, statistically honest AI decision support. Direct experience with the practical challenges of putting AI into high-stakes, citizen-facing environments — where grounding, reliability, and trustworthy behavior matter as much as raw capability. Particular interest in avoiding overstated certainty in AI systems that materially affect people's lives.",
  /** Hero headline; the `headlineAccent` phrase inside it is highlighted. */
  headline: "I build software that unlocks human potential",
  headlineAccent: "human potential",
  /**
   * Words that take turns in the headline, each "decoding" (scrambling, then resolving) into the
   * next. The first must appear in `headline`; each must read correctly in the sentence.
   */
  headlineDecode: ["software", "AI"],
  /** The short hero intro (the full `heroBio` above feeds the AI chat). */
  heroIntro:
    "Turning research on trustworthy, grounded AI into production systems for government and public-facing platforms.",
  /**
   * Headline facts for the chat assistant's lines (e.g. years of experience). The hero's stat
   * cards now come from the work history instead (CareerStats).
   */
  heroStats: [
    { value: 4, suffix: "+ yrs", label: "Production engineering", icon: "briefcase" },
    { value: "MSc", label: "Artificial Intelligence", icon: "graduation" },
    { value: "ICODE '26", label: "Research paper presented", icon: "paper" },
  ],
  /** Credentials shown under her name in the hero. `icon` is "graduation" or "paper". */
  credentials: [
    { icon: "graduation", label: "MSc in AI (ongoing)" },
    { icon: "paper", label: "ICODE '26 author" },
  ],
  statusPill: "Open to new opportunities",
  /** Two lines a recruiter can paste straight into their notes (the Contact section's "Copy bio"). */
  recruiterBio:
    "Irsha Farwin, Software Engineer & AI Researcher (Sri Lanka). 4+ years building production systems for government and public platforms (React, Next.js, Laravel). Pursuing an MSc in AI, with first-author research presented at ICODE 2026.",
  currentlyFocus: "MSc in Artificial Intelligence",
  focusAreas: ["Full-Stack", "AI/ML", "GovTech"],
  currentlyShort: "MSc (AI)",
  location: "Sri Lanka",
  email: "rsahanab96@gmail.com",
  resumeUrl: "/resume.pdf",
  url: "https://irshafarwin.dev",
};

export type Site = typeof site;

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/Irsha-Farwin25", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/irsha-farwin-0a965b177/", icon: "linkedin" },
  { label: "Email", href: `mailto:${site.email}`, icon: "email" },
];

export const navItems: NavItem[] = [
  { label: "Experience", href: "/#experience" },
  // Sections on the home page; each one's "All …" button leads on to its full page.
  { label: "Projects", href: "/#projects" },
  { label: "Research", href: "/#research" },
  { label: "Skills", href: "/#skills" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Recommendations", href: "/#recommendations" },
  { label: "Contact", href: "/#contact" },
];
