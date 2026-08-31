"use client";

import { Suspense } from "react";
import Link from "next/link";
import ScanForm from "./scan-form";
import { useLanguage } from "./i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <div className="relative flex w-full max-w-2xl flex-col items-center gap-4 text-center">
        <span className="glass-card rounded-full px-4 py-1 text-xs font-medium tracking-wide text-zinc-300">
          Solana · On-chain risk analysis
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-balance text-gradient sm:text-5xl">{t.home.title}</h1>
        <p className="max-w-xl text-zinc-400">{t.home.subtitle}</p>
      </div>

      <div className="relative mt-10 flex w-full flex-col items-center">
        <Suspense fallback={null}>
          <ScanForm />
        </Suspense>
      </div>

      <p className="relative mt-12 max-w-xl text-center text-xs text-zinc-500">{t.home.disclaimer}</p>

      <Link
        href="/docs"
        className="relative mt-4 text-sm font-medium text-zinc-400 underline underline-offset-2 hover:text-zinc-100"
      >
        {t.home.docsLink}
      </Link>
    </div>
  );
}
