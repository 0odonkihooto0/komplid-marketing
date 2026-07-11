'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { parseISO, format, isAfter } from 'date-fns';
import { Label } from '@/components/ui/label';
import { countWorkingDays, nthWorkingDay } from './logic';
import { CopyLinkButton } from './CopyLinkButton';
import { useCalcUrlState, readParam } from './useCalcUrlState';

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

// Дата из URL проверяется по формату — произвольная строка в query
// не должна ронять eachDayOfInterval внутри countWorkingDays.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function RabochnieDniCalculator() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Постоянная ссылка на расчёт: ?from=…&to=…
  useCalcUrlState({
    onLoad: sp => {
      const from = readParam(sp, 'from');
      const to = readParam(sp, 'to');
      if (ISO_DATE.test(from)) setStartDate(from);
      if (ISO_DATE.test(to)) setEndDate(to);
    },
    params: { from: startDate, to: endDate },
  });

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

  // Дата 3-го рабочего дня — для уведомлений «за 3 рабочих дня».
  const thirdWorkingDay =
    workingDays !== null && workingDays >= 3
      ? nthWorkingDay(parseISO(startDate), parseISO(endDate), 3)
      : null;
  const notif3 = thirdWorkingDay ? format(thirdWorkingDay, 'dd.MM.yyyy') : null;

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
