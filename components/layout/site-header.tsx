"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
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
  // While a clicked jump is still scrolling, the scroll-spy holds the clicked item (no flicker
  // through every section on the way).
  const holding = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A section picked in the mobile menu, scrolled to once the menu has finished closing.
  const pendingTarget = useRef<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: the active section is the last one whose top has passed a line a third of the way
  // down the screen. Above the first section (the hero) nothing is active; at the very bottom of
  // the page the last section is, even if it's too short to reach the line.
  // (Off the home page no section link is active anyway: isActive checks the path.)
  useEffect(() => {
    if (pathname !== "/") return;
    const ids = navItems.filter((item) => item.href.startsWith("/#")).map((item) => item.href.slice(2));
    let frame = 0;
    const update = () => {
      frame = 0;
      if (holding.current) return;
      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el))
        .sort((a, b) => a.offsetTop - b.offsetTop);
      if (!sections.length) return;
      const line = window.innerHeight / 3;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const current = atBottom
        ? sections[sections.length - 1]
        : sections.filter((el) => el.getBoundingClientRect().top <= line).pop();
      setActiveHash(current ? `#${current.id}` : "");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, navItems]);

  /** Scrolls to a section on this page, updating the URL and the underline straight away. */
  const scrollToSection = (hash: string) => {
    const el = document.getElementById(hash.slice(1));
    if (!el) return false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    holding.current = true;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => (holding.current = false), reduce ? 50 : 900);
    setActiveHash(hash);
    // Same URL as before still scrolls (a plain hash link wouldn't move a second time).
    window.history.pushState(null, "", `/${hash}`);
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    return true;
  };

  /** Section links on the home page scroll in place; anything else navigates normally. */
  const onNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string, fromMenu = false) => {
    if (!href.startsWith("/#") || pathname !== "/" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const hash = href.slice(1);
    if (fromMenu) {
      // Let the menu close (and release its scroll lock) first, or it would restore the old
      // scroll position over the jump.
      pendingTarget.current = hash;
      setMobileOpen(false);
      return;
    }
    scrollToSection(hash);
  };

  // Once the mobile menu has closed, go to the section picked in it.
  useEffect(() => {
    if (mobileOpen || !pendingTarget.current) return;
    const hash = pendingTarget.current;
    pendingTarget.current = null;
    const id = setTimeout(() => scrollToSection(hash), 320);
    return () => clearTimeout(id);
  }, [mobileOpen]);

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
              onClick={(e) => onNavClick(e, item.href)}
              aria-current={isActive(item.href) ? "location" : undefined}
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
                        onClick={(e) => onNavClick(e, item.href, true)}
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
