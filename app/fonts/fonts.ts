import localFont from "next/font/local";

/*
 * Both fonts are limited to Arabic script (letters, presentation forms, Arabic punctuation and
 * digits, joiners) via unicode-range, so Latin text and digits fall through to Geist even where
 * they come first in a stack. Font loader options must be literals, hence the repeated range.
 */

/**
 * Arabic fonts, self-hosted (Arabic subset only; both SIL Open Font License) so builds never
 * depend on fetching them from Google Fonts.
 */

/** Arabic body and heading text. The font stacks fall back to it after Geist, so Latin keeps Geist. */
export const plexArabic = localFont({
  src: [
    { path: "./plex-arabic-400.woff2", weight: "400" },
    { path: "./plex-arabic-500.woff2", weight: "500" },
    { path: "./plex-arabic-600.woff2", weight: "600" },
    { path: "./plex-arabic-700.woff2", weight: "700" },
  ],
  variable: "--font-arabic",
  display: "swap",
  // No generated Arial fallback face: it would cover Latin and shadow Geist further down the stack.
  adjustFontFallback: false,
  // Arabic letters sit smaller than Latin at the same size; this matches them to Geist optically.
  declarations: [
    { prop: "size-adjust", value: "112%" },
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F" },
  ],
});

/** The handwritten recommendation notes in Arabic: Ruqaa, the everyday Arabic hand. */
export const ruqaa = localFont({
  src: [
    { path: "./ruqaa-arabic-400.woff2", weight: "400" },
    { path: "./ruqaa-arabic-700.woff2", weight: "700" },
  ],
  display: "swap",
  // No generated Arial fallback face: it would cover Latin and shadow Geist further down the stack.
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F" }],
});
