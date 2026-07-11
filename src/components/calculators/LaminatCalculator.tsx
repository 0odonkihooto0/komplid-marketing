'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { computeLaminat, LAYOUT_RESERVE_PCT, type LaminatLayout } from './logic-laminat';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function LaminatCalculator() {
  const [area, setArea] = useState<string>('');
  const [packArea, setPackArea] = useState<string>('');
  const [layout, setLayout] = useState<LaminatLayout>('straight');
  const [reserve, setReserve] = useState<string>(String(LAYOUT_RESERVE_PCT.straight));

  // Постоянная ссылка на расчёт: ?s=…&pack=…&lay=…&res=…
  useCalcUrlState({
    onLoad: sp => {
      setArea(readParam(sp, 's'));
      setPackArea(readParam(sp, 'pack'));
      const lay = readParam(sp, 'lay');
      if (lay === 'straight' || lay === 'diagonal') setLayout(lay);
      const res = readParam(sp, 'res');
      if (res) setReserve(res);
    },
    params: {
      s: area,
      pack: packArea,
      lay: layout === 'straight' ? '' : layout,
      res: reserve === String(LAYOUT_RESERVE_PCT[layout]) ? '' : reserve,
    },
  });

  function handleLayoutChange(value: LaminatLayout) {
    setLayout(value);
    // Смена схемы укладки подставляет типовой запас (остаётся редактируемым)
    setReserve(String(LAYOUT_RESERVE_PCT[value]));
  }

  const result = computeLaminat(
    parseFloat(area) || 0,
    parseFloat(packArea) || 0,
    parseFloat(reserve) || 0,
  );
  const hasResult = result.packs > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры комнаты</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="lm-s">Площадь пола, м²</Label>
            <Input
              id="lm-s"
              type="number"
              min={0}
              step="0.1"
              placeholder="например, 18"
              value={area}
              onChange={e => setArea(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="lm-pack">Площадь в упаковке, м²</Label>
            <Input
              id="lm-pack"
              type="number"
              min={0}
              step="0.01"
              placeholder="например, 2,13"
              value={packArea}
              onChange={e => setPackArea(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Указана на упаковке (обычно 1,8–2,6 м² в зависимости от размера доски).
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="lm-lay">Схема укладки</Label>
            <select
              id="lm-lay"
              style={selectStyle}
              value={layout}
              onChange={e => handleLayoutChange(e.target.value as LaminatLayout)}
            >
              <option value="straight">Прямая (вдоль стены) — запас 5%</option>
              <option value="diagonal">Диагональная — запас 10%</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="lm-res">Запас на подрезку, %</Label>
            <Input
              id="lm-res"
              type="number"
              min={0}
              max={30}
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
              Укажите площадь пола и площадь в упаковке.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow
                label={`Площадь с запасом ${fmt(parseFloat(reserve) || 0)}%`}
                value={`${fmt(result.areaWithReserve)} м²`}
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Упаковок к покупке" value={`${result.packs} шт`} large />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Одну-две доски из остатка сохраните — пригодятся для точечного ремонта
                замковых панелей.
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
