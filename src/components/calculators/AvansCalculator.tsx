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

export function AvansCalculator() {
  const [contractAmount, setContractAmount] = useState<string>('');
  const [advancePct, setAdvancePct] = useState<string>('20');
  const [vatRate, setVatRate] = useState<VatRate>(20);

  const amount = parseFloat(contractAmount) || 0;
  const pct = Math.min(100, Math.max(0, parseFloat(advancePct) || 0));

  const advanceAmount = amount * pct / 100;
  const remaining = amount - advanceAmount;
  const vatAmount = amount * vatRate / 100;
  const totalWithVat = amount + vatAmount;
  const advanceWithVat = advanceAmount * (1 + vatRate / 100);

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
    </div>
  );
}

function ResultRow({
  label,
  value,
  accent,
  large,
}: {
  label: string;
  value: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
      <strong
        style={{
          fontSize: large ? 20 : accent ? 16 : 14,
          color: accent || large ? 'var(--accent-strong)' : 'var(--ink)',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  );
}
