"use client";

import { useState, FormEvent } from "react";
import type { ScanReport, ApiError } from "./types";

// En prod, Nginx sert le frontend et l'API sous le meme domaine (voir
// deploy/nginx.conf.example) - une URL relative suffit et evite le CORS.
// En dev local, NEXT_PUBLIC_API_URL (voir .env.local) pointe vers l'API
// qui tourne sur un port different.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const CHECK_LABELS: Record<string, string> = {
  mintAuthority: "Mint authority",
  freezeAuthority: "Freeze authority",
  holderConcentration: "Concentration des holders",
  metadataAuthority: "Mutabilite des metadata",
  lpLock: "Verrouillage de la liquidite (LP)",
  tokenExtensions: "Extensions Token-2022",
};

const RISK_STYLES: Record<ScanReport["riskLevel"], string> = {
  LOW: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  MEDIUM:
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  CRITICAL: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

const RISK_LABELS: Record<ScanReport["riskLevel"], string> = {
  LOW: "Risque faible",
  MEDIUM: "Risque modere",
  HIGH: "Risque eleve",
  CRITICAL: "Risque critique",
};

export default function ScanForm() {
  const [mint, setMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScanReport | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = mint.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch(`${API_URL}/api/scan/${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        setError((data as ApiError).error || "Erreur inconnue");
        return;
      }

      setReport(data as ScanReport);
    } catch {
      setError("Impossible de contacter le serveur de scan. Reessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          placeholder="Adresse du mint (ex: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263)"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || !mint.trim()}
          className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Scan en cours..." : "Scanner"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${RISK_STYLES[report.riskLevel]}`}>
              {RISK_LABELS[report.riskLevel]}
            </span>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {report.totalScore} / {report.maxScore} points
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {Object.entries(report.checks).map(([id, check]) => (
              <div
                key={id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {check.passed ? "✅" : "⚠️"} {CHECK_LABELS[id] || id}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {check.score} / {check.maxScore}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{check.details}</p>
              </div>
            ))}
          </div>

          {report.errors.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {report.errors.length} avertissement(s) technique(s) pendant le scan (voir details ci-dessus si un
              check est marque non verifiable).
            </div>
          )}
        </div>
      )}
    </div>
  );
}
