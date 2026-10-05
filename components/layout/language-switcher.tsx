"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { LOCALE_COOKIE, dirOf, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Switches between English and Arabic. It saves the choice in a cookie and re-renders the page on
 * the server, so the new language arrives with the right direction (RTL for Arabic) and no flash.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === "ar" ? "en" : "ar";

  const switchTo = () => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Flip direction straight away so the layout doesn't wait on the server round trip.
    document.documentElement.lang = next;
    document.documentElement.dir = dirOf(next);
    startTransition(() => router.refresh());
  };

  return (
    <Button
      variant="outline"
      onClick={switchTo}
      disabled={pending}
      aria-label={t.langSwitch.aria}
      lang={next}
      className={cn("gap-1.5", className)}
    >
      {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Languages data-icon="inline-start" />}
      <span className={next === "ar" ? "font-medium" : undefined}>{t.langSwitch.label}</span>
    </Button>
  );
}
