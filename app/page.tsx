import { Hero } from "@/components/hero/hero";
import { Experience } from "@/components/sections/experience";
import { ProjectsPreview } from "@/components/sections/projects-preview";
import { ResearchPreview } from "@/components/sections/research-preview";
import { Skills } from "@/components/sections/skills";
import { Achievements } from "@/components/sections/achievements";
import { Recommendations } from "@/components/sections/recommendations";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Experience />
      <ProjectsPreview />
      <ResearchPreview />
      <Skills />
      <Achievements />
      <Recommendations />
      <Contact />
    </>
  );
}
