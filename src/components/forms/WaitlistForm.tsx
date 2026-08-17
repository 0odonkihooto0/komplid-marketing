'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { WAITLIST_ANCHOR, WAITLIST_OFFER } from '@/lib/waitlist';

type Role = 'smetchik' | 'pto' | 'prorab' | 'director' | 'sk' | 'other';

const ROLES: { value: Role; label: string }[] = [
  { value: 'smetchik', label: 'Сметчик' },
  { value: 'pto', label: 'ПТО-инженер' },
  { value: 'prorab', label: 'Прораб' },
  { value: 'sk', label: 'Стройконтроль' },
  { value: 'director', label: 'Руководитель' },
  { value: 'other', label: 'Другое' },
];

interface Props {
  /** Откуда пришёл лид — попадает в поле source и в UTM-кампанию. */
  source?: string;
  title?: string;
  description?: string;
}

/**
 * Форма раннего доступа — основной инструмент сбора базы до запуска.
 * Лид уходит в существующий /api/lead, который сначала пишет его на диск сайта
 * и только потом пытается переслать в приложение.
 */
export function WaitlistForm({
  source = 'waitlist',
  title = 'Ранний доступ к «Комплид»',
  description = WAITLIST_OFFER,
}: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('smetchik');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          source,
          // UTM берём из адресной строки: платные каналы должны быть отличимы
          // от органики при подсчёте CPL (PROMOTION_STRATEGY §7).
          utm: Object.fromEntries(
            [...new URLSearchParams(window.location.search)].filter(([k]) =>
              k.startsWith('utm_'),
            ),
          ),
          metadata: { page: window.location.pathname },
        }),
      });

      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
    } catch {
      setError('Не удалось отправить заявку. Попробуйте ещё раз или напишите на hello@komplid.ru.');
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <div
        id={WAITLIST_ANCHOR.slice(1)}
        className="rounded-xl p-6"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
            style={{ background: 'var(--ok)', color: '#fff' }}
          >
            ✓
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--ink)' }}>
              Вы в списке раннего доступа
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>
              Напишем на {email}, когда откроем регистрацию. Пока продукт готовится, будем
              присылать разборы нормативки и новые шаблоны — не чаще раза в неделю.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      id={WAITLIST_ANCHOR.slice(1)}
      onSubmit={handleSubmit}
      className="rounded-xl p-6"
      style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
    >
      <h2 className="mb-1 font-semibold" style={{ color: 'var(--ink)', fontSize: '15px' }}>
        {title}
      </h2>
      <p className="mb-5 text-sm" style={{ color: 'var(--ink-mute)' }}>
        {description}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label
            htmlFor="wl-email"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--ink-mute)' }}
          >
            Email
          </Label>
          <Input
            id="wl-email"
            type="email"
            required
            placeholder="ivan@company.ru"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            style={{
              background: 'var(--bg-inset)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
          />
        </div>

        <div>
          <Label
            htmlFor="wl-role"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--ink-mute)' }}
          >
            Кем работаете
          </Label>
          <select
            id="wl-role"
            value={role}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as Role)}
            className="w-full rounded-md px-3 py-2 text-sm"
            style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
            }}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label
        className="mt-4 flex cursor-pointer items-start gap-2 text-xs"
        style={{ color: 'var(--ink-mute)' }}
      >
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          style={{ accentColor: 'var(--accent)' }}
        />
        <span>
          Согласен на обработку персональных данных в соответствии с{' '}
          <a href="/legal/privacy" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
            политикой конфиденциальности
          </a>
          .
        </span>
      </label>

      {error && (
        <p className="mt-3 text-sm" style={{ color: 'var(--err)' }}>
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="mt-5 w-full"
        style={{ background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none' }}
      >
        {isLoading ? 'Отправляем…' : 'Получить ранний доступ'}
      </Button>
    </form>
  );
}
