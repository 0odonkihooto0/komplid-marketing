'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import {
  WIND_REGIONS,
  TERRAIN,
  computeWindLoad,
  type WindRegion,
  type TerrainType,
} from './logic-veter';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

const TERRAIN_TYPES = Object.keys(TERRAIN) as TerrainType[];

export function VeterCalculator() {
  const [region, setRegion] = useState<WindRegion>('II');
  const [height, setHeight] = useState<string>('10');
  const [terrain, setTerrain] = useState<TerrainType>('B');
  const [aeroC, setAeroC] = useState<string>('0.8');
  const [gammaF, setGammaF] = useState<string>('1.4');

  // Постоянная ссылка на расчёт: ?r=…&h=…&ter=…&c=…&gf=…
  useCalcUrlState({
    onLoad: sp => {
      const r = readParam(sp, 'r');
      if (WIND_REGIONS.includes(r as WindRegion)) setRegion(r as WindRegion);
      const t = readParam(sp, 'ter');
      if (TERRAIN_TYPES.includes(t as TerrainType)) setTerrain(t as TerrainType);
      const pairs: [string, (v: string) => void][] = [
        ['h', setHeight],
        ['c', setAeroC],
        ['gf', setGammaF],
      ];
      for (const [key, setter] of pairs) {
        const v = readParam(sp, key);
        if (v) setter(v);
      }
    },
    params: {
      r: region === 'II' ? '' : region,
      h: height === '10' ? '' : height,
      ter: terrain === 'B' ? '' : terrain,
      c: aeroC === '0.8' ? '' : aeroC,
      gf: gammaF === '1.4' ? '' : gammaF,
    },
  });

  const result = computeWindLoad(
    region,
    parseFloat(height) || 0,
    terrain,
    parseFloat(aeroC) || 0,
    parseFloat(gammaF) || 0,
  );
  const hasResult = result.normativeKpa > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры расчёта</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="vt-r">Ветровой район</Label>
            <select
              id="vt-r"
              style={selectStyle}
              value={region}
              onChange={e => setRegion(e.target.value as WindRegion)}
            >
              {WIND_REGIONS.map(r => (
                <option key={r} value={r}>{r} район</option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              По карте 2 приложения Е СП 20.13330 (например, Москва — I, Санкт-Петербург — II).
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="vt-h">Высота zₑ, м</Label>
            <Input
              id="vt-h"
              type="number"
              min={0}
              max={300}
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Для невысоких зданий (h ≤ поперечного размера) zₑ равна высоте здания (п. 11.1.5).
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="vt-ter">Тип местности</Label>
            <select
              id="vt-ter"
              style={selectStyle}
              value={terrain}
              onChange={e => setTerrain(e.target.value as TerrainType)}
            >
              {TERRAIN_TYPES.map(t => (
                <option key={t} value={t}>{TERRAIN[t].label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="vt-c">Аэродинамический c</Label>
              <Input
                id="vt-c"
                type="number"
                min={0}
                step="0.05"
                value={aeroC}
                onChange={e => setAeroC(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="vt-gf">Коэффициент γf</Label>
              <Input
                id="vt-gf"
                type="number"
                min={1}
                step="0.05"
                value={gammaF}
                onChange={e => setGammaF(e.target.value)}
              />
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: -8 }}>
            c = 0,8 — наветренная стена (прил. В.1 СП 20); γf — коэффициент надёжности
            по нагрузке (п. 11.1.12).
          </span>
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Ветровая нагрузка</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Задайте параметры для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label={`Давление w₀ (${region} район)`} value={`${fmt(result.w0Kpa)} кПа`} />
              <ResultRow label={`Коэффициент k(zₑ), местность ${terrain}`} value={fmt(result.k)} />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow
                label="Нормативная wₘ"
                value={`${fmt(result.normativeKpa)} кПа ≈ ${fmt(result.normativeKgfM2)} кгс/м²`}
              />
              <ResultRow
                label={`Расчётная (γf = ${fmt(parseFloat(gammaF) || 0)})`}
                value={`${fmt(result.designKpa)} кПа ≈ ${fmt(result.designKgfM2)} кгс/м²`}
                large
              />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Упрощённый расчёт средней составляющей wₘ. Пульсационная составляющая
                (п. 11.1.8), резонанс и сложные формы — по полной методике СП 20;
                не заменяет расчёт конструктора.
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
