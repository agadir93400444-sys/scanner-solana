import assert from "node:assert/strict";
import { linearScore, bigintPercent } from "../checks/scoring";

function run() {
  // linearScore - concentration holders (higherIsBetter=false, good=20, bad=80)
  assert.equal(linearScore(0, 20, 80, 20, false), 20, "0% concentration -> score max");
  assert.equal(linearScore(20, 20, 80, 20, false), 20, "pile au bon seuil -> score max");
  assert.equal(linearScore(50, 20, 80, 20, false), 10, "milieu de bande -> moitie du poids");
  assert.equal(linearScore(80, 20, 80, 20, false), 0, "pile au mauvais seuil -> 0");
  assert.equal(linearScore(100, 20, 80, 20, false), 0, "au dela du mauvais seuil -> 0");

  // linearScore - burn % LP (higherIsBetter=true, good=90, bad=30)
  assert.equal(linearScore(100, 90, 30, 20, true), 20, "100% brule -> score max");
  assert.equal(linearScore(90, 90, 30, 20, true), 20, "pile au bon seuil -> score max");
  assert.equal(linearScore(60, 90, 30, 20, true), 10, "milieu de bande -> moitie du poids");
  assert.equal(linearScore(30, 90, 30, 20, true), 0, "pile au mauvais seuil -> 0");
  assert.equal(linearScore(0, 90, 30, 20, true), 0, "0% brule -> 0");

  // bigintPercent
  assert.equal(bigintPercent(200n, 1000n), 20, "200/1000 -> 20%");
  assert.equal(bigintPercent(1n, 3n), 33.33, "1/3 -> 33.33% (troncature raisonnable)");
  assert.equal(bigintPercent(0n, 1000n), 0, "0/1000 -> 0%");
  assert.equal(bigintPercent(1000n, 1000n), 100, "part == whole -> 100%");
  assert.equal(bigintPercent(500n, 0n), 0, "division par zero -> 0, pas de crash");

  console.log("checkScoring.test.ts: OK");
}

run();
