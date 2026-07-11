'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import {
  REBAR_DIAMETERS,
  rebarFromLength,
  rebarFromMass,
  DEFAULT_BAR_LENGTH_M,
} from './logic-armatura';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

type Direction = 'length' | 'mass';

export function ArmaturaCalculator() {
  const [direction, setDirection] = useState<Direction>('length');
  const [diameter, setDiameter] = useState<string>('12');
  const [amount, setAmount] = useState<string>('');
  const [barLength, setBarLength] = useState<string>(String(DEFAULT_BAR_LENGTH_M));

  // Постоянная ссылка на расчёт: ?dir=…&d=…&v=…&bar=…
  useCalcUrlState({
    onLoad: sp => {
      if (readParam(sp, 'dir') === 'mass') setDirection('mass');
      const d = readParam(sp, 'd');
      if (d && REBAR_DIAMETERS.includes(Number(d))) setDiameter(d);
      setAmount(readParam(sp, 'v'));
      const bar = readParam(sp, 'bar');
      if (bar) setBarLength(bar);
    },
    params: {
      dir: direction === 'length' ? '' : direction,
      d: diameter === '12' ? '' : diameter,
      v: amount,
      bar: barLength === String(DEFAULT_BAR_LENGTH_M) ? '' : barLength,
    },
  });

  const d = Number(diameter);
  const value = parseFloat(amount) || 0;
  const bar = parseFloat(barLength) || 0;
  const result =
    direction === 'length' ? rebarFromLength(d, value, bar) : rebarFromMass(d, value, bar);
  const hasResult = value > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры арматуры</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ar-dir">Что известно</Label>
            <select
              id="ar-dir"
              style={selectStyle}
              value={direction}
              onChange={e => setDirection(e.target.value as Direction)}
            >
              <option value="length">Длина, м → масса</option>
              <option value="mass">Масса, кг → длина</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ar-d">Диаметр, мм</Label>
            <select
              id="ar-d"
              style={selectStyle}
              value={diameter}
              onChange={e => setDiameter(e.target.value)}
            >
              {REBAR_DIAMETERS.map(dd => (
                <option key={dd} value={dd}>Ø{dd}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ar-v">
              {direction === 'length' ? 'Общая длина, м' : 'Масса, кг'}
            </Label>
            <Input
              id="ar-v"
              type="number"
              min={0}
              placeholder={direction === 'length' ? 'например, 500' : 'например, 1 000'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ar-bar">Длина стержня, м</Label>
            <Input
              id="ar-bar"
              type="number"
              min={0}
              step="0.1"
              value={barLength}
              onChange={e => setBarLength(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Стандартная мерная длина при поставке — 11,7 м.
            </span>
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
              Укажите {direction === 'length' ? 'длину' : 'массу'} арматуры для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow
                label={`Теоретическая масса 1 м (Ø${diameter})`}
                value={`${fmt(result.massPerMeter)} кг`}
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              {direction === 'length' ? (
                <ResultRow label="Общая масса" value={`${fmt(result.totalMassKg)} кг`} large />
              ) : (
                <ResultRow label="Общая длина" value={`${fmt(result.totalLengthM)} м`} large />
              )}
              <ResultRow
                label={`Стержней по ${fmt(bar)} м`}
                value={`${result.bars} шт`}
                accent
              />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Теоретическая масса — по сортаменту ГОСТ 34028-2016. Фактическая может отличаться
                в пределах допусков проката.
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
