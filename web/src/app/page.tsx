"use client";

import Link from "next/link";
import ScanForm from "./scan-form";
import { useLanguage } from "./i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black sm:py-24">
      <div className="flex w-full max-w-2xl flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t.home.title}</h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">{t.home.subtitle}</p>
      </div>

      <div className="mt-8 flex w-full flex-col items-center">
        <ScanForm />
      </div>

      <p className="mt-12 max-w-xl text-center text-xs text-zinc-400 dark:text-zinc-600">{t.home.disclaimer}</p>

      <Link
        href="/docs"
        className="mt-4 text-sm font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {t.home.docsLink}
      </Link>
    </div>
  );
}
