'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import {
  computeKeyRatePenalty,
  computeContractPenalty,
  type PenaltyFraction,
} from './logic-penalty';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

type FractionOption = '300' | '150' | '130' | 'custom';

const FRACTIONS: { value: FractionOption; label: string }[] = [
  { value: '300', label: '1/300 ключевой ставки (44-ФЗ, стандарт)' },
  { value: '150', label: '1/150 ключевой ставки (двойная)' },
  { value: '130', label: '1/130 ключевой ставки' },
  { value: 'custom', label: 'Договорной процент за день' },
];

export function NeustoykaCalculator() {
  const [baseAmount, setBaseAmount] = useState<string>('');
  const [keyRate, setKeyRate] = useState<string>('');
  const [fraction, setFraction] = useState<FractionOption>('300');
  const [pctPerDay, setPctPerDay] = useState<string>('0.1');
  const [days, setDays] = useState<string>('');

  // Постоянная ссылка на расчёт: ?sum=…&rate=…&frac=…&pd=…&days=…
  useCalcUrlState({
    onLoad: sp => {
      setBaseAmount(readParam(sp, 'sum'));
      setKeyRate(readParam(sp, 'rate'));
      setDays(readParam(sp, 'days'));
      const frac = readParam(sp, 'frac');
      if (frac === '300' || frac === '150' || frac === '130' || frac === 'custom') {
        setFraction(frac);
      }
      const pd = readParam(sp, 'pd');
      if (pd) setPctPerDay(pd);
    },
    params: {
      sum: baseAmount,
      rate: fraction === 'custom' ? '' : keyRate,
      frac: fraction === '300' ? '' : fraction,
      pd: fraction === 'custom' ? pctPerDay : '',
      days,
    },
  });

  const base = parseFloat(baseAmount) || 0;
  const nDays = parseInt(days, 10) || 0;
  const result =
    fraction === 'custom'
      ? computeContractPenalty(base, parseFloat(pctPerDay) || 0, nDays)
      : computeKeyRatePenalty(
          base,
          parseFloat(keyRate) || 0,
          Number(fraction) as PenaltyFraction,
          nDays,
        );

  const hasResult = base > 0 && nDays > 0 && (fraction === 'custom' || (parseFloat(keyRate) || 0) > 0);

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Поля ввода */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры просрочки</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ne-sum">Сумма неисполненного обязательства, ₽</Label>
            <Input
              id="ne-sum"
              type="number"
              min={0}
              placeholder="например, 1 000 000"
              value={baseAmount}
              onChange={e => setBaseAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ne-frac">Ставка неустойки</Label>
            <select
              id="ne-frac"
              style={selectStyle}
              value={fraction}
              onChange={e => setFraction(e.target.value as FractionOption)}
            >
              {FRACTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {fraction === 'custom' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ne-pd">Процент за день просрочки, %</Label>
              <Input
                id="ne-pd"
                type="number"
                min={0}
                step="0.01"
                placeholder="0,1"
                value={pctPerDay}
                onChange={e => setPctPerDay(e.target.value)}
              />
              <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                Размер указывается в договоре подряда (обычно 0,01–0,5% в день).
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ne-rate">Ключевая ставка ЦБ, %</Label>
              <Input
                id="ne-rate"
                type="number"
                min={0}
                step="0.25"
                placeholder="например, 16"
                value={keyRate}
                onChange={e => setKeyRate(e.target.value)}
              />
              <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                Актуальное значение —{' '}
                <a
                  href="https://www.cbr.ru/hd_base/keyrate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}
                >
                  на сайте ЦБ РФ
                </a>
                . По 44-ФЗ применяется ставка на дату уплаты пеней.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ne-days">Дней просрочки (календарных)</Label>
            <Input
              id="ne-days"
              type="number"
              min={0}
              placeholder="например, 30"
              value={days}
              onChange={e => setDays(e.target.value)}
            />
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Расчёт неустойки</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Укажите сумму, ставку и количество дней просрочки.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Пени за один день" value={`${fmt(result.perDay)} ₽`} />
              <ResultRow label="Дней просрочки" value={String(nDays)} />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Итого неустойка" value={`${fmt(result.total)} ₽`} large />
              <ResultRow label="Доля от суммы обязательства" value={`${fmt(result.percentOfBase)} %`} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Суд вправе уменьшить несоразмерную неустойку (ст. 333 ГК РФ). Расчёт справочный.
              </p>
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
