import assert from "node:assert/strict";
import { computeRiskLevel } from "../checks/scanService";

function run() {
  assert.equal(computeRiskLevel(90, 100), "LOW");
  assert.equal(computeRiskLevel(80, 100), "LOW");
  assert.equal(computeRiskLevel(60, 100), "MEDIUM");
  assert.equal(computeRiskLevel(25, 100), "HIGH");
  assert.equal(computeRiskLevel(10, 100), "CRITICAL");
  assert.equal(computeRiskLevel(0, 100), "CRITICAL");
  assert.equal(computeRiskLevel(50, 50), "LOW"); // 100% avec un score partiel (peu de checks actifs)

  console.log("scoring.test.ts: OK");
}

run();
