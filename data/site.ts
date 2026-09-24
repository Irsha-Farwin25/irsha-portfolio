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
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/projects" },
  { label: "Research", href: "/research" },
  { label: "Skills", href: "/#skills" },
  { label: "Contact", href: "/#contact" },
];

export const aboutParagraphs = [
  "I'm a software engineer working in the government technology sector, where I build and maintain production web platforms used for public-facing and administrative services — the kind of software that has to be reliable, secure, and usable by people with very different levels of technical comfort.",
  "Alongside that work, I'm pursuing an MSc in Artificial Intelligence at SLIIT, building on an undergraduate degree in Information Technology from the University of Moratuwa that included research in digital image processing. AI is the area I'm actively developing expertise in right now, through coursework, experimentation, and small applied projects — not a field I'm claiming years of professional depth in yet.",
];

export const careerObjective =
  "My near-term goal is to keep building production software that solves real problems, while using my MSc to develop genuine, applied depth in AI — particularly where it can meaningfully improve digital public services. What connects both sides of my work is an interest in digital transformation: taking a manual or paper-based process and turning it into something structured, data-driven, and — where it genuinely helps — intelligent. I'm especially drawn to projects at the intersection of software engineering, AI, and public-sector impact, and I'm open to research collaborations, applied AI projects, and roles that let me keep growing in that direction.";

export const researchInterests = [
  "Artificial Intelligence",
  "Machine Learning",
  "Computer Vision",
  "Generative AI",
  "Digital Image Processing",
  "Digital Transformation",
] as const;

export const researchAreas = [
  "Exploring practical machine learning applications for government and public-service digital platforms.",
  "Building on undergraduate research in digital image processing.",
  "Investigating AI-powered guidance systems for equitable access to education, as part of ongoing MSc research.",
  "Developing hands-on experience with computer vision and LLM-based applications through coursework and personal projects.",
  "Learning how to responsibly bring AI into production software, rather than treating it as a separate track from engineering.",
] as const;
