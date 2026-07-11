'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt } from './shared';
import { computeWinterIncrease } from './logic-zimnee';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function ZimneeCalculator() {
  const [smrCost, setSmrCost] = useState<string>('');
  const [ndzPct, setNdzPct] = useState<string>('');

  // Постоянная ссылка на расчёт: ?sum=…&ndz=…
  useCalcUrlState({
    onLoad: sp => {
      setSmrCost(readParam(sp, 'sum'));
      setNdzPct(readParam(sp, 'ndz'));
    },
    params: { sum: smrCost, ndz: ndzPct },
  });

  const base = parseFloat(smrCost) || 0;
  const pct = parseFloat(ndzPct) || 0;
  const result = computeWinterIncrease(base, pct);
  const hasResult = base > 0 && pct > 0;

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
            <Label htmlFor="zm-sum">Стоимость СМР, ₽</Label>
            <Input
              id="zm-sum"
              type="number"
              min={0}
              placeholder="например, 10 000 000"
              value={smrCost}
              onChange={e => setSmrCost(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Сметная стоимость строительно-монтажных работ, к которой применяется норматив.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="zm-ndz">Норматив дополнительных затрат (НДЗ), %</Label>
            <Input
              id="zm-ndz"
              type="number"
              min={0}
              step="0.01"
              placeholder="например, 1,8"
              value={ndzPct}
              onChange={e => setNdzPct(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Значение зависит от температурной зоны и вида объекта — берите из приложений к{' '}
              <a
                href="https://minstroyrf.gov.ru/docs/127910/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}
              >
                Методике 325/пр
              </a>{' '}
              или из своей сметной документации.
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
              Укажите стоимость СМР и норматив НДЗ в процентах.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Стоимость СМР" value={`${fmt(base)} ₽`} />
              <ResultRow
                label={`Зимнее удорожание (НДЗ ${fmt(pct)}%)`}
                value={`${fmt(result.increase)} ₽`}
                accent
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Итого с учётом удорожания" value={`${fmt(result.total)} ₽`} large />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Нормативы НДЗ — среднегодовые: начисляются круглогодично, независимо от
                фактического сезона выполнения работ.
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
