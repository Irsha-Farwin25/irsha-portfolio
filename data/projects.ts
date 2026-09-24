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
    title: "UDA Mother Lanka Digital Platform",
    description:
      "A citizen-engagement platform for gathering public feedback on development plans and regulatory frameworks, facilitating real-time stakeholder dialogue, and providing access to urban planning resources.",
    category: "Web Platform",
    technologies: ["Next.js", "Laravel"],
    image: "/projects/MLDW.jpg",
    role: "[Your role, e.g. Full-Stack Engineer]",
    github: "#",
    liveUrl: "https://motherlanka.uda.lk/en",
    featured: true,
    isPlaceholder: true,
    caseStudy: {
      overview:
        "This initiative underscores the UDA’s commitment to embracing digital innovation, strengthening governance, and fostering open dialogue, knowledge sharing, and active citizen participation in shaping the future of Sri Lanka’s urban landscape.",
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
        "Gathering public feedback on development plans and regulatory frameworks",
        "Facilitating real-time dialogue and stakeholder interaction",
        "Providing access to urban planning resources and information",
        "Enhancing transparency and enabling inclusive, evidence-based decision-making",
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
    title: "PathwayAI — University & Career Guidance Platform",
    description:
      "An AI-powered guidance platform for Sri Lankan G.C.E. A/L students — upload your results and get personalised university pathway recommendations shaped by your interests and preferences. Part of my MSc research, presented at ICODE 2026.",
    category: "AI / Research",
    technologies: ["Python", "Machine Learning", "Next.js", "REST APIs"],
    image: "/projects/CareerGuidance.jpg",
    role: "[Your role, e.g. Research & Development]",
    github: "#",
    liveUrl: "https://project-ai-university-advisor-platform-485.magicpatterns.app/",
    featured: true,
    isPlaceholder: true,
    caseStudy: {
      overview:
        "PathwayAI is a research prototype designed to give students in Sri Lanka more equitable access to university and career guidance. Students upload a screenshot of their official G.C.E. A/L results, and the platform guides them through their interests and preferences to recommend suitable university pathways.",
      problem:
        "[Describe the access/guidance gap this project is designed to address.]",
      context:
        "Built as part of ongoing MSc research into practical, socially-grounded applications of artificial intelligence, and presented at ICODE 2026.",
      myRole: "[Describe your role in designing, building, and evaluating the system.]",
      solution:
        "A guided four-step flow — Results, Interests, Recommendations, Preferences. Students upload their Department of Examinations A/L results page (PNG, JPG or PDF), which is read via OCR, then refine recommendations by interest and preference, and can compare and shortlist programmes.",
      architecture: "[Describe the technical architecture — model, data pipeline, application layer.]",
      keyFeatures: [
        "Upload A/L results as a screenshot or PDF, with OCR extraction",
        "Privacy-first design — results are processed on the student's device",
        "Step-by-step guidance from results to interests, recommendations, and preferences",
        "Compare university programmes side by side and save a personal shortlist",
        "Sample result mode to explore the platform without uploading real data",
      ],
      challenges: ["[A real challenge in building or evaluating the system.]"],
      decisions: ["[A design or modeling decision and its reasoning.]"],
      outcome:
        "Research prototype with an interactive demo; the underlying research was presented at ICODE 2026.",
    },
  },
  {
    slug: "beauty-for-ashes-construction",
    title: "Beauty for Ashes Construction",
    description:
      "Company website for an award-winning Northwest Arkansas builder, showcasing custom homes, whole-home remodels, and major additions — with featured projects, client testimonials, and a six-phase build process.",
    category: "Web Platform",
    technologies: ["React", "Ruby on Rails"],
    image: "/projects/Beauty4Ashes.jpg",
    role: "[Your role]",
    github: "#",
    liveUrl: "https://beauty4ashesconstruction.com/default_home",
    isPlaceholder: true,
  },
  {
    slug: "procurement-bidding-system",
    title: "UDA Property Bidding Portal",
    description:
      "A sealed-bid property tender portal within the UDA Mother Lanka platform, where registered bidders can explore verified government-owned commercial and residential properties and submit confidential bids — with the highest valid bid winning through a transparent process.",
    category: "Government Tech",
    technologies: ["Laravel", "React", "MySQL"],
    image: "/projects/Bidding.jpg",
    role: "[Your role]",
    github: "#",
    liveUrl: "https://motherlanka.uda.lk/en/bidding",
    isPlaceholder: true,
  },
  {
    slug: "uda-financial-management-information-system",
    title: "Financial Management Information System (UDA)",
    description:
      "This initiative aims to facilitate convenient online payments for UDA tenants through a secure, transparent, authorized, and seamless digital payment system, in line with the Government’s efforts to strengthen and expand the national digital economy.",
    category: "Government Tech",
    technologies: ["React", "Laravel"],
    image: "/projects/FMIS.jpg",
    role: "[Your role]",
    github: "#",
    liveUrl: "https://fmis.uda.lk/login",
    isPlaceholder: true,
  },
  {
    slug: "unicornshift",
    title: "UnicornShift",
    description:
      "AI-powered civil infrastructure platform connecting head contractors with subcontractors — streamlining operations and automating maintenance workflows.",
    category: "Web Platform",
    technologies: ["React", "Node.js"],
    image: "/projects/UnicornShift.PNG",
    role: "[Your role]",
    github: "#",
    liveUrl: "https://share.google/nhPlvrexyh97xZS5G",
    isPlaceholder: true,
  },
];
