import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { LanguageProvider } from "./i18n/LanguageContext";
import LanguageSwitcher from "./language-switcher";
import SupportFooter from "./support-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://tokenscanner.cloud";
const SITE_TITLE = "Token Scanner - Solana Rug Pull & Honeypot Checker";
const SITE_DESCRIPTION =
  "Free Solana token scanner: check mint & freeze authority, holder concentration, LP lock, Token-2022 extensions and early sniper activity before you buy. Detect rug pulls and honeypots instantly.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Token Scanner",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "solana token scanner",
    "rug pull checker",
    "honeypot detector solana",
    "solana token safety check",
    "mint authority check",
    "freeze authority check",
    "solana token audit",
    "is this solana token a scam",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Token Scanner",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Token Scanner",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "SecurityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="glow-orb -top-40 left-1/4 h-80 w-80 bg-violet-600/25" />
        <div className="glow-orb top-10 right-0 h-96 w-96 bg-cyan-500/15" />

        <LanguageProvider>
          <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-50">
              <span className="gradient-border inline-flex h-7 w-7 items-center justify-center rounded-full">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-black text-xs">◎</span>
              </span>
              Token Scanner
            </Link>
            <LanguageSwitcher />
          </header>

          <div className="relative z-10 flex flex-1 flex-col">{children}</div>

          <SupportFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
