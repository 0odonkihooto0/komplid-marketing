'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt } from './shared';
import { computeRetention } from './logic-uderzhanie';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

export function UderzhanieCalculator() {
  const [actAmount, setActAmount] = useState<string>('');
  const [retentionPct, setRetentionPct] = useState<string>('5');
  const [contractPrice, setContractPrice] = useState<string>('');

  // Постоянная ссылка на расчёт: ?act=…&pct=…&contract=…
  useCalcUrlState({
    onLoad: sp => {
      setActAmount(readParam(sp, 'act'));
      setContractPrice(readParam(sp, 'contract'));
      const pct = readParam(sp, 'pct');
      if (pct) setRetentionPct(pct);
    },
    params: {
      act: actAmount,
      pct: retentionPct === '5' ? '' : retentionPct,
      contract: contractPrice,
    },
  });

  const act = parseFloat(actAmount) || 0;
  const contract = parseFloat(contractPrice) || 0;
  const result = computeRetention(act, parseFloat(retentionPct) || 0, contract || undefined);
  const hasResult = act > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры удержания</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ud-act">Сумма акта КС-2, ₽</Label>
            <Input
              id="ud-act"
              type="number"
              min={0}
              placeholder="например, 2 000 000"
              value={actAmount}
              onChange={e => setActAmount(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Удержание считается от суммы акта: с НДС или без — как определено договором.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ud-pct">Процент удержания, %</Label>
            <Input
              id="ud-pct"
              type="number"
              min={0}
              max={100}
              step="0.5"
              placeholder="5"
              value={retentionPct}
              onChange={e => setRetentionPct(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              По практике рынка — 5–10% от каждого акта. Точный размер — в договоре подряда.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="ud-contract">Цена контракта, ₽ (необязательно)</Label>
            <Input
              id="ud-contract"
              type="number"
              min={0}
              placeholder="например, 10 000 000"
              value={contractPrice}
              onChange={e => setContractPrice(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Если указать — покажем общий объём удержания за весь контракт.
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
              Введите сумму акта КС-2 для расчёта.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow
                label={`Гарантийное удержание (${fmt(parseFloat(retentionPct) || 0)}%)`}
                value={`${fmt(result.retentionFromAct)} ₽`}
                accent
              />
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="К выплате по акту" value={`${fmt(result.payableFromAct)} ₽`} large />
              {result.totalRetention !== null && (
                <>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
                  <ResultRow
                    label="Общий объём удержания по контракту"
                    value={`${fmt(result.totalRetention)} ₽`}
                  />
                </>
              )}
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Удержанные суммы возвращаются подрядчику по условиям договора — обычно после
                ввода объекта в эксплуатацию или окончания гарантийного срока.
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
