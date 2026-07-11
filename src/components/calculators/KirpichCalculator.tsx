'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import {
  BRICK_SIZES,
  WALL_THICKNESS_M,
  computeBrickWall,
  type BrickFormat,
  type WallThickness,
} from './logic-kirpich';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

const FORMATS = Object.keys(BRICK_SIZES) as BrickFormat[];
const THICKNESSES = Object.keys(WALL_THICKNESS_M) as WallThickness[];

export function KirpichCalculator() {
  const [area, setArea] = useState<string>('');
  const [openings, setOpenings] = useState<string>('0');
  const [format, setFormat] = useState<BrickFormat>('1nf');
  const [thickness, setThickness] = useState<WallThickness>('1');
  const [reserve, setReserve] = useState<string>('5');

  // Постоянная ссылка на расчёт: ?s=…&op=…&f=…&th=…&res=…
  useCalcUrlState({
    onLoad: sp => {
      setArea(readParam(sp, 's'));
      const op = readParam(sp, 'op');
      if (op) setOpenings(op);
      const f = readParam(sp, 'f');
      if (FORMATS.includes(f as BrickFormat)) setFormat(f as BrickFormat);
      const th = readParam(sp, 'th');
      if (THICKNESSES.includes(th as WallThickness)) setThickness(th as WallThickness);
      const res = readParam(sp, 'res');
      if (res) setReserve(res);
    },
    params: {
      s: area,
      op: openings === '0' ? '' : openings,
      f: format === '1nf' ? '' : format,
      th: thickness === '1' ? '' : thickness,
      res: reserve === '5' ? '' : reserve,
    },
  });

  const netArea = Math.max(0, (parseFloat(area) || 0) - (parseFloat(openings) || 0));
  const result = computeBrickWall(netArea, format, thickness, parseFloat(reserve) || 0);
  const hasResult = netArea > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры стены</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kr-s">Площадь стен, м²</Label>
            <Input
              id="kr-s"
              type="number"
              min={0}
              step="0.1"
              placeholder="например, 20"
              value={area}
              onChange={e => setArea(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kr-op">Площадь проёмов (окна, двери), м²</Label>
            <Input
              id="kr-op"
              type="number"
              min={0}
              step="0.1"
              value={openings}
              onChange={e => setOpenings(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kr-f">Формат кирпича (ГОСТ 530)</Label>
            <select
              id="kr-f"
              style={selectStyle}
              value={format}
              onChange={e => setFormat(e.target.value as BrickFormat)}
            >
              {FORMATS.map(f => (
                <option key={f} value={f}>{BRICK_SIZES[f].label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kr-th">Толщина кладки</Label>
            <select
              id="kr-th"
              style={selectStyle}
              value={thickness}
              onChange={e => setThickness(e.target.value as WallThickness)}
            >
              <option value="0.5">В полкирпича (120 мм)</option>
              <option value="1">В кирпич (250 мм)</option>
              <option value="1.5">В полтора кирпича (380 мм)</option>
              <option value="2">В два кирпича (510 мм)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kr-res">Запас на бой и подрезку, %</Label>
            <Input
              id="kr-res"
              type="number"
              min={0}
              max={20}
              value={reserve}
              onChange={e => setReserve(e.target.value)}
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Результат расчёта</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Укажите площадь стен для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Кирпича на 1 м² кладки" value={`${fmt(result.perSquareMeter)} шт`} />
              <ResultRow label="Без запаса" value={`${fmt(Math.ceil(result.bricksNet))} шт`} />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow
                label={`К заказу с запасом ${fmt(parseFloat(reserve) || 0)}%`}
                value={`${fmt(result.bricksWithReserve)} шт`}
                large
              />
              <ResultRow label="Объём кладки" value={`${fmt(result.masonryVolumeM3)} м³`} />
              <ResultRow label="Раствор (геометрически)" value={`${fmt(result.mortarM3)} м³`} accent />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Расчёт для полнотелого кирпича со швом 10 мм. Фактический расход раствора выше
                на потери — добавьте 10–15%.
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
