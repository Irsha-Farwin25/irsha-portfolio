import type { SkillCategory } from "@/lib/types";

export const skillCategories: SkillCategory[] = [
  {
    key: "frontend",
    title: "Frontend Engineering",
    description: "Building interfaces and design systems for production web applications.",
    skills: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Material UI", icon: "mui" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "HTML", icon: "html" },
      { name: "CSS", icon: "css" },
    ],
  },
  {
    key: "backend",
    title: "Backend Engineering",
    description: "APIs and services connecting frontend applications to data and business logic.",
    skills: [
      { name: "Laravel", icon: "laravel" },
      { name: "PHP", icon: "php" },
      { name: "Node.js", icon: "nodejs" },
      { name: "REST APIs", icon: "rest" },
      { name: "GraphQL", icon: "graphql" },
      { name: "MySQL", icon: "mysql" },
      { name: "PostgreSQL", icon: "postgresql" },
    ],
  },
  {
    key: "ai-data",
    title: "AI & Data",
    description: "The area I'm actively building depth in through my MSc, research, and experimentation.",
    skills: [
      { name: "Python", icon: "python" },
      { name: "Machine Learning", icon: "ml" },
      { name: "Artificial Intelligence", icon: "ai" },
      { name: "Computer Vision", icon: "vision" },
      { name: "Generative AI", icon: "genai" },
      { name: "LLM-based Applications", icon: "llm" },
    ],
  },
  {
    key: "tools",
    title: "Tools & Infrastructure",
    description: "Day-to-day engineering tooling and workflow.",
    skills: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Docker", icon: "docker" },
      { name: "Postman", icon: "postman" },
      { name: "VS Code", icon: "vscode" },
      { name: "Software Architecture", icon: "architecture" },
      { name: "API Design", icon: "api-design" },
    ],
  },
];
