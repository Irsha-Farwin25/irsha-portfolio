import type { Locale } from "@/lib/i18n/config";
import { en, type Dictionary } from "@/lib/i18n/dictionaries/en";
import { ar } from "@/lib/i18n/dictionaries/ar";

export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
