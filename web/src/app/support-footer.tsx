"use client";

import { useState } from "react";
import { useLanguage } from "./i18n/LanguageContext";

const DONATION_ADDRESS = "2Zu5YbMwqHV5dxPVNUGYSjVv2QgEC5y4cCsdBJrxjs8o";

export default function SupportFooter() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(DONATION_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponible - on ignore, l'adresse reste selectionnable a la main.
    }
  }

  return (
    <footer className="relative z-10 mx-auto mt-16 mb-8 flex w-full max-w-xl flex-col items-center gap-3 px-4 text-center">
      <div className="glass-card flex w-full flex-col items-center gap-3 rounded-2xl px-6 py-5">
        <span className="text-sm font-semibold text-zinc-200">{t.support.title}</span>
        <p className="text-xs text-zinc-400">{t.support.text}</p>
        <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
          <code
            dir="ltr"
            className="flex-1 truncate rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-300"
          >
            {DONATION_ADDRESS}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="gradient-border shrink-0"
          >
            <span className="flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-900">
              {copied ? t.support.copied : t.support.copy}
            </span>
          </button>
        </div>
        <span className="text-xs text-zinc-500">{t.support.thanks}</span>
      </div>
    </footer>
  );
}
