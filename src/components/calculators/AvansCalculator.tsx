'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { computeAvans, type VatRate } from './logic';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function AvansCalculator() {
  const [contractAmount, setContractAmount] = useState<string>('');
  const [advancePct, setAdvancePct] = useState<string>('20');
  const [vatRate, setVatRate] = useState<VatRate>(20);

  // Постоянная ссылка на расчёт: ?sum=…&pct=…&vat=… (дефолты в URL не пишем)
  useCalcUrlState({
    onLoad: sp => {
      setContractAmount(readParam(sp, 'sum'));
      const pct = readParam(sp, 'pct');
      if (pct) setAdvancePct(pct);
      const vat = readParam(sp, 'vat');
      if (vat === '20' || vat === '10' || vat === '0') setVatRate(Number(vat) as VatRate);
    },
    params: {
      sum: contractAmount,
      pct: advancePct === '20' ? '' : advancePct,
      vat: vatRate === 20 ? '' : String(vatRate),
    },
  });

  const amount = parseFloat(contractAmount) || 0;
  const { advanceAmount, remaining, vatAmount, totalWithVat, advanceWithVat } = computeAvans(
    amount,
    parseFloat(advancePct) || 0,
    vatRate,
  );

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры контракта</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="calc-amount">Сумма контракта, ₽ (без НДС)</Label>
            <Input
              id="calc-amount"
              type="number"
              min={0}
              placeholder="например, 1 000 000"
              value={contractAmount}
              onChange={e => setContractAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="calc-pct">Процент аванса, %</Label>
            <Input
              id="calc-pct"
              type="number"
              min={0}
              max={100}
              placeholder="20"
              value={advancePct}
              onChange={e => setAdvancePct(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              По 44-ФЗ — не более 30%. По коммерческому договору — по соглашению.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="calc-vat">Ставка НДС</Label>
            <select id="calc-vat" style={selectStyle} value={vatRate} onChange={handleVatChange}>
              <option value={20}>20% (ОСНО, стандартная для СМР)</option>
              <option value={10}>10%</option>
              <option value={0}>0% / без НДС (УСН)</option>
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Результат расчёта</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Введите сумму контракта для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Сумма аванса (без НДС)" value={`${fmt(advanceAmount)} ₽`} />
              <ResultRow label="Аванс с НДС" value={`${fmt(advanceWithVat)} ₽`} accent />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Остаток после аванса (без НДС)" value={`${fmt(remaining)} ₽`} />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label={`НДС ${vatRate}%`} value={`${fmt(vatAmount)} ₽`} />
              <ResultRow label="Итого по контракту с НДС" value={`${fmt(totalWithVat)} ₽`} large />
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
