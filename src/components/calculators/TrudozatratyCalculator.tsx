'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmt, selectStyle } from './shared';
import {
  hourlyRateFromSalary,
  computeManHourCost,
  computeCrewCost,
  computeLaborCost,
} from './logic-trudozatraty';
import { ResultRow } from './ResultRow';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

type RateMode = 'hour' | 'salary';

export function TrudozatratyCalculator() {
  const [rateMode, setRateMode] = useState<RateMode>('hour');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [salary, setSalary] = useState<string>('');
  const [hoursPerMonth, setHoursPerMonth] = useState<string>('164');
  const [insurancePct, setInsurancePct] = useState<string>('30');
  const [overheadPct, setOverheadPct] = useState<string>('0');
  const [workers, setWorkers] = useState<string>('4');
  const [hoursPerShift, setHoursPerShift] = useState<string>('8');
  const [laborHours, setLaborHours] = useState<string>('');

  // Постоянная ссылка на расчёт: ?rm=…&rate=…&sal=…&hpm=…&ins=…&ovh=…&w=…&h=…&lh=…
  useCalcUrlState({
    onLoad: sp => {
      if (readParam(sp, 'rm') === 'salary') setRateMode('salary');
      setHourlyRate(readParam(sp, 'rate'));
      setSalary(readParam(sp, 'sal'));
      setLaborHours(readParam(sp, 'lh'));
      const hpm = readParam(sp, 'hpm');
      if (hpm) setHoursPerMonth(hpm);
      const ins = readParam(sp, 'ins');
      if (ins) setInsurancePct(ins);
      const ovh = readParam(sp, 'ovh');
      if (ovh) setOverheadPct(ovh);
      const w = readParam(sp, 'w');
      if (w) setWorkers(w);
      const h = readParam(sp, 'h');
      if (h) setHoursPerShift(h);
    },
    params: {
      rm: rateMode === 'hour' ? '' : rateMode,
      rate: rateMode === 'hour' ? hourlyRate : '',
      sal: rateMode === 'salary' ? salary : '',
      hpm: rateMode === 'salary' && hoursPerMonth !== '164' ? hoursPerMonth : '',
      ins: insurancePct === '30' ? '' : insurancePct,
      ovh: overheadPct === '0' ? '' : overheadPct,
      w: workers === '4' ? '' : workers,
      h: hoursPerShift === '8' ? '' : hoursPerShift,
      lh: laborHours,
    },
  });

  const baseRate =
    rateMode === 'hour'
      ? parseFloat(hourlyRate) || 0
      : hourlyRateFromSalary(parseFloat(salary) || 0, parseFloat(hoursPerMonth) || 0);
  const costPerManHour = computeManHourCost(
    baseRate,
    parseFloat(insurancePct) || 0,
    parseFloat(overheadPct) || 0,
  );
  const crew = computeCrewCost(costPerManHour, parseFloat(workers) || 0, parseFloat(hoursPerShift) || 0);
  const nLaborHours = parseFloat(laborHours) || 0;
  const laborCost = computeLaborCost(costPerManHour, nLaborHours);
  const hasResult = baseRate > 0;

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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Ставка и бригада</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="tz-mode">Как задать оплату рабочего</Label>
            <select
              id="tz-mode"
              style={selectStyle}
              value={rateMode}
              onChange={e => setRateMode(e.target.value as RateMode)}
            >
              <option value="hour">Ставка за час</option>
              <option value="salary">Оклад за месяц</option>
            </select>
          </div>

          {rateMode === 'hour' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="tz-rate">Ставка, ₽ за час</Label>
              <Input
                id="tz-rate"
                type="number"
                min={0}
                placeholder="например, 500"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label htmlFor="tz-sal">Оклад, ₽ в месяц</Label>
                <Input
                  id="tz-sal"
                  type="number"
                  min={0}
                  placeholder="например, 82 000"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label htmlFor="tz-hpm">Рабочих часов в месяце</Label>
                <Input
                  id="tz-hpm"
                  type="number"
                  min={1}
                  placeholder="164"
                  value={hoursPerMonth}
                  onChange={e => setHoursPerMonth(e.target.value)}
                />
                <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                  Среднемесячная норма при 40-часовой неделе ≈ 164 ч; точное значение месяца —
                  в производственном календаре.
                </span>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="tz-ins">Страховые взносы, %</Label>
            <Input
              id="tz-ins"
              type="number"
              min={0}
              step="0.1"
              placeholder="30"
              value={insurancePct}
              onChange={e => setInsurancePct(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              Единый тариф 30% (ст. 425 НК РФ) + взносы на травматизм 0,2–8,5% по классу риска.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="tz-ovh">Накладные расходы, %</Label>
            <Input
              id="tz-ovh"
              type="number"
              min={0}
              step="1"
              placeholder="0"
              value={overheadPct}
              onChange={e => setOverheadPct(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="tz-w">Человек в бригаде</Label>
              <Input
                id="tz-w"
                type="number"
                min={1}
                value={workers}
                onChange={e => setWorkers(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="tz-h">Часов в смене</Label>
              <Input
                id="tz-h"
                type="number"
                min={1}
                max={24}
                value={hoursPerShift}
                onChange={e => setHoursPerShift(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="tz-lh">Трудоёмкость работ, чел-ч (необязательно)</Label>
            <Input
              id="tz-lh"
              type="number"
              min={0}
              placeholder="например, 120 (из ГЭСН)"
              value={laborHours}
              onChange={e => setLaborHours(e.target.value)}
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Стоимость трудозатрат</p>

          {!hasResult && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Укажите ставку за час или оклад с числом рабочих часов.
            </p>
          )}

          {hasResult && (
            <>
              <ResultRow label="Базовая ставка" value={`${fmt(baseRate)} ₽/ч`} />
              <ResultRow
                label="Полная стоимость чел-часа"
                value={`${fmt(costPerManHour)} ₽`}
                accent
              />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
              <ResultRow label="Бригада за час" value={`${fmt(crew.crewPerHour)} ₽`} />
              <ResultRow label="Бригада за смену" value={`${fmt(crew.crewPerShift)} ₽`} large />
              {nLaborHours > 0 && (
                <>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }} />
                  <ResultRow
                    label={`Работы трудоёмкостью ${fmt(nLaborHours)} чел-ч`}
                    value={`${fmt(laborCost)} ₽`}
                    accent
                  />
                </>
              )}
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
