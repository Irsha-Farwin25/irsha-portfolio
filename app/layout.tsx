import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { plexArabic } from "@/app/fonts/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AvatarDock } from "@/components/assistant/avatar-dock";
import { ChatProvider } from "@/components/assistant/chat-context";
import { site } from "@/data/site";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getI18n } from "@/lib/i18n/server";
import { dirOf } from "@/lib/i18n/config";
import { resumeExists } from "@/lib/resume";
import { avatarSrc } from "@/lib/avatar";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, content } = await getI18n();
  const { site } = content;
  const title = `${site.name} — ${site.role}`;
  return {
    metadataBase: new URL(site.url),
    title: {
      default: title,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    keywords: [
      "Irsha Farwin",
      "Software Engineer",
      "AI Engineer",
      "Artificial Intelligence",
      "Full-Stack Developer",
      "Next.js",
      "React",
      "Sri Lanka",
    ],
    authors: [{ name: site.name }],
    creator: site.name,
    openGraph: {
      type: "website",
      url: site.url,
      siteName: site.name,
      title,
      description: site.description,
      locale: locale === "ar" ? "ar_AE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: site.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      jobTitle: site.role,
      description: site.description,
      url: site.url,
      address: {
        "@type": "PostalAddress",
        addressCountry: "LK",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#person` },
    },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getI18n();
  const hasResume = resumeExists();
  const avatarUrl = avatarSrc();

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${plexArabic.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LocaleProvider locale={locale}>
            <TooltipProvider>
              <ChatProvider>
                <SiteHeader avatarUrl={avatarUrl} />
                <main className="flex-1 pt-16">{children}</main>
                <SiteFooter hasResume={hasResume} />
                <AvatarDock />
              </ChatProvider>
            </TooltipProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
