import type { Project } from "@/lib/types";

/**
 * PLACEHOLDER CONTENT — no real projects were supplied in the brief, so every
 * entry below is a clearly-marked template (`isPlaceholder: true`), rendered
 * with a "Sample project" badge in the UI. Replace titles, descriptions,
 * links, and case-study content with real project details before launch.
 * Tech stacks reflect Irsha's actual listed skills so the structure is
 * realistic even though the specific projects are not.
 */
export const projects: Project[] = [
  {
    slug: "government-digital-services-portal",
    title: "[Government Digital Services Portal]",
    description:
      "[One or two sentences on a government-facing platform you built or contributed to — what it does and who uses it.]",
    category: "Web Platform",
    technologies: ["Next.js", "React", "Laravel", "MySQL", "REST APIs"],
    role: "[Your role, e.g. Full-Stack Engineer]",
    github: "#",
    liveUrl: "#",
    featured: true,
    isPlaceholder: true,
    caseStudy: {
      overview:
        "[Summarize the platform in 2-3 sentences: what problem it solves, who the users are, and the scale it operates at.]",
      problem:
        "[Describe the manual or inefficient process this replaced, and why it mattered for the organization or public users.]",
      context:
        "[Describe the team, timeline, and constraints — e.g. government compliance requirements, legacy system integration.]",
      myRole:
        "[Describe your specific responsibilities — frontend, backend, API integration, deployment, etc.]",
      solution:
        "[Describe the solution you built at a high level — key modules, workflows, or user journeys.]",
      architecture:
        "[Describe the system architecture — frontend/backend split, database design, third-party integrations, hosting.]",
      keyFeatures: [
        "[Key feature one]",
        "[Key feature two]",
        "[Key feature three]",
      ],
      challenges: [
        "[A real technical or organizational challenge you solved.]",
        "[Another challenge — e.g. performance, data integrity, or security constraint.]",
      ],
      decisions: [
        "[An engineering decision you made and the reasoning behind it.]",
      ],
      outcome:
        "[Describe the outcome honestly — avoid invented metrics unless you have real numbers to report.]",
    },
  },
  {
    slug: "ai-career-guidance-platform",
    title: "[AI-Powered University & Career Guidance Platform]",
    description:
      "[Describe this as your MSc research-adjacent project — connects to the ICODE 2026 research presentation.]",
    category: "AI / Research",
    technologies: ["Python", "Machine Learning", "Next.js", "REST APIs"],
    role: "[Your role, e.g. Research & Development]",
    github: "#",
    liveUrl: "#",
    featured: true,
    isPlaceholder: true,
    caseStudy: {
      overview:
        "[Summarize the research prototype: what equitable-access problem it addresses for students in Sri Lanka.]",
      problem:
        "[Describe the access/guidance gap this project is designed to address.]",
      context:
        "[Describe how this connects to your MSc research and the ICODE 2026 presentation.]",
      myRole: "[Describe your role in designing, building, and evaluating the system.]",
      solution: "[Describe the system's approach at a high level — recommendation logic, data sources, UX.]",
      architecture: "[Describe the technical architecture — model, data pipeline, application layer.]",
      keyFeatures: ["[Key feature one]", "[Key feature two]"],
      challenges: ["[A real challenge in building or evaluating the system.]"],
      decisions: ["[A design or modeling decision and its reasoning.]"],
      outcome: "[Describe current status — research prototype, presented at ICODE 2026, etc.]",
    },
  },
  {
    slug: "complaint-management-system",
    title: "[Citizen Complaint Management System]",
    description:
      "[Describe a complaint-intake and tracking system — submission, routing, and resolution workflow.]",
    category: "Government Tech",
    technologies: ["Laravel", "PHP", "MySQL", "REST APIs"],
    role: "[Your role]",
    github: "#",
    liveUrl: "#",
    isPlaceholder: true,
  },
  {
    slug: "procurement-bidding-system",
    title: "[Procurement & Bidding System]",
    description:
      "[Describe a bidding/tender platform — vendor submissions, evaluation workflow, administrative oversight.]",
    category: "Government Tech",
    technologies: ["Laravel", "React", "MySQL"],
    role: "[Your role]",
    github: "#",
    liveUrl: "#",
    isPlaceholder: true,
  },
];
