'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { SNOW_REGIONS, computeSnowLoad, type SnowRegion } from './logic-sneg';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function SnegCalculator() {
  const [region, setRegion] = useState<SnowRegion>('III');
  const [angle, setAngle] = useState<string>('30');
  const [ce, setCe] = useState<string>('1');
  const [ct, setCt] = useState<string>('1');
  const [roofArea, setRoofArea] = useState<string>('');

  // Постоянная ссылка на расчёт: ?r=…&ang=…&ce=…&ct=…&s=…
  useCalcUrlState({
    onLoad: sp => {
      const r = readParam(sp, 'r');
      if (SNOW_REGIONS.includes(r as SnowRegion)) setRegion(r as SnowRegion);
      const pairs: [string, (v: string) => void][] = [
        ['ang', setAngle],
        ['ce', setCe],
        ['ct', setCt],
      ];
      for (const [key, setter] of pairs) {
        const v = readParam(sp, key);
        if (v) setter(v);
      }
      setRoofArea(readParam(sp, 's'));
    },
    params: {
      r: region === 'III' ? '' : region,
      ang: angle === '30' ? '' : angle,
      ce: ce === '1' ? '' : ce,
      ct: ct === '1' ? '' : ct,
      s: roofArea,
    },
  });

  const result = computeSnowLoad(
    region,
    parseFloat(angle) || 0,
    parseFloat(ce) || 0,
    parseFloat(ct) || 0,
  );
  const area = parseFloat(roofArea) || 0;
  const hasResult = result.normativeKpa > 0 || result.mu === 0;

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
            <Label htmlFor="sn-r">Снеговой район</Label>
            <select
              id="sn-r"
              style={selectStyle}
              value={region}
              onChange={e => setRegion(e.target.value as SnowRegion)}
            >
              {SNOW_REGIONS.map(r => (
                <option key={r} value={r}>{r} район</option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              По карте 1 приложения Е СП 20.13330 (например, Москва — III, Санкт-Петербург — III,
              Новосибирск — IV).
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="sn-ang">Уклон кровли, °</Label>
            <Input
              id="sn-ang"
              type="number"
              min={0}
              max={89}
              value={angle}
              onChange={e => setAngle(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              До 30° — снег учитывается полностью (μ=1), от 60° — не учитывается (μ=0).
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="sn-ce">Коэффициент сноса cₑ</Label>
              <Input
                id="sn-ce"
                type="number"
                min={0}
                max={1.2}
                step="0.05"
                value={ce}
                onChange={e => setCe(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="sn-ct">Термический cₜ</Label>
              <Input
                id="sn-ct"
                type="number"
                min={0}
                max={1.2}
                step="0.05"
                value={ct}
                onChange={e => setCt(e.target.value)}
              />
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: -8 }}>
            Для типовых скатных кровель обычно cₑ = cₜ = 1 (пп. 10.5–10.10 СП 20).
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="sn-s">Площадь кровли, м² (необязательно)</Label>
            <Input
              id="sn-s"
              type="number"
              min={0}
              step="0.1"
              placeholder="для суммарной нагрузки"
              value={roofArea}
              onChange={e => setRoofArea(e.target.value)}
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Снеговая нагрузка</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Задайте параметры для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label={`Вес покрова Sg (${region} район)`} value={`${fmt(result.sgKpa)} кПа`} />
              <ResultRow label="Коэффициент уклона μ" value={fmt(result.mu)} />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow
                label="Нормативная S₀"
                value={`${fmt(result.normativeKpa)} кПа ≈ ${fmt(result.normativeKgfM2)} кгс/м²`}
              />
              <ResultRow
                label="Расчётная (γf = 1,4)"
                value={`${fmt(result.designKpa)} кПа ≈ ${fmt(result.designKgfM2)} кгс/м²`}
                large
              />
              {area > 0 && (
                <ResultRow
                  label={`Расчётная на ${fmt(area)} м² кровли`}
                  value={`${fmt((result.designKgfM2 * area) / 1000)} т`}
                  accent
                />
              )}
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Упрощённый расчёт для предварительной оценки (равномерная схема, прил. Б СП 20).
                Не заменяет расчёт конструктора: сложные профили, снеговые мешки и перепады
                высот считаются по полным схемам приложения Б.
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
