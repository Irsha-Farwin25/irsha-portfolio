import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getContent } from "@/lib/i18n/content";

/**
 * The visitor's language: the switcher's cookie when set, otherwise Arabic for browsers that ask
 * for it first (e.g. a UAE visitor with an Arabic browser), otherwise English.
 */
export async function getLocale(): Promise<Locale> {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  const accept = (await headers()).get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("ar") ? "ar" : DEFAULT_LOCALE;
}

/** Everything a server component needs to render in the visitor's language. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale), content: getContent(locale) };
}
