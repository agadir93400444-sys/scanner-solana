"use client";

import { useLanguage } from "./i18n/LanguageContext";
import type { Locale } from "./i18n/translations";

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "zh", label: "中文" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="glass-card flex gap-1 rounded-full p-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLocale(lang.code)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === lang.code ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
