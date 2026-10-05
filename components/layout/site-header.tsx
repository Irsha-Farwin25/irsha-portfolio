"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useContent, useLocale, useT } from "@/components/i18n/locale-provider";
import { AvatarView } from "@/components/hero/avatar-view";
import { cn } from "@/lib/utils";

export function SiteHeader({ avatarUrl }: { avatarUrl: string | null }) {
  const pathname = usePathname();
  const t = useT();
  const locale = useLocale();
  const { navItems, site } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;

    const sections = navItems
      .filter((item) => item.href.startsWith("/#"))
      .map((item) => item.href.slice(2))
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHash(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname, navItems]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return pathname === "/" && activeHash === href.slice(1);
    }
    return pathname === href;
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border/80 bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8 2xl:max-w-7xl">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-medium tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <AvatarView src={avatarUrl} size={26} />
          {site.name}
          <span className="text-primary">.</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.nav.primary}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(item.href) && "text-foreground"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-primary" aria-hidden="true" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side={locale === "ar" ? "left" : "right"} className="w-full sm:w-80">
              <SheetHeader>
                <SheetTitle>{t.nav.menuTitle}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label={t.nav.mobile}>
                {navItems.map((item) => (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "rounded-md px-3 py-3 text-lg font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-foreground",
                          isActive(item.href) && "text-primary"
                        )}
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex items-center gap-2 border-t border-border p-4">
                <LanguageSwitcher className="w-full" />
              </div>
            </SheetContent>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.nav.toggleMenu}
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
