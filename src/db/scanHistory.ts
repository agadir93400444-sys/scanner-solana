import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { ScanReport } from "../types";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "scan_history.db");

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mint TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    total_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    report_json TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_scans_mint ON scans(mint);
`);

const insertStmt = db.prepare(
  "INSERT INTO scans (mint, timestamp, total_score, max_score, risk_level, report_json) VALUES (?, ?, ?, ?, ?, ?)"
);

const historyStmt = db.prepare(
  "SELECT report_json FROM scans WHERE mint = ? ORDER BY id DESC LIMIT ?"
);

export function saveScan(report: ScanReport): void {
  insertStmt.run(
    report.mint,
    report.timestamp,
    report.totalScore,
    report.maxScore,
    report.riskLevel,
    JSON.stringify(report)
  );
}

export function getScanHistory(mint: string, limit = 20): ScanReport[] {
  const rows = historyStmt.all(mint, limit) as { report_json: string }[];
  return rows.map((row) => JSON.parse(row.report_json) as ScanReport);
}
