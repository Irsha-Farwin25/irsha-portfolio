import type { ExperienceItem } from "@/lib/types";

/** Real work history. */
export const experience: ExperienceItem[] = [
  {
    id: "uda-software-engineer",
    organization: "Urban Development Authority",
    role: "Software Engineer",
    employmentType: "Full-time",
    startDate: "Sep 2025",
    endDate: null,
    location: "Colombo, Western Province, Sri Lanka",
    locationType: "On-site",
    summary:
      "Building and maintaining production web platforms for government digital transformation initiatives — administrative systems, public-facing services, and the APIs that connect them.",
    responsibilities: [
      "Developed and maintained government digital platforms spanning administrative workflows, complaint management, and bidding/procurement-related systems.",
      "Built and integrated REST APIs connecting frontend applications to backend services and third-party systems.",
      "Worked across the stack on FMIS-adjacent financial and administrative systems, balancing data integrity with usability for non-technical end users.",
      "Contributed to monitoring, debugging, and performance improvements on systems handling government-scale traffic and compliance requirements.",
    ],
    technologies: ["React", "Next.js", "Laravel", "PHP", "MySQL", "REST APIs", "JavaScript", "TypeScript"],
  },
  {
    id: "unicornshift-software-engineer",
    organization: "UnicornShift",
    role: "Software Engineer",
    employmentType: "Contract",
    startDate: "Sep 2023",
    endDate: "Aug 2025",
    location: "Sydney, New South Wales, Australia",
    locationType: "Remote",
    summary:
      "Contract software engineering role building an AI-powered civil infrastructure maintenance platform.",
    responsibilities: [
      "Developed an AI-powered civil infrastructure maintenance platform using React.js, Node.js, GraphQL, MySQL, and Firebase.",
      "Built scalable frontend and backend features to connect contractors and streamline operations.",
      "Worked end-to-end from UI development to API design and database optimization.",
    ],
    technologies: ["React.js", "Node.js", "GraphQL", "MySQL", "Firebase", "JavaScript", "REST APIs"],
  },
  {
    id: "acc-institute-intern",
    organization: "Arthur C Clarke Institute for Modern Technologies",
    role: "Software Engineer Intern",
    employmentType: "Full-time",
    startDate: "Jan 2022",
    endDate: "Jul 2022",
    location: "Colombo, Western Province, Sri Lanka",
    locationType: "On-site",
    summary:
      "Software engineering internship building a Management Information System for Buddhist and Pali University, Sri Lanka.",
    responsibilities: [
      "Developed a Management Information System for Buddhist and Pali University, Sri Lanka, handling trainee data and administrative workflows.",
      "Built frontend interfaces using Bootstrap and implemented backend functionalities with Laravel.",
      "Designed and maintained MySQL database schemas for efficient data storage and retrieval.",
    ],
    technologies: ["Laravel", "Bootstrap", "MySQL"],
  },
];
