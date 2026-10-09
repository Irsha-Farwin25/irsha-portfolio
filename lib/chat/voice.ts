import type { Locale } from "@/lib/i18n/config";

/**
 * Her spoken voice, using the browser's built-in speech synthesis (no API key, no network).
 *
 * Browsers only allow speech after the visitor has interacted with the page (a click, tap or key
 * press), so lines before that stay text-only; everything after is spoken aloud.
 */

/** Voices that sound like a young woman, best first, matched against the voice's name. */
const PREFERRED: Record<Locale, RegExp[]> = {
  en: [
    /aria/i,
    /jenny/i,
    /sonia/i,
    /libby/i,
    /samantha/i,
    /google uk english female/i,
    /google us english/i,
    /zira/i,
    /female/i,
  ],
  // Emirati first (Edge's "Fatima"), then other Gulf and Arabic female voices.
  ar: [/fatima/i, /zariyah/i, /amina/i, /salma/i, /hoda/i, /laila/i, /mariam/i, /google/i, /female/i],
};

/** Arabic voices from the UAE, then the Gulf, then anywhere. */
const AR_REGIONS = ["ar-ae", "ar-sa", "ar-qa", "ar-kw", "ar-bh", "ar-om"];

const chosen: Partial<Record<Locale, SpeechSynthesisVoice | null>> = {};

function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(locale: Locale): SpeechSynthesisVoice | null {
  if (chosen[locale] !== undefined) return chosen[locale];
  const voices = window.speechSynthesis.getVoices();
  // The list loads asynchronously; don't cache a miss until it has arrived.
  if (!voices.length) return null;
  const inLanguage = voices.filter((v) => v.lang.toLowerCase().startsWith(locale));
  for (const pattern of PREFERRED[locale]) {
    const match = inLanguage.find((v) => pattern.test(v.name));
    if (match) return (chosen[locale] = match);
  }
  if (locale === "ar") {
    for (const region of AR_REGIONS) {
      const match = inLanguage.find((v) => v.lang.toLowerCase().replace("_", "-") === region);
      if (match) return (chosen[locale] = match);
    }
  }
  return (chosen[locale] = inLanguage[0] ?? null);
}

if (supported()) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    delete chosen.en;
    delete chosen.ar;
  });
}

/** Whether the browser will let her speak yet (the visitor has clicked, tapped or typed). */
function activated() {
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return ua ? ua.hasBeenActive : true;
}

/**
 * Roughly how long a line takes to say aloud, in ms: speech runs at about 14 characters a second,
 * several times slower than her bubble types. A fallback for browsers that never fire `onend`.
 */
export function speechMs(line: string) {
  return 400 + line.length * 72;
}

/**
 * Says a line aloud, cutting off whatever she was saying. Emoji are dropped, not read out. In
 * Arabic she stays silent when the device has no Arabic voice, rather than an English voice
 * mangling it; the bubble still shows the line. Returns whether she's actually speaking;
 * `onEnd` runs when she finishes (or is cut off).
 */
export function speak(line: string, locale: Locale = "en", onEnd?: () => void): boolean {
  if (!supported() || !activated()) return false;
  const text = line.replace(/\p{Extended_Pictographic}|️/gu, "").trim();
  if (!text) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = pickVoice(locale);
  if (!voice && locale === "ar") return false;
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  utterance.rate = locale === "ar" ? 0.98 : 1.02;
  utterance.pitch = 1.1;
  if (onEnd) utterance.onend = utterance.onerror = () => onEnd();
  synth.speak(utterance);
  return true;
}

/** Stops her mid-sentence (muting, hiding, or opening the chat). */
export function stopSpeaking() {
  if (supported()) window.speechSynthesis.cancel();
}
