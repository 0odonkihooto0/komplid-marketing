'use client';

import { useState } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type VatRate = 20 | 10 | 0;

const selectStyle: CSSProperties = {
  background: 'var(--bg-inset)',
  border: '1px solid var(--border)',
  color: 'var(--ink)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  height: 40,
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

export function Ks2Calculator() {
  const [amountExVat, setAmountExVat] = useState<string>('');
  const [vatRate, setVatRate] = useState<VatRate>(20);

  const amount = parseFloat(amountExVat) || 0;
  const vatAmount = amount * vatRate / 100;
  const totalInclVat = amount + vatAmount;
  const hasResult = amount > 0;

  function handleVatChange(e: ChangeEvent<HTMLSelectElement>) {
    const v = Number(e.target.value);
    if (v === 20 || v === 10 || v === 0) setVatRate(v as VatRate);
  }

  return (
    <div
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 32,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {/* Поля ввода */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Данные акта КС-2</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ks2-amount">Сумма акта без НДС, ₽</Label>
            <Input
              id="ks2-amount"
              type="number"
              min={0}
              placeholder="например, 500 000"
              value={amountExVat}
              onChange={e => setAmountExVat(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ks2-vat">Ставка НДС</Label>
            <select id="ks2-vat" style={selectStyle} value={vatRate} onChange={handleVatChange}>
              <option value={20}>20% (ОСНО, стандартная для СМР)</option>
              <option value={10}>10%</option>
              <option value={0}>0% / без НДС (подрядчик на УСН)</option>
            </select>
          </div>
        </div>

        {/* Результаты */}
        <div
          style={{
            padding: 24,
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Строки акта КС-2</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Введите сумму акта для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <Row label="Всего по акту (без НДС)" value={`${fmt(amount)} ₽`} />
              <Row
                label={vatRate === 0 ? 'НДС не облагается' : `НДС ${vatRate}%`}
                value={vatRate === 0 ? '—' : `${fmt(vatAmount)} ₽`}
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <Row label="Итого к оплате (с НДС)" value={`${fmt(totalInclVat)} ₽`} large />
              {vatRate === 0 && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                  Подрядчик применяет УСН. НДС не начисляется, в акте указывается «НДС не облагается».
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
      <strong
        style={{
          fontSize: large ? 22 : 14,
          color: large ? 'var(--accent-strong)' : 'var(--ink)',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  );
}
