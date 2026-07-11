'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { PLASTER_PRESETS, computePlaster, type PlasterType } from './logic-shtukaturka';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

type MixOption = PlasterType | 'custom';

export function ShtukaturkaCalculator() {
  const [area, setArea] = useState<string>('');
  const [thickness, setThickness] = useState<string>('10');
  const [mix, setMix] = useState<MixOption>('gypsum');
  const [rate, setRate] = useState<string>(String(PLASTER_PRESETS.gypsum.rate10mm));
  const [bagKg, setBagKg] = useState<string>('30');

  // Постоянная ссылка на расчёт: ?s=…&t=…&mix=…&rate=…&bag=…
  useCalcUrlState({
    onLoad: sp => {
      setArea(readParam(sp, 's'));
      const t = readParam(sp, 't');
      if (t) setThickness(t);
      const m = readParam(sp, 'mix');
      if (m === 'gypsum' || m === 'cement' || m === 'custom') setMix(m);
      const r = readParam(sp, 'rate');
      if (r) setRate(r);
      const b = readParam(sp, 'bag');
      if (b) setBagKg(b);
    },
    params: {
      s: area,
      t: thickness === '10' ? '' : thickness,
      mix: mix === 'gypsum' ? '' : mix,
      rate: rate === String(PLASTER_PRESETS.gypsum.rate10mm) ? '' : rate,
      bag: bagKg === '30' ? '' : bagKg,
    },
  });

  function handleMixChange(value: MixOption) {
    setMix(value);
    // Пресет подставляет типовой расход, «своя смесь» оставляет введённый
    if (value !== 'custom') setRate(String(PLASTER_PRESETS[value].rate10mm));
  }

  const result = computePlaster(
    parseFloat(area) || 0,
    parseFloat(thickness) || 0,
    parseFloat(rate) || 0,
    parseFloat(bagKg) || 0,
  );
  const hasResult = result.totalKg > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры оштукатуривания</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="sh-s">Площадь поверхности, м²</Label>
            <Input
              id="sh-s"
              type="number"
              min={0}
              step="0.1"
              placeholder="например, 40"
              value={area}
              onChange={e => setArea(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="sh-t">Средняя толщина слоя, мм</Label>
            <Input
              id="sh-t"
              type="number"
              min={0}
              step="1"
              value={thickness}
              onChange={e => setThickness(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Среднюю толщину определяют промером стены по маякам в нескольких точках.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="sh-mix">Тип смеси</Label>
            <select
              id="sh-mix"
              style={selectStyle}
              value={mix}
              onChange={e => handleMixChange(e.target.value as MixOption)}
            >
              <option value="gypsum">{PLASTER_PRESETS.gypsum.label}</option>
              <option value="cement">{PLASTER_PRESETS.cement.label}</option>
              <option value="custom">Своя смесь (задать расход)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="sh-rate">Расход при слое 10 мм, кг/м²</Label>
            <Input
              id="sh-rate"
              type="number"
              min={0}
              step="0.1"
              value={rate}
              onChange={e => {
                setRate(e.target.value);
                setMix('custom');
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Ориентировочно — уточняйте точный расход в техописании (ТДС) вашей смеси.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="sh-bag">Вес мешка, кг</Label>
            <Input
              id="sh-bag"
              type="number"
              min={0}
              value={bagKg}
              onChange={e => setBagKg(e.target.value)}
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
              Укажите площадь, толщину слоя и расход смеси.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Расход на 1 м²" value={`${fmt(result.kgPerM2)} кг`} />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Всего смеси" value={`${fmt(result.totalKg)} кг`} large />
              <ResultRow
                label={`Мешков по ${fmt(parseFloat(bagKg) || 0)} кг`}
                value={`${result.bags} шт`}
                accent
              />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                На неровных основаниях средняя толщина легко вырастает на 30–50% —
                промерьте стену перед закупкой.
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
