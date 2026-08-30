/**
 * Score lineaire entre deux seuils, partage par les checks a barème continu
 * (concentration holders, burn % LP...). Selon higherIsBetter :
 * - false (ex: % de concentration) : score max EN DESSOUS de goodThreshold,
 *   nul AU DESSUS de badThreshold (goodThreshold < badThreshold).
 * - true (ex: % de LP brule) : l'inverse, score max AU DESSUS de
 *   goodThreshold, nul EN DESSOUS de badThreshold (goodThreshold > badThreshold).
 */
export function linearScore(
  value: number,
  goodThreshold: number,
  badThreshold: number,
  weight: number,
  higherIsBetter: boolean
): number {
  if (higherIsBetter) {
    if (value >= goodThreshold) return weight;
    if (value <= badThreshold) return 0;
    const ratio = (value - badThreshold) / (goodThreshold - badThreshold);
    return Math.round(weight * ratio);
  }

  if (value <= goodThreshold) return weight;
  if (value >= badThreshold) return 0;
  const ratio = 1 - (value - goodThreshold) / (badThreshold - goodThreshold);
  return Math.round(weight * ratio);
}

/**
 * Pourcentage entre deux BigInt (montants on-chain en unites brutes), avec
 * une precision de 2 decimales - suffisant pour un ratio, jamais utilise
 * pour comparer des montants.
 */
export function bigintPercent(part: bigint, whole: bigint): number {
  if (whole === 0n) return 0;
  return Number((part * 10000n) / whole) / 100;
}
