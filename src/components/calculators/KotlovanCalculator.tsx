'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { computePit, computeTrench, type ExcavationType } from './logic-kotlovan';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function KotlovanCalculator() {
  const [mode, setMode] = useState<ExcavationType>('pit');
  const [x1, setX1] = useState<string>(''); // котлован: дно a / траншея: ширина по дну
  const [x2, setX2] = useState<string>(''); // котлован: дно b / траншея: длина
  const [depth, setDepth] = useState<string>('');
  const [slope, setSlope] = useState<string>('0.5');
  const [loose, setLoose] = useState<string>('1.25');

  // Постоянная ссылка на расчёт: ?t=…&x1=…&x2=…&h=…&m=…&k=…
  useCalcUrlState({
    onLoad: sp => {
      const t = readParam(sp, 't');
      if (t === 'pit' || t === 'trench') setMode(t);
      setX1(readParam(sp, 'x1'));
      setX2(readParam(sp, 'x2'));
      setDepth(readParam(sp, 'h'));
      const m = readParam(sp, 'm');
      if (m) setSlope(m);
      const k = readParam(sp, 'k');
      if (k) setLoose(k);
    },
    params: {
      t: mode === 'pit' ? '' : mode,
      x1,
      x2,
      h: depth,
      m: slope === '0.5' ? '' : slope,
      k: loose === '1.25' ? '' : loose,
    },
  });

  const v1 = parseFloat(x1) || 0;
  const v2 = parseFloat(x2) || 0;
  const h = parseFloat(depth) || 0;
  const m = parseFloat(slope) || 0;
  const k = parseFloat(loose) || 0;
  const result =
    mode === 'pit' ? computePit(v1, v2, h, m, k) : computeTrench(v1, h, m, v2, k);
  const hasResult = result.volume > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры выемки</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kv-mode">Тип выемки</Label>
            <select
              id="kv-mode"
              style={selectStyle}
              value={mode}
              onChange={e => setMode(e.target.value as ExcavationType)}
            >
              <option value="pit">Котлован (прямоугольный)</option>
              <option value="trench">Траншея</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kv-x1">
                {mode === 'pit' ? 'Дно: длина, м' : 'Ширина по дну, м'}
              </Label>
              <Input
                id="kv-x1"
                type="number"
                min={0}
                step="0.1"
                placeholder={mode === 'pit' ? '10' : '0,8'}
                value={x1}
                onChange={e => setX1(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kv-x2">
                {mode === 'pit' ? 'Дно: ширина, м' : 'Длина траншеи, м'}
              </Label>
              <Input
                id="kv-x2"
                type="number"
                min={0}
                step="0.1"
                placeholder={mode === 'pit' ? '8' : '50'}
                value={x2}
                onChange={e => setX2(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kv-h">Глубина, м</Label>
            <Input
              id="kv-h"
              type="number"
              min={0}
              step="0.1"
              placeholder="2"
              value={depth}
              onChange={e => setDepth(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kv-m">Заложение откоса m (гориз. на 1 м глубины)</Label>
            <Input
              id="kv-m"
              type="number"
              min={0}
              step="0.05"
              value={slope}
              onChange={e => setSlope(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Принимается по правилам охраны труда в строительстве в зависимости от грунта
              и глубины (СП 45.13330 п. 6.1.10); 0 — отвесные стенки с креплением.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kv-k">Коэффициент первоначального разрыхления</Label>
            <Input
              id="kv-k"
              type="number"
              min={1}
              step="0.05"
              value={loose}
              onChange={e => setLoose(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Ориентировочно: песок ~1,1, суглинок ~1,2–1,3 — уточняйте по своему грунту.
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
              Укажите размеры и глубину выемки.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow
                label={mode === 'pit' ? 'Размер поверху' : 'Ширина поверху'}
                value={
                  mode === 'pit'
                    ? `${fmt(result.topA)} × ${fmt(result.topB)} м`
                    : `${fmt(result.topA)} м`
                }
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Объём выемки (плотное тело)" value={`${fmt(result.volume)} м³`} large />
              <ResultRow
                label={`К вывозу с разрыхлением ×${fmt(Math.max(1, k))}`}
                value={`${fmt(result.looseVolume)} м³`}
                accent
              />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Самосвал вмещает 6–12 м³ разрыхлённого грунта — делите объём вывоза на
                вместимость вашей техники.
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
