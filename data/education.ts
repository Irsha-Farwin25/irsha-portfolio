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
    mode: "Part-time, alongside work",
    // Expected to finish January 2028; the card shows how far through the degree she is.
    period: { start: "2026-01", expectedEnd: "2028-01" },
    monogram: "SLIIT",
    website: "https://www.sliit.lk",
    about:
      "Founded in 1999, **Sri Lanka's largest non-state degree-awarding institute**, with degrees **recognised by the University Grants Commission**.",
    logo: "/education/sliit.png",
    modules: ["Neurocomputing & Neuroscience", "Machine Learning", "NLP"],
    links: [
      { label: "PathwayAI", href: "/#projects" },
      { label: "ICODE 2026 paper", href: "/#research" },
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
    website: "https://uom.lk",
    about:
      "**Sri Lanka's leading technological university** since 1972, widely regarded as **the country's top school for engineering and computing**.",
    logo: "/education/moratuwa.png",
    thesis: "Automated Handwritten Bank Slip Digitalization",
    modules: ["Image Processing", "Databases", "NLP", "Programming"],
    links: [{ label: "Hackathons", href: "/#achievements" }],
  },
];
