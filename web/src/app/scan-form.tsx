"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { ScanReport, ApiError } from "./types";
import { useLanguage } from "./i18n/LanguageContext";

// En prod, Nginx sert le frontend et l'API sous le meme domaine (voir
// deploy/nginx.conf.example) - une URL relative suffit et evite le CORS.
// En dev local, NEXT_PUBLIC_API_URL (voir .env.local) pointe vers l'API
// qui tourne sur un port different.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const RISK_STYLES: Record<ScanReport["riskLevel"], string> = {
  LOW: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  HIGH: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  CRITICAL: "bg-red-500/10 text-red-300 border-red-500/30",
};

export default function ScanForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [mint, setMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScanReport | null>(null);

  async function runScan(mintAddress: string) {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch(`${API_URL}/api/scan/${encodeURIComponent(mintAddress)}`);
      const data = await res.json();

      if (!res.ok) {
        setError((data as ApiError).error || t.home.unknownError);
        return;
      }

      setReport(data as ScanReport);
    } catch {
      setError(t.home.networkError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Permet aux liens partages (?mint=...) d'ouvrir directement un scan,
    // notamment ceux postes par le bot X.
    const fromUrl = searchParams.get("mint")?.trim();
    if (fromUrl) {
      setMint(fromUrl);
      runScan(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = mint.trim();
    if (!trimmed) return;
    runScan(trimmed);
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          placeholder={t.home.inputPlaceholder}
          className="glass-card flex-1 rounded-full px-5 py-3 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-violet-400/50"
          dir="ltr"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || !mint.trim()}
          className="gradient-border shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="flex items-center justify-center rounded-full bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-900">
            {loading ? t.home.scanningButton : t.home.scanButton}
          </span>
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${RISK_STYLES[report.riskLevel]}`}>
              {t.risk[report.riskLevel]}
            </span>
            <span className="text-lg font-semibold text-zinc-100" dir="ltr">
              {report.totalScore} / {report.maxScore} {t.home.pointsLabel}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {Object.entries(report.checks).map(([id, check]) => {
              const notApplicable = check.applicable === false;
              return (
                <div
                  key={id}
                  className={`glass-card rounded-lg px-4 py-3 ${notApplicable ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-100">
                      {notApplicable ? "➖" : check.passed ? "✅" : "⚠️"} {t.checks[id as keyof typeof t.checks] ?? id}
                    </span>
                    <span className="text-sm text-zinc-400" dir="ltr">
                      {notApplicable ? t.home.notApplicableLabel : `${check.score} / ${check.maxScore}`}
                    </span>
                  </div>
                  {/* Le detail vient de l'API et reste en francais (langue du backend). */}
                  <p className="mt-1 text-sm text-zinc-400" dir="ltr">
                    {check.details}
                  </p>
                </div>
              );
            })}
          </div>

          {report.errors.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {report.errors.length} {t.home.warningsNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
