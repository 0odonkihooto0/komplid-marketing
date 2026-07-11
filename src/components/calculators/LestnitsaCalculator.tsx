'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { computeStair, STAIR_MAX_SLOPE, type StairType } from './logic-lestnitsa';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

const STAIR_TYPES = Object.keys(STAIR_MAX_SLOPE) as StairType[];

export function LestnitsaCalculator() {
  const [floorHeight, setFloorHeight] = useState<string>('');
  const [tread, setTread] = useState<string>('0.3');
  const [riser, setRiser] = useState<string>('0.15');
  const [stairType, setStairType] = useState<StairType>('public');

  // Постоянная ссылка на расчёт: ?h=…&b=…&r=…&type=…
  useCalcUrlState({
    onLoad: sp => {
      setFloorHeight(readParam(sp, 'h'));
      const b = readParam(sp, 'b');
      if (b) setTread(b);
      const r = readParam(sp, 'r');
      if (r) setRiser(r);
      const t = readParam(sp, 'type');
      if (STAIR_TYPES.includes(t as StairType)) setStairType(t as StairType);
    },
    params: {
      h: floorHeight,
      b: tread === '0.3' ? '' : tread,
      r: riser === '0.15' ? '' : riser,
      type: stairType === 'public' ? '' : stairType,
    },
  });

  const result = computeStair(
    parseFloat(floorHeight) || 0,
    parseFloat(tread) || 0,
    parseFloat(riser) || 0,
    stairType,
  );
  const hasResult = result.steps > 0;
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры лестницы</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ls-h">Высота этажа (пол — пол), м</Label>
            <Input
              id="ls-h"
              type="number"
              min={0}
              step="0.01"
              placeholder="например, 3,0"
              value={floorHeight}
              onChange={e => setFloorHeight(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ls-b">Проступь, м</Label>
              <Input
                id="ls-b"
                type="number"
                min={0}
                step="0.01"
                value={tread}
                onChange={e => setTread(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ls-r">Подступёнок (желаемый), м</Label>
              <Input
                id="ls-r"
                type="number"
                min={0}
                step="0.005"
                value={riser}
                onChange={e => setRiser(e.target.value)}
              />
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: -8 }}>
            Норма СП 118: проступь 0,3 м (280–350), подступёнок 0,15 м (130–170).
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ls-type">Тип лестницы (предельный уклон, п. 5.8)</Label>
            <select
              id="ls-type"
              style={selectStyle}
              value={stairType}
              onChange={e => setStairType(e.target.value as StairType)}
            >
              {STAIR_TYPES.map(t => (
                <option key={t} value={t}>{STAIR_MAX_SLOPE[t].label}</option>
              ))}
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Подбор ступеней</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Укажите высоту этажа и параметры ступени.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Ступеней (подъёмов)" value={`${result.steps} шт`} large />
              <ResultRow
                label="Фактический подступёнок"
                value={`${fmt(result.riserM * 1000)} мм`}
                accent
              />
              <ResultRow label="Уклон марша" value={`1:${fmt(1 / (result.slope || 1))}`} />
              <ResultRow label="Формула удобства 2h + b" value={`${fmt(result.blondelMm)} мм`} />
              <ResultRow label="Длина марша в плане" value={`${fmt(result.runM)} м`} />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              {isCompliant ? (
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--ok)' }}>
                  Соответствует пп. 5.7–5.8 СП 118.13330.2022
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
              {result.warnings.map((w, i) => (
                <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--warn)', lineHeight: 1.5 }}>
                  {w}
                </p>
              ))}
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Для жилых зданий и эвакуационных лестниц действуют свои нормы (СП 54.13330,
                СП 1.13130) — проверьте требования своего типа здания.
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
