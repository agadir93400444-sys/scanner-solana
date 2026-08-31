"use client";

import Link from "next/link";
import { useLanguage } from "../i18n/LanguageContext";

const CHECK_ORDER = [
  { id: "mintAuthority", weight: 25 },
  { id: "freezeAuthority", weight: 25 },
  { id: "holderConcentration", weight: 20 },
  { id: "metadataAuthority", weight: 15 },
  { id: "lpLock", weight: 20 },
  { id: "tokenExtensions", weight: 25 },
  { id: "earlySniperConcentration", weight: 15 },
] as const;

const MAX_SCORE = CHECK_ORDER.reduce((sum, c) => sum + c.weight, 0);

const FAQ_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

export default function DocsPage() {
  const { t } = useLanguage();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((n) => ({
      "@type": "Question",
      name: t.docs.faq[`q${n}` as keyof typeof t.docs.faq],
      acceptedAnswer: {
        "@type": "Answer",
        text: t.docs.faq[`a${n}` as keyof typeof t.docs.faq],
      },
    })),
  };

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-16 sm:py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />

      <div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">
          {t.common.backToScanner}
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gradient">{t.docs.title}</h1>
        <p className="mt-2 text-zinc-400">{t.docs.intro}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-50">{t.docs.checksHeading}</h2>
        <p className="text-sm text-zinc-400">{t.docs.checksIntro.replace("{max}", String(MAX_SCORE))}</p>
        <div className="flex flex-col gap-3">
          {CHECK_ORDER.map((check) => (
            <div key={check.id} className="glass-card rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-100">{t.checks[check.id as keyof typeof t.checks]}</span>
                <span className="text-sm text-zinc-400" dir="ltr">
                  {check.weight} {t.home.pointsLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {t.docs.checkDescriptions[check.id as keyof typeof t.docs.checkDescriptions]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-50">{t.docs.riskHeading}</h2>
        <p className="text-sm text-zinc-400">{t.docs.riskIntro}</p>
        <ul className="flex flex-col gap-1 text-sm text-zinc-400">
          <li>{t.docs.riskLowFull}</li>
          <li>{t.docs.riskMediumFull}</li>
          <li>{t.docs.riskHighFull}</li>
          <li>{t.docs.riskCriticalFull}</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-50">{t.docs.apiHeading}</h2>
        <p className="text-sm text-zinc-400">{t.docs.apiIntro}</p>
        <div className="flex flex-col gap-2" dir="ltr">
          <pre className="glass-card overflow-x-auto rounded-lg px-4 py-3 text-sm text-zinc-100">
            <code>GET /api/scan/&lt;adresse-du-mint&gt;</code>
          </pre>
          <pre className="glass-card overflow-x-auto rounded-lg px-4 py-3 text-sm text-zinc-100">
            <code>GET /api/history/&lt;adresse-du-mint&gt;</code>
          </pre>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-50">{t.docs.faq.heading}</h2>
        <div className="flex flex-col gap-3">
          {FAQ_KEYS.map((n) => (
            <div key={n} className="glass-card rounded-lg px-4 py-3">
              <h3 className="font-medium text-zinc-100">{t.docs.faq[`q${n}` as keyof typeof t.docs.faq]}</h3>
              <p className="mt-1 text-sm text-zinc-400">{t.docs.faq[`a${n}` as keyof typeof t.docs.faq]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-50">{t.docs.limitsHeading}</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 pr-5 text-sm text-zinc-400">
          <li>{t.docs.limit1}</li>
          <li>{t.docs.limit2}</li>
          <li>{t.docs.limit3}</li>
        </ul>
      </section>

      <p className="text-xs text-zinc-500">{t.docs.disclaimer}</p>
    </div>
  );
}
