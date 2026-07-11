'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt } from './shared';
import { computeKraska } from './logic-kraska';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function KraskaCalculator() {
  const [area, setArea] = useState<string>('');
  const [rate, setRate] = useState<string>('0.12');
  const [coats, setCoats] = useState<string>('2');
  const [canVolume, setCanVolume] = useState<string>('2.5');

  // Постоянная ссылка на расчёт: ?s=…&rate=…&coats=…&can=…
  useCalcUrlState({
    onLoad: sp => {
      setArea(readParam(sp, 's'));
      const pairs: [string, (v: string) => void][] = [
        ['rate', setRate],
        ['coats', setCoats],
        ['can', setCanVolume],
      ];
      for (const [key, setter] of pairs) {
        const v = readParam(sp, key);
        if (v) setter(v);
      }
    },
    params: {
      s: area,
      rate: rate === '0.12' ? '' : rate,
      coats: coats === '2' ? '' : coats,
      can: canVolume === '2.5' ? '' : canVolume,
    },
  });

  const result = computeKraska(
    parseFloat(area) || 0,
    parseFloat(rate) || 0,
    parseFloat(coats) || 0,
    parseFloat(canVolume) || 0,
  );
  const hasResult = result.litersTotal > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры окраски</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kk-s">Площадь под окраску, м²</Label>
            <Input
              id="kk-s"
              type="number"
              min={0}
              step="0.1"
              placeholder="например, 45"
              value={area}
              onChange={e => setArea(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kk-rate">Расход на слой, л/м²</Label>
            <Input
              id="kk-rate"
              type="number"
              min={0}
              step="0.01"
              value={rate}
              onChange={e => setRate(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              С банки краски: укрывистость 8–12 м²/л соответствует расходу 0,08–0,12 л/м².
              На пористых основаниях расход выше.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kk-coats">Слоёв</Label>
              <Input
                id="kk-coats"
                type="number"
                min={1}
                max={5}
                value={coats}
                onChange={e => setCoats(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kk-can">Объём банки, л</Label>
              <Input
                id="kk-can"
                type="number"
                min={0}
                step="0.1"
                value={canVolume}
                onChange={e => setCanVolume(e.target.value)}
              />
            </div>
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
              Укажите площадь и расход краски.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="На один слой" value={`${fmt(result.litersPerCoat)} л`} />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow
                label={`Всего (${coats} ${Number(coats) === 1 ? 'слой' : 'слоя'})`}
                value={`${fmt(result.litersTotal)} л`}
                large
              />
              <ResultRow
                label={`Банок по ${fmt(parseFloat(canVolume) || 0)} л`}
                value={`${result.cans} шт`}
                accent
              />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Колерованную краску заказывайте с небольшим запасом одной партией —
                повторная колеровка может отличаться оттенком.
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
