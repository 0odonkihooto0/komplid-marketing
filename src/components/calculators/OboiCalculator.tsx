'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt } from './shared';
import { computeOboi } from './logic-oboi';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function OboiCalculator() {
  const [perimeter, setPerimeter] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [rollW, setRollW] = useState<string>('0.53');
  const [rollL, setRollL] = useState<string>('10.05');
  const [rapportCm, setRapportCm] = useState<string>('0');
  const [openings, setOpenings] = useState<string>('0');

  // Постоянная ссылка на расчёт: ?p=…&h=…&rw=…&rl=…&rap=…&op=…
  useCalcUrlState({
    onLoad: sp => {
      setPerimeter(readParam(sp, 'p'));
      setHeight(readParam(sp, 'h'));
      const pairs: [string, (v: string) => void][] = [
        ['rw', setRollW],
        ['rl', setRollL],
        ['rap', setRapportCm],
        ['op', setOpenings],
      ];
      for (const [key, setter] of pairs) {
        const v = readParam(sp, key);
        if (v) setter(v);
      }
    },
    params: {
      p: perimeter,
      h: height,
      rw: rollW === '0.53' ? '' : rollW,
      rl: rollL === '10.05' ? '' : rollL,
      rap: rapportCm === '0' ? '' : rapportCm,
      op: openings === '0' ? '' : openings,
    },
  });

  const result = computeOboi(
    parseFloat(perimeter) || 0,
    parseFloat(height) || 0,
    parseFloat(rollW) || 0,
    parseFloat(rollL) || 0,
    (parseFloat(rapportCm) || 0) / 100,
    parseFloat(openings) || 0,
  );
  const hasResult = result.rolls > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры комнаты и обоев</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ob-p">Периметр стен, м</Label>
              <Input
                id="ob-p"
                type="number"
                min={0}
                step="0.1"
                placeholder="14"
                value={perimeter}
                onChange={e => setPerimeter(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ob-h">Высота стен, м</Label>
              <Input
                id="ob-h"
                type="number"
                min={0}
                step="0.01"
                placeholder="2,7"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ob-rw">Ширина рулона, м</Label>
              <Input
                id="ob-rw"
                type="number"
                min={0}
                step="0.01"
                value={rollW}
                onChange={e => setRollW(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="ob-rl">Длина рулона, м</Label>
              <Input
                id="ob-rl"
                type="number"
                min={0}
                step="0.01"
                value={rollL}
                onChange={e => setRollL(e.target.value)}
              />
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: -8 }}>
            Стандартные рулоны: 0,53 × 10,05 м и 1,06 × 10,05 м.
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ob-rap">Раппорт (шаг рисунка), см</Label>
            <Input
              id="ob-rap"
              type="number"
              min={0}
              value={rapportCm}
              onChange={e => setRapportCm(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Указан на этикетке рулона; 0 — рисунок без подгонки.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ob-op">Суммарная ширина проёмов, м</Label>
            <Input
              id="ob-op"
              type="number"
              min={0}
              step="0.1"
              value={openings}
              onChange={e => setOpenings(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Двери и окна на всю высоту полосы (например, дверь 0,9 + окно 1,4 = 2,3 м).
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
              Укажите периметр и высоту стен.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Высота полосы (с раппортом)" value={`${fmt(result.stripHeightM)} м`} />
              <ResultRow label="Полос из одного рулона" value={`${result.stripsPerRoll} шт`} />
              <ResultRow label="Полос всего" value={`${result.stripsNeeded} шт`} />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Рулонов к покупке" value={`${result.rolls} шт`} large />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Покупайте рулоны из одной партии — оттенок между партиями отличается.
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
