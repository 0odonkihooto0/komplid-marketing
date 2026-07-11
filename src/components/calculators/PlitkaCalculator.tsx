'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt } from './shared';
import { computeTiles } from './logic-plitka';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

// Пары [ключ URL, стейт, сеттер, дефолт] держим в одном месте — меньше дублирования.
export function PlitkaCalculator() {
  const [area, setArea] = useState<string>('');
  const [tileW, setTileW] = useState<string>('300');
  const [tileH, setTileH] = useState<string>('300');
  const [tileT, setTileT] = useState<string>('8');
  const [joint, setJoint] = useState<string>('3');
  const [reserve, setReserve] = useState<string>('10');
  const [glueRate, setGlueRate] = useState<string>('4');

  // Постоянная ссылка на расчёт: ?s=…&w=…&h=…&t=…&j=…&res=…&glue=…
  useCalcUrlState({
    onLoad: sp => {
      setArea(readParam(sp, 's'));
      const pairs: [string, (v: string) => void][] = [
        ['w', setTileW],
        ['h', setTileH],
        ['t', setTileT],
        ['j', setJoint],
        ['res', setReserve],
        ['glue', setGlueRate],
      ];
      for (const [key, setter] of pairs) {
        const v = readParam(sp, key);
        if (v) setter(v);
      }
    },
    params: {
      s: area,
      w: tileW === '300' ? '' : tileW,
      h: tileH === '300' ? '' : tileH,
      t: tileT === '8' ? '' : tileT,
      j: joint === '3' ? '' : joint,
      res: reserve === '10' ? '' : reserve,
      glue: glueRate === '4' ? '' : glueRate,
    },
  });

  const result = computeTiles(
    parseFloat(area) || 0,
    parseFloat(tileW) || 0,
    parseFloat(tileH) || 0,
    parseFloat(tileT) || 0,
    parseFloat(joint) || 0,
    parseFloat(reserve) || 0,
    parseFloat(glueRate) || 0,
  );
  const hasResult = result.tiles > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры укладки</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pl-s">Площадь под плитку, м²</Label>
            <Input
              id="pl-s"
              type="number"
              min={0}
              step="0.1"
              placeholder="например, 12"
              value={area}
              onChange={e => setArea(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="pl-w">Плитка: ширина, мм</Label>
              <Input id="pl-w" type="number" min={0} value={tileW} onChange={e => setTileW(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="pl-h">Плитка: длина, мм</Label>
              <Input id="pl-h" type="number" min={0} value={tileH} onChange={e => setTileH(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="pl-t">Толщина плитки, мм</Label>
              <Input id="pl-t" type="number" min={0} value={tileT} onChange={e => setTileT(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="pl-j">Ширина шва, мм</Label>
              <Input id="pl-j" type="number" min={0} step="0.5" value={joint} onChange={e => setJoint(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pl-res">Запас на подрезку, %</Label>
            <Input
              id="pl-res"
              type="number"
              min={0}
              max={30}
              value={reserve}
              onChange={e => setReserve(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Обычно 10%; при диагональной укладке и сложной геометрии — до 15%.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pl-glue">Расход клея, кг/м²</Label>
            <Input
              id="pl-glue"
              type="number"
              min={0}
              step="0.5"
              value={glueRate}
              onChange={e => setGlueRate(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Зависит от зубца шпателя (ориентировочно 3–5 кг/м²) — уточняйте на упаковке клея.
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
              Укажите площадь и размеры плитки.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow
                label={`Площадь с запасом ${fmt(parseFloat(reserve) || 0)}%`}
                value={`${fmt(result.areaWithReserve)} м²`}
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Плитки к покупке" value={`${fmt(result.tiles)} шт`} large />
              <ResultRow label="Клей" value={`${fmt(result.glueKg)} кг`} accent />
              <ResultRow label="Затирка" value={`${fmt(result.groutKg)} кг`} accent />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Плитку покупайте из одной партии (тон и калибр) — доложить позже той же
                партией почти невозможно.
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
