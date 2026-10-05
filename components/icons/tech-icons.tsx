import type { SVGProps } from "react";
import {
  siCss,
  siDocker,
  siGit,
  siGithub,
  siGraphql,
  siHtml5,
  siJavascript,
  siLaravel,
  siMui,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siTailwindcss,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";
import {
  Boxes,
  BrainCircuit,
  Bot,
  CodeXml,
  ScanEye,
  Sparkles,
  WandSparkles,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** A technology's glyph: a brand logo (Simple Icons) or, for concepts, a Lucide icon. */
export type TechIcon =
  | { kind: "brand"; path: string; color: string | null }
  | { kind: "lucide"; Icon: LucideIcon };

/** Brand colour, or null for near-black logos (Next.js, GitHub) that should follow the text colour. */
function brand({ path, hex }: SimpleIcon): TechIcon {
  const n = parseInt(hex, 16);
  const luminance = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return { kind: "brand", path, color: luminance < 40 ? null : `#${hex}` };
}

const lucide = (Icon: LucideIcon): TechIcon => ({ kind: "lucide", Icon });

/** Keyed by `Skill.icon` in data/skills.ts. */
export const TECH_ICONS: Record<string, TechIcon> = {
  react: brand(siReact),
  nextjs: brand(siNextdotjs),
  typescript: brand(siTypescript),
  javascript: brand(siJavascript),
  mui: brand(siMui),
  tailwind: brand(siTailwindcss),
  html: brand(siHtml5),
  css: brand(siCss),
  laravel: brand(siLaravel),
  php: brand(siPhp),
  nodejs: brand(siNodedotjs),
  rest: lucide(Webhook),
  graphql: brand(siGraphql),
  mysql: brand(siMysql),
  postgresql: brand(siPostgresql),
  python: brand(siPython),
  ml: lucide(BrainCircuit),
  ai: lucide(Sparkles),
  vision: lucide(ScanEye),
  genai: lucide(WandSparkles),
  llm: lucide(Bot),
  git: brand(siGit),
  github: brand(siGithub),
  docker: brand(siDocker),
  postman: brand(siPostman),
  vscode: lucide(CodeXml),
  architecture: lucide(Boxes),
  "api-design": lucide(Workflow),
};

/** Renders a skill's icon; brand logos take their brand colour, concepts take the theme's primary. */
export function TechGlyph({ icon, ...props }: { icon?: string } & SVGProps<SVGSVGElement>) {
  const tech = icon ? TECH_ICONS[icon] : undefined;
  if (!tech) return <CodeXml aria-hidden className={cn("text-primary", props.className)} />;
  if (tech.kind === "lucide") return <tech.Icon aria-hidden className={cn("text-primary", props.className)} />;
  return (
    <svg viewBox="0 0 24 24" fill={tech.color ?? "currentColor"} aria-hidden="true" {...props}>
      <path d={tech.path} />
    </svg>
  );
}

/** The colour a skill's tile glows in. */
export function techColor(icon?: string) {
  const tech = icon ? TECH_ICONS[icon] : undefined;
  return tech?.kind === "brand" && tech.color ? tech.color : "var(--primary)";
}
