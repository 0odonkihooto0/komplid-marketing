'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import {
  computeLentaVolume,
  computePlitaVolume,
  computeSvaiVolume,
  withReserve,
  type FoundationType,
} from './logic-beton';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

// Подписи трёх полей ввода зависят от типа фундамента (общий стейт x1/x2/x3).
const FIELDS: Record<FoundationType, [string, string, string]> = {
  lenta: ['Длина ленты, м', 'Ширина ленты, м', 'Высота ленты, м'],
  plita: ['Длина плиты, м', 'Ширина плиты, м', 'Толщина плиты, м'],
  svai: ['Диаметр сваи, м', 'Глубина сваи, м', 'Количество свай, шт'],
};

const PLACEHOLDERS: Record<FoundationType, [string, string, string]> = {
  lenta: ['30', '0,4', '0,9'],
  plita: ['10', '8', '0,3'],
  svai: ['0,3', '2', '20'],
};

export function BetonCalculator() {
  const [mode, setMode] = useState<FoundationType>('lenta');
  const [x1, setX1] = useState<string>('');
  const [x2, setX2] = useState<string>('');
  const [x3, setX3] = useState<string>('');
  const [reserve, setReserve] = useState<string>('2');

  // Постоянная ссылка на расчёт: ?t=…&x1=…&x2=…&x3=…&res=…
  useCalcUrlState({
    onLoad: sp => {
      const t = readParam(sp, 't');
      if (t === 'lenta' || t === 'plita' || t === 'svai') setMode(t);
      setX1(readParam(sp, 'x1'));
      setX2(readParam(sp, 'x2'));
      setX3(readParam(sp, 'x3'));
      const res = readParam(sp, 'res');
      if (res) setReserve(res);
    },
    params: {
      t: mode === 'lenta' ? '' : mode,
      x1,
      x2,
      x3,
      res: reserve === '2' ? '' : reserve,
    },
  });

  const v1 = parseFloat(x1) || 0;
  const v2 = parseFloat(x2) || 0;
  const v3 = parseFloat(x3) || 0;
  const volume =
    mode === 'lenta'
      ? computeLentaVolume(v1, v2, v3)
      : mode === 'plita'
        ? computePlitaVolume(v1, v2, v3)
        : computeSvaiVolume(v1, v2, v3);
  const result = withReserve(volume, parseFloat(reserve) || 0);
  const hasResult = volume > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры фундамента</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="bt-mode">Тип фундамента</Label>
            <select
              id="bt-mode"
              style={selectStyle}
              value={mode}
              onChange={e => setMode(e.target.value as FoundationType)}
            >
              <option value="lenta">Ленточный</option>
              <option value="plita">Плитный</option>
              <option value="svai">Свайный / столбчатый</option>
            </select>
          </div>

          {[
            [x1, setX1, 0] as const,
            [x2, setX2, 1] as const,
            [x3, setX3, 2] as const,
          ].map(([value, setter, i]) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor={`bt-x${i}`}>{FIELDS[mode][i]}</Label>
              <Input
                id={`bt-x${i}`}
                type="number"
                min={0}
                step="0.01"
                placeholder={`например, ${PLACEHOLDERS[mode][i]}`}
                value={value}
                onChange={e => setter(e.target.value)}
              />
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="bt-res">Запас на потери, %</Label>
            <Input
              id="bt-res"
              type="number"
              min={0}
              max={20}
              step="0.5"
              value={reserve}
              onChange={e => setReserve(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Обычно 2% — на остатки в миксере, проливы и неровности опалубки.
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
              Заполните размеры фундамента для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Расчётный объём" value={`${fmt(result.volume)} м³`} />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow
                label={`К заказу с запасом ${fmt(parseFloat(reserve) || 0)}%`}
                value={`${fmt(result.volumeWithReserve)} м³`}
                large
              />
              <ResultRow
                label="Ориентировочная масса (2 400 кг/м³)"
                value={`${fmt(result.weightKg / 1000)} т`}
              />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Миксеры обычно поставляют бетон с шагом 0,5 м³ — округляйте заказ вверх.
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
