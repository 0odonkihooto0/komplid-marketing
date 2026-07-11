'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import { computeKeyRatePenalty, computeContractPenalty } from './logic-penalty';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

type Mode = 'ddu' | 'contract';

export function ProsrochkaCalculator() {
  const [mode, setMode] = useState<Mode>('ddu');
  const [price, setPrice] = useState<string>('');
  const [keyRate, setKeyRate] = useState<string>('');
  const [isIndividual, setIsIndividual] = useState<boolean>(true);
  const [pctPerDay, setPctPerDay] = useState<string>('0.1');
  const [days, setDays] = useState<string>('');

  // Постоянная ссылка на расчёт: ?mode=…&sum=…&rate=…&who=…&pd=…&days=…
  useCalcUrlState({
    onLoad: sp => {
      const m = readParam(sp, 'mode');
      if (m === 'ddu' || m === 'contract') setMode(m);
      setPrice(readParam(sp, 'sum'));
      setKeyRate(readParam(sp, 'rate'));
      setDays(readParam(sp, 'days'));
      if (readParam(sp, 'who') === 'org') setIsIndividual(false);
      const pd = readParam(sp, 'pd');
      if (pd) setPctPerDay(pd);
    },
    params: {
      mode: mode === 'ddu' ? '' : mode,
      sum: price,
      rate: mode === 'ddu' ? keyRate : '',
      who: mode === 'ddu' && !isIndividual ? 'org' : '',
      pd: mode === 'contract' ? pctPerDay : '',
      days,
    },
  });

  const base = parseFloat(price) || 0;
  const nDays = parseInt(days, 10) || 0;
  const result =
    mode === 'ddu'
      ? computeKeyRatePenalty(base, parseFloat(keyRate) || 0, 300, nDays, isIndividual ? 2 : 1)
      : computeContractPenalty(base, parseFloat(pctPerDay) || 0, nDays);

  const hasResult = base > 0 && nDays > 0 && (mode === 'contract' || (parseFloat(keyRate) || 0) > 0);

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Параметры договора</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pr-mode">Тип договора</Label>
            <select
              id="pr-mode"
              style={selectStyle}
              value={mode}
              onChange={e => setMode(e.target.value as Mode)}
            >
              <option value="ddu">ДДУ — долевое участие (214-ФЗ)</option>
              <option value="contract">Договор подряда (договорная неустойка)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pr-sum">Цена договора, ₽</Label>
            <Input
              id="pr-sum"
              type="number"
              min={0}
              placeholder="например, 5 000 000"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          {mode === 'ddu' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label htmlFor="pr-rate">Ключевая ставка ЦБ, %</Label>
                <Input
                  id="pr-rate"
                  type="number"
                  min={0}
                  step="0.25"
                  placeholder="например, 16"
                  value={keyRate}
                  onChange={e => setKeyRate(e.target.value)}
                />
                <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                  По 214-ФЗ — ставка на день исполнения обязательства. Актуальное значение —{' '}
                  <a
                    href="https://www.cbr.ru/hd_base/keyrate/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}
                  >
                    на сайте ЦБ РФ
                  </a>
                  .
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label htmlFor="pr-who">Участник долевого строительства</Label>
                <select
                  id="pr-who"
                  style={selectStyle}
                  value={isIndividual ? 'fiz' : 'org'}
                  onChange={e => setIsIndividual(e.target.value === 'fiz')}
                >
                  <option value="fiz">Физическое лицо (неустойка в двойном размере)</option>
                  <option value="org">Юридическое лицо / ИП</option>
                </select>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="pr-pd">Неустойка по договору, % за день</Label>
              <Input
                id="pr-pd"
                type="number"
                min={0}
                step="0.01"
                placeholder="0,1"
                value={pctPerDay}
                onChange={e => setPctPerDay(e.target.value)}
              />
              <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                Размер ищите в разделе «Ответственность сторон» договора подряда.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="pr-days">Дней просрочки сдачи (календарных)</Label>
            <Input
              id="pr-days"
              type="number"
              min={0}
              placeholder="например, 60"
              value={days}
              onChange={e => setDays(e.target.value)}
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Расчёт компенсации</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Укажите цену договора, ставку и количество дней просрочки.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Неустойка за один день" value={`${fmt(result.perDay)} ₽`} />
              <ResultRow label="Дней просрочки" value={String(nDays)} />
              {mode === 'ddu' && isIndividual && (
                <ResultRow label="Коэффициент для физлица" value="×2" accent />
              )}
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Итого неустойка" value={`${fmt(result.total)} ₽`} large />
              <ResultRow label="Доля от цены договора" value={`${fmt(result.percentOfBase)} %`} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Правительство РФ периодически вводит моратории на неустойку по ДДУ —
                проверяйте действующие ограничения. Расчёт справочный.
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
