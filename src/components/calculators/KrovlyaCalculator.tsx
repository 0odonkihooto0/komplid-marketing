'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt } from './shared';
import { computeGableRoof } from './logic-krovlya';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function KrovlyaCalculator() {
  const [houseLength, setHouseLength] = useState<string>('');
  const [houseWidth, setHouseWidth] = useState<string>('');
  const [angle, setAngle] = useState<string>('30');
  const [eave, setEave] = useState<string>('0.5');
  const [gable, setGable] = useState<string>('0.5');
  const [reserve, setReserve] = useState<string>('10');

  // Постоянная ссылка на расчёт: ?a=…&b=…&ang=…&eave=…&gab=…&res=…
  useCalcUrlState({
    onLoad: sp => {
      setHouseLength(readParam(sp, 'a'));
      setHouseWidth(readParam(sp, 'b'));
      const pairs: [string, (v: string) => void][] = [
        ['ang', setAngle],
        ['eave', setEave],
        ['gab', setGable],
        ['res', setReserve],
      ];
      for (const [key, setter] of pairs) {
        const v = readParam(sp, key);
        if (v) setter(v);
      }
    },
    params: {
      a: houseLength,
      b: houseWidth,
      ang: angle === '30' ? '' : angle,
      eave: eave === '0.5' ? '' : eave,
      gab: gable === '0.5' ? '' : gable,
      res: reserve === '10' ? '' : reserve,
    },
  });

  const result = computeGableRoof(
    parseFloat(houseLength) || 0,
    parseFloat(houseWidth) || 0,
    parseFloat(angle) || 0,
    parseFloat(eave) || 0,
    parseFloat(gable) || 0,
    parseFloat(reserve) || 0,
  );
  const hasResult = result.roofAreaM2 > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры двускатной кровли</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kr2-a">Длина дома (по коньку), м</Label>
              <Input
                id="kr2-a"
                type="number"
                min={0}
                step="0.1"
                placeholder="10"
                value={houseLength}
                onChange={e => setHouseLength(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kr2-b">Ширина дома, м</Label>
              <Input
                id="kr2-b"
                type="number"
                min={0}
                step="0.1"
                placeholder="8"
                value={houseWidth}
                onChange={e => setHouseWidth(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kr2-ang">Уклон кровли, °</Label>
            <Input
              id="kr2-ang"
              type="number"
              min={0}
              max={89}
              value={angle}
              onChange={e => setAngle(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Типовые уклоны: металлочерепица 20–30°, гибкая черепица от 12°, профнастил от 8°.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kr2-eave">Карнизный свес, м</Label>
              <Input
                id="kr2-eave"
                type="number"
                min={0}
                step="0.1"
                value={eave}
                onChange={e => setEave(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="kr2-gab">Фронтонный свес, м</Label>
              <Input
                id="kr2-gab"
                type="number"
                min={0}
                step="0.1"
                value={gable}
                onChange={e => setGable(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="kr2-res">Запас на нахлёсты и подрезку, %</Label>
            <Input
              id="kr2-res"
              type="number"
              min={0}
              max={30}
              value={reserve}
              onChange={e => setReserve(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Зависит от материала: листовые ~10%, гибкая черепица ~5%, сложная кровля — больше.
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
              Укажите размеры дома и уклон кровли.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Длина ската (стропила)" value={`${fmt(result.slopeLengthM)} м`} />
              <ResultRow label="Высота конька" value={`${fmt(result.ridgeHeightM)} м`} />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Площадь кровли (2 ската)" value={`${fmt(result.roofAreaM2)} м²`} large />
              <ResultRow
                label={`Материала с запасом ${fmt(parseFloat(reserve) || 0)}%`}
                value={`${fmt(result.areaWithReserveM2)} м²`}
                accent
              />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Проверьте снеговую и ветровую нагрузку для выбранного уклона — от них зависит
                шаг стропил и обрешётки.
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
