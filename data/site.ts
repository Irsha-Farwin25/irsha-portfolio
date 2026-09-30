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
  initials: "IF",
  role: "Software Engineer | AI Engineer",
  roleLine: "MSc in Artificial Intelligence | Software Engineer | Independent AI Researcher",
  shortRole: "Software Engineer",
  tagline:
    "Building digital products with software engineering and artificial intelligence.",
  description:
    "I'm Irsha Farwin, a software engineer working on real-world digital platforms while pursuing an MSc in Artificial Intelligence.",
  heroBio:
    "Software Engineer with 3+ years building production systems for government, civil infrastructure, and public-facing platforms, now pivoting into AI safety research through a Master's in Artificial Intelligence, applied LLM deployment work, and first-author research on equitable, statistically honest AI decision support. Direct experience with the practical challenges of putting AI into high-stakes, citizen-facing environments — where grounding, reliability, and trustworthy behavior matter as much as raw capability. Particular interest in avoiding overstated certainty in AI systems that materially affect people's lives.",
  statusPill: "Open to new opportunities",
  currentlyFocus: "MSc in Artificial Intelligence",
  focusAreas: ["Full-Stack", "AI/ML", "GovTech"],
  currentlyShort: "MSc (AI)",
  location: "Sri Lanka",
  email: "rsahanab96@gmail.com",
  resumeUrl: "/resume.pdf",
  url: "https://irshafarwin.dev",
} as const;

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/Irsha-Farwin25", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/irsha-farwin-0a965b177/", icon: "linkedin" },
  { label: "Email", href: `mailto:${site.email}`, icon: "email" },
];

export const navItems: NavItem[] = [
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/projects" },
  { label: "Research", href: "/research" },
  { label: "Skills", href: "/#skills" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Recommendations", href: "/#recommendations" },
  { label: "Contact", href: "/#contact" },
];
