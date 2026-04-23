'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { eachDayOfInterval, isWeekend, parseISO, format, isAfter } from 'date-fns';
import { Label } from '@/components/ui/label';

// Производственный календарь РФ 2026 — федеральные нерабочие праздничные дни
const HOLIDAYS_2026: string[] = [
  '2026-01-01', '2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07',
  '2026-01-08', '2026-01-09',  // Новый год + Рождество (с переносами)
  '2026-02-23',                // День защитника Отечества
  '2026-03-09',                // 8 марта (перенос с воскресенья)
  '2026-05-01', '2026-05-04', // Праздник Весны и Труда + перенос
  '2026-05-11',                // День Победы + перенос
  '2026-06-12',                // День России
  '2026-11-04',                // День народного единства
];

const inputStyle: CSSProperties = {
  background: 'var(--bg-inset)',
  border: '1px solid var(--border)',
  color: 'var(--ink)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  height: 40,
};

function countWorkingDays(start: Date, end: Date): number {
  const days = eachDayOfInterval({ start, end });
  return days.filter(d => {
    if (isWeekend(d)) return false;
    if (HOLIDAYS_2026.includes(format(d, 'yyyy-MM-dd'))) return false;
    return true;
  }).length;
}

export function RabochnieDniCalculator() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  let workingDays: number | null = null;
  let errorMsg: string | null = null;

  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isAfter(start, end)) {
      errorMsg = 'Дата окончания должна быть позже даты начала.';
    } else {
      workingDays = countWorkingDays(start, end);
    }
  }

  const notif3 = workingDays !== null && workingDays >= 3
    ? (() => {
        const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
        let count = 0;
        for (let i = 0; i < days.length; i++) {
          const d = days[i];
          if (d === undefined) continue;
          if (!isWeekend(d) && !HOLIDAYS_2026.includes(format(d, 'yyyy-MM-dd'))) {
            count++;
            if (count === 3) return format(d, 'dd.MM.yyyy');
          }
        }
        return null;
      })()
    : null;

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {/* Поля ввода */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Период для расчёта</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="rd-start">Дата начала</Label>
            <input
              id="rd-start"
              type="date"
              style={inputStyle}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="rd-end">Дата окончания</Label>
            <input
              id="rd-end"
              type="date"
              style={inputStyle}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
            Расчёт по производственному календарю РФ 2026. Даты указываются включительно.
          </p>
        </div>

        {/* Результат */}
        <div
          style={{
            padding: 24,
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Результат</p>

          {!startDate && !endDate && (
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
              Укажите даты начала и окончания периода.
            </p>
          )}

          {errorMsg && (
            <p style={{ color: 'var(--err)', fontSize: 14, margin: 0 }}>{errorMsg}</p>
          )}

          {workingDays !== null && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span
                  style={{
                    fontSize: 52,
                    fontWeight: 600,
                    lineHeight: 1,
                    color: 'var(--accent-strong)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {workingDays}
                </span>
                <span style={{ fontSize: 16, color: 'var(--ink-soft)' }}>рабочих дней</span>
              </div>

              {notif3 !== null && (
                <div
                  style={{
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: 'var(--ink-soft)',
                  }}
                >
                  <strong style={{ color: 'var(--ink)' }}>3-й рабочий день:</strong> {notif3}
                  <br />
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                    Для уведомления «за 3 рабочих дня» от начала периода
                  </span>
                </div>
              )}

              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
                Учтены выходные и федеральные праздники РФ 2026.
                Региональные праздники не включены.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
