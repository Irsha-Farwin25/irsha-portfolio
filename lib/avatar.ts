import { existsSync } from "node:fs";
import { join } from "node:path";

const CANDIDATES = ["avatar.jpg", "avatar.jpeg", "avatar.png", "avatar.webp"];

/** Server-only: returns the public path to a real avatar photo if one has been dropped into /public, else null. */
export function avatarSrc(): string | null {
  for (const file of CANDIDATES) {
    if (existsSync(join(process.cwd(), "public", file))) {
      return `/${file}`;
    }
  }
  return null;
}
