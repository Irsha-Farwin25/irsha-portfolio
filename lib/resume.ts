import { existsSync } from "node:fs";
import { join } from "node:path";

/** Server-only: checks whether a real resume PDF has been dropped into /public. */
export function resumeExists(): boolean {
  return existsSync(join(process.cwd(), "public", "resume.pdf"));
}
