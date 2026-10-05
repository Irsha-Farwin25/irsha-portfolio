"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getContent } from "@/lib/i18n/content";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Hands the server-chosen language to client components. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** UI strings in the visitor's language. */
export function useT() {
  return getDictionary(useLocale());
}

/** Portfolio content (site, projects, experience, …) in the visitor's language. */
export function useContent() {
  return getContent(useLocale());
}
