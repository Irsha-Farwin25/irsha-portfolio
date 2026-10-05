import type { LabExperiment, Publication } from "@/lib/types";

// Real — given directly in the brief.
export const publications: Publication[] = [
  {
    id: "icode-2026",
    title:
      "AI-Powered University and Career Guidance Platform for Equitable Access in Sri Lanka",
    venue: "ICODE 2026",
    year: "2026",
    area: "AI for Education / Equitable Access",
    summary:
      "Research presentation on an AI-powered platform designed to give students in Sri Lanka more equitable access to university and career guidance — part of ongoing MSc research into practical, socially-grounded applications of artificial intelligence.",
    status: "Presented",
    project: "ai-career-guidance-platform",
    resources: [
      {
        kind: "slides",
        href: "https://icode.bit.uom.lk/assets/AI-Powered%20University%20_%20Career%20Guidance%20Platform%20for%20Sri%20Lankan%20A_L%20Students-j-VPa90D.pdf",
      },
      { kind: "proceedings", href: "https://icode.bit.uom.lk/proceedings" },
    ],
  },
];

/**
 * PLACEHOLDER: no real AI Lab experiments were supplied. These illustrate the
 * intended structure (status badges, tech, links) — replace with real
 * experiments, prototypes, or coursework projects.
 */
export const labExperiments: LabExperiment[] = [
  {
    id: "cv-experiment-1",
    title: "[Computer Vision Experiment]",
    status: "Experiment",
    description:
      "[Describe a computer vision experiment — connects to your undergraduate digital image processing research.]",
    technologies: ["Python", "Computer Vision"],
    github: "#",
  },
  {
    id: "llm-experiment-1",
    title: "[LLM-Powered Application Prototype]",
    status: "Prototype",
    description: "[Describe an LLM-based application prototype you've built or are building.]",
    technologies: ["Python", "LLM-based Applications"],
    github: "#",
  },
  {
    id: "ml-experiment-1",
    title: "[Machine Learning Coursework / Experiment]",
    status: "In Development",
    description: "[Describe an ML experiment from MSc coursework or independent study.]",
    technologies: ["Python", "Machine Learning"],
    github: "#",
  },
];
