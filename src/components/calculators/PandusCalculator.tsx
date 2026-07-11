'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt } from './shared';
import { computePandus } from './logic-pandus';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function PandusCalculator() {
  const [height, setHeight] = useState<string>('');
  const [slope, setSlope] = useState<string>('50');

  // Постоянная ссылка на расчёт: ?h=…&slope=…
  useCalcUrlState({
    onLoad: sp => {
      setHeight(readParam(sp, 'h'));
      const s = readParam(sp, 'slope');
      if (s) setSlope(s);
    },
    params: {
      h: height,
      slope: slope === '50' ? '' : slope,
    },
  });

  const h = parseFloat(height) || 0;
  const result = computePandus(h, parseFloat(slope) || 0);
  const hasResult = h > 0 && result.totalLengthM > 0;
  const isCompliant = result.violations.length === 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры пандуса</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pd-h">Перепад высот, м</Label>
            <Input
              id="pd-h"
              type="number"
              min={0}
              step="0.01"
              placeholder="например, 1,0"
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Пандус применяется при перепаде от 0,014 до 6,0 м (п. 5.1.14 СП 59.13330).
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pd-slope">Продольный уклон, ‰</Label>
            <Input
              id="pd-slope"
              type="number"
              min={0}
              max={100}
              value={slope}
              onChange={e => setSlope(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              50 ‰ = 1:20 (типовой), максимум 80 ‰ = 1:12,5. Промилле = мм подъёма на 1 м длины.
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Результат проверки по СП 59</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Укажите перепад высот и уклон.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Уклон" value={`1:${fmt(result.slopeRatioX)}`} />
              <ResultRow
                label="Длина наклонных поверхностей"
                value={`${fmt(result.totalLengthM)} м`}
                large
              />
              {result.maxMarchM !== null && (
                <>
                  <ResultRow label="Марш не более (табл. 5.1)" value={`${fmt(result.maxMarchM)} м`} />
                  <ResultRow label="Маршей" value={`${result.marches} шт`} accent />
                  <ResultRow
                    label="Промежуточных площадок (1,5×1,5 м)"
                    value={`${result.landings} шт`}
                  />
                </>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              {isCompliant ? (
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--ok)' }}>
                  Соответствует требованиям СП 59.13330.2020
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.violations.map((v, i) => (
                    <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--err)', lineHeight: 1.5 }}>
                      {v}
                    </p>
                  ))}
                </div>
              )}
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Не забудьте площадки в начале и конце пандуса, бортики 0,05 м и поручни
                на высоте 0,9 и 0,7 м (пп. 5.1.16 СП 59).
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
