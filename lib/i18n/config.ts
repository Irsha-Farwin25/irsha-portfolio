export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
/** The cookie the language switcher writes; read on the server so pages render in that language. */
export const LOCALE_COOKIE = "locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** BCP 47 tag for number and date formatting and for picking a speech voice. */
export function langTag(locale: Locale) {
  return locale === "ar" ? "ar-AE" : "en";
}
