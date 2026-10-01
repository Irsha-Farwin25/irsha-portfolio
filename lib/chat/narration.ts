import { experience } from "@/data/experience";
import { publications } from "@/data/research";
import { skillCategories } from "@/data/skills";
import { recommendations } from "@/data/recommendations";
import { site } from "@/data/site";
import type { Certificate } from "@/lib/types";

/**
 * What the avatar says as the visitor reaches each home-page section (matched by the section's
 * element id). Built from the same data the page renders, so the lines stay accurate.
 */
function buildLines(): Record<string, string> {
  const first = site.name.split(" ")[0];
  const current = experience.find((e) => e.endDate === null) ?? experience[0];
  const publication = publications[0];
  const topSkills = skillCategories.map((c) => c.skills[0]?.name).filter(Boolean).slice(0, 3);

  return {
    experience: current
      ? `This is ${first}'s work journey. She's ${current.endDate === null ? "currently" : "most recently"} a ${current.role} at the ${current.organization}.`
      : `This is ${first}'s work journey so far.`,
    projects: `Here's work ${first} has shipped, from government platforms to AI research. Open any card for the details.`,
    research: publication
      ? `Her research applies AI to fairer access to university guidance, presented at ${publication.venue}.`
      : `This is where ${first}'s research and experiments live.`,
    skills: `Her toolkit spans frontend, backend and AI: ${topSkills.join(", ")} and more.`,
    recommendations: `Here's what ${recommendations.length} colleagues and clients say about working with her.`,
    contact: `Want to work together? Send ${first} a message here, or click me to ask anything.`,
  };
}

export const SECTION_LINES = buildLines();

/**
 * What the avatar says about the certificate under the spotlight: its own narration, else its
 * description, else a line built from who issued it and when.
 */
export function certificateLine(c: Certificate): string {
  if (c.narration) return c.narration;
  if (c.description) return c.description;
  const when = c.date ? ` in ${c.date}` : "";
  switch (c.category) {
    case "Hackathon":
      return `She took part in this one, run by ${c.issuer}${when}.`;
    case "Conference":
      return `She attended this one, hosted by ${c.issuer}${when}.`;
    default:
      // "Meta · Coursera" reads as "Meta on Coursera".
      return `She completed this with ${c.issuer.replace(" · ", " on ")}${when}.`;
  }
}

/** Roughly how long the avatar takes to type out (say) a line in her bubble, in ms. */
export function narrationMs(line: string) {
  return 150 + line.length * 24 + (line.match(/[.,!?]/g)?.length ?? 0) * 130;
}
