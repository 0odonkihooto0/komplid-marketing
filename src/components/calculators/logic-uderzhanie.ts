// Гарантийное удержание по договору строительного подряда.
//
// Правовая основа: свобода договора (ст. 421 ГК РФ) — стороны согласуют
// удержание части оплаты (обычно 5–10% от каждого акта КС-2) до окончания
// гарантийного срока или ввода объекта в эксплуатацию. Специальной нормы
// с процентом в законе нет, значения — практика рынка.

export interface RetentionResult {
  /** Удержание с текущего акта, ₽ */
  retentionFromAct: number;
  /** К выплате по акту после удержания, ₽ */
  payableFromAct: number;
  /** Общий объём удержания по контракту (если известна цена контракта), ₽ */
  totalRetention: number | null;
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Процент удержания ограничивается [0, 100]. */
export function computeRetention(
  actAmount: number,
  retentionPct: number,
  contractPrice?: number,
): RetentionResult {
  const act = clampNonNegative(actAmount);
  const pct = Math.min(100, clampNonNegative(retentionPct));
  const retentionFromAct = (act * pct) / 100;
  const contract = contractPrice !== undefined ? clampNonNegative(contractPrice) : 0;
  return {
    retentionFromAct,
    payableFromAct: act - retentionFromAct,
    totalRetention: contract > 0 ? (contract * pct) / 100 : null,
  };
}
