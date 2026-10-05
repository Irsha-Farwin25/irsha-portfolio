import type { EducationItem } from "@/lib/types";

export const education: EducationItem[] = [
  {
    id: "msc-ai",
    institution: "SLIIT (Sri Lanka Institute of Information Technology)",
    degree: "MSc",
    field: "Artificial Intelligence",
    startDate: "Jan 2026",
    endDate: null,
    location: "Sri Lanka",
    description:
      "Postgraduate study in artificial intelligence, building on an undergraduate foundation in information technology — coursework and research spanning machine learning and applied AI systems.",
    status: "in-progress",
    // Add `expectedEnd: "YYYY-MM"` to show how far through the degree she is.
    period: { start: "2026-01" },
    monogram: "SLIIT",
    logo: "/education/sliit.png",
    modules: ["Machine Learning", "Applied AI Systems"],
    links: [
      { label: "PathwayAI", href: "/projects/ai-career-guidance-platform" },
      { label: "ICODE 2026 paper", href: "/research" },
    ],
  },
  {
    id: "bsc-moratuwa",
    institution: "University of Moratuwa",
    degree: "BSc (Hons)",
    field: "Information Technology",
    startDate: "Nov 2018",
    endDate: "2023",
    location: "Moratuwa, Sri Lanka",
    description:
      "Undergraduate degree in information technology, including research work in digital image processing.",
    status: "completed",
    period: { start: "2018-11" },
    monogram: "UoM",
    logo: "/education/moratuwa.png",
    links: [
      { label: "Image processing research", href: "/#skills" },
      { label: "Hackathons", href: "/#achievements" },
    ],
  },
];
