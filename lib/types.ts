export type SkillCategoryKey = "frontend" | "backend" | "ai-data" | "tools";

export interface SocialLink {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "email" | "twitter" | "researchgate";
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  location: string;
  locationType: "On-site" | "Remote" | "Hybrid";
  summary: string;
  responsibilities: string[];
  technologies: string[];
  isPlaceholder?: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  location: string;
  description: string;
  status: "in-progress" | "completed";
  isPlaceholder?: boolean;
}

export interface Skill {
  name: string;
}

export interface SkillCategory {
  key: SkillCategoryKey;
  title: string;
  description: string;
  skills: Skill[];
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  role?: string;
  github?: string;
  liveUrl?: string;
  featured?: boolean;
  isPlaceholder?: boolean;
  caseStudy?: ProjectCaseStudy;
}

export interface ProjectCaseStudy {
  overview: string;
  problem: string;
  context: string;
  myRole: string;
  solution: string;
  architecture: string;
  keyFeatures: string[];
  challenges: string[];
  decisions: string[];
  outcome: string;
}

export type ExperimentStatus = "Research" | "Prototype" | "Experiment" | "In Development";

export interface LabExperiment {
  id: string;
  title: string;
  status: ExperimentStatus;
  description: string;
  technologies: string[];
  github?: string;
  demo?: string;
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: string;
  area: string;
  summary: string;
  link?: string;
  status: "Presented" | "Accepted" | "In Progress" | "Submitted";
}

export interface Achievement {
  id: string;
  title: string;
  category: "Academic" | "Research" | "Conference" | "Professional" | "Certification";
  issuer?: string;
  date?: string;
  description: string;
  link?: string;
  isPlaceholder?: boolean;
}
