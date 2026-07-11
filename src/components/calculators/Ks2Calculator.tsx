'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { computeKs2, type VatRate } from './logic';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function Ks2Calculator() {
  const [amountExVat, setAmountExVat] = useState<string>('');
  const [vatRate, setVatRate] = useState<VatRate>(20);

  // Постоянная ссылка на расчёт: ?sum=…&vat=… (дефолтную ставку 20 не пишем)
  useCalcUrlState({
    onLoad: sp => {
      setAmountExVat(readParam(sp, 'sum'));
      const vat = readParam(sp, 'vat');
      if (vat === '20' || vat === '10' || vat === '0') setVatRate(Number(vat) as VatRate);
    },
    params: {
      sum: amountExVat,
      vat: vatRate === 20 ? '' : String(vatRate),
    },
  });

  const amount = parseFloat(amountExVat) || 0;
  const { vatAmount, totalInclVat } = computeKs2(amount, vatRate);
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
              <ResultRow label="Всего по акту (без НДС)" value={`${fmt(amount)} ₽`} />
              <ResultRow
                label={vatRate === 0 ? 'НДС не облагается' : `НДС ${vatRate}%`}
                value={vatRate === 0 ? '—' : `${fmt(vatAmount)} ₽`}
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Итого к оплате (с НДС)" value={`${fmt(totalInclVat)} ₽`} large />
              {vatRate === 0 && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                  Подрядчик применяет УСН. НДС не начисляется, в акте указывается «НДС не облагается».
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <CopyLinkButton />
      </div>
    </div>
  );
}
