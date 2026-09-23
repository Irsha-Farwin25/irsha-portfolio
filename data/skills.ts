import type { SkillCategory } from "@/lib/types";

export const skillCategories: SkillCategory[] = [
  {
    key: "frontend",
    title: "Frontend Engineering",
    description: "Building interfaces and design systems for production web applications.",
    skills: [
      { name: "React" },
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "Material UI" },
      { name: "Tailwind CSS" },
      { name: "HTML" },
      { name: "CSS" },
    ],
  },
  {
    key: "backend",
    title: "Backend Engineering",
    description: "APIs and services connecting frontend applications to data and business logic.",
    skills: [
      { name: "Laravel" },
      { name: "PHP" },
      { name: "Node.js" },
      { name: "REST APIs" },
      { name: "GraphQL" },
      { name: "MySQL" },
      { name: "PostgreSQL" },
    ],
  },
  {
    key: "ai-data",
    title: "AI & Data",
    description: "The area I'm actively building depth in through my MSc, research, and experimentation.",
    skills: [
      { name: "Python" },
      { name: "Machine Learning" },
      { name: "Artificial Intelligence" },
      { name: "Computer Vision" },
      { name: "Generative AI" },
      { name: "LLM-based Applications" },
    ],
  },
  {
    key: "tools",
    title: "Tools & Infrastructure",
    description: "Day-to-day engineering tooling and workflow.",
    skills: [
      { name: "Git" },
      { name: "GitHub" },
      { name: "Docker" },
      { name: "Postman" },
      { name: "VS Code" },
      { name: "Software Architecture" },
      { name: "API Design" },
    ],
  },
];
