import type { CSSProperties } from 'react';

// Общие утилиты калькуляторов — вынесены из Ks2Calculator и AvansCalculator,
// где раньше дублировались один-в-один.

export function fmt(n: number) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

export const selectStyle: CSSProperties = {
  background: 'var(--bg-inset)',
  border: '1px solid var(--border)',
  color: 'var(--ink)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  height: 40,
};
