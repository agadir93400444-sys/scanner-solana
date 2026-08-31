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

export const metadata: Metadata = {
  title: "Token Scanner",
  description: "Scanner defensif de tokens Solana - mint/freeze authority, holders, LP lock, extensions Token-2022.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
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
