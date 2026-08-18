'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { PdConsentCheckbox } from './PdConsentCheckbox';
import { PRIVACY_POLICY_VERSION } from '@/lib/legal/privacy-consent';
import { WAITLIST_ANCHOR } from '@/lib/waitlist';

type Channel = 'email' | 'phone';

const CHANNELS: { id: Channel; label: string; placeholder: string; type: string }[] = [
  { id: 'email', label: 'Почта', placeholder: 'rabota@company.ru', type: 'email' },
  { id: 'phone', label: 'Телефон', placeholder: '+7 999 123-45-67', type: 'tel' },
];

/** Размер команды — по нему видно, кому какой тариф показывать при запуске. */
const TEAM_SIZES = ['До 10 человек', '10–50', '50+'] as const;
type TeamSize = (typeof TEAM_SIZES)[number];

/**
 * Форма заявки в бету из эталона: выбор канала связи, поле контакта и размер
 * команды. Отличается от WaitlistForm не только вёрсткой — здесь человек может
 * оставить телефон вместо почты, поэтому и роут принимает любой из контактов.
 */
export function BetaAccessForm() {
  const [channel, setChannel] = useState<Channel>('email');
  const [contact, setContact] = useState('');
  const [teamSize, setTeamSize] = useState<TeamSize>('10–50');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const field = CHANNELS.find((c) => c.id === channel)!;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [channel]: contact.trim(),
          source: 'homepage-cta',
          // Доказательство согласия по 152-ФЗ: факт и редакция политики.
          pdConsent: consent,
          pdConsentVersion: PRIVACY_POLICY_VERSION,
          utm: Object.fromEntries(
            [...new URLSearchParams(window.location.search)].filter(([k]) =>
              k.startsWith('utm_'),
            ),
          ),
          metadata: { teamSize, page: window.location.pathname },
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
      <div id={WAITLIST_ANCHOR.slice(1)} className="beta-form" style={{ position: 'relative' }}>
        <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
          Место занято
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.55, color: 'var(--t2)' }}>
          Записали {contact.trim()}. Напишем, когда откроем доступ, — и закрепим за вами скидку
          раннего доступа.
        </p>
      </div>
    );
  }

  return (
    <form
      id={WAITLIST_ANCHOR.slice(1)}
      onSubmit={handleSubmit}
      className="beta-form"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Блик, проходящий по карточке, — из эталона */}
      <span className="anim-sheen beta-form__sheen" aria-hidden="true" />

      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span className="counter-label" style={{ marginTop: 0, letterSpacing: '0.14em' }}>
            Заявка в бету
          </span>
          <div
            className="chip-group"
            role="radiogroup"
            aria-label="Куда с вами связаться"
            style={{ padding: 4, borderRadius: 999, background: 'var(--inset)' }}
          >
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={channel === c.id}
                onClick={() => setChannel(c.id)}
                className="chip chip--round"
                data-on={channel === c.id ? '' : undefined}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <label htmlFor="beta-contact" className="sr-only">
          {field.label}
        </label>
        <input
          id="beta-contact"
          name={channel}
          type={field.type}
          required
          autoComplete={channel === 'email' ? 'email' : 'tel'}
          placeholder={field.placeholder}
          value={contact}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setContact(e.target.value)}
          className="beta-form__input"
        />

        <div
          className="chip-group"
          role="radiogroup"
          aria-label="Размер команды"
          style={{ marginTop: 10 }}
        >
          {TEAM_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={teamSize === size}
              onClick={() => setTeamSize(size)}
              className="chip"
              data-on={teamSize === size ? '' : undefined}
            >
              {size}
            </button>
          ))}
        </div>

        <PdConsentCheckbox id="beta-consent" checked={consent} onChange={setConsent} />

        {error && (
          <p style={{ margin: '12px 0 0', fontSize: 13.5, color: 'var(--err)' }}>{error}</p>
        )}

        <button type="submit" disabled={isLoading} className="btn-accent beta-form__submit">
          {isLoading ? 'Отправляем…' : 'Занять место'}
          {!isLoading && <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>}
        </button>

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 9,
            background: 'var(--accSoft)',
          }}
        >
          <span
            style={{
              flex: 'none',
              marginTop: 5,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--acc)',
            }}
          />
          <span style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--t2)' }}>
            Запуск — осенью 2026 года. Участники беты заходят первыми, со скидкой 20% на первый
            год и переносом текущих объектов.
          </span>
        </div>

        <div
          style={{
            marginTop: 11,
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            lineHeight: 1.5,
            letterSpacing: '0.06em',
            color: 'var(--t5)',
          }}
        >
          Ответим в течение дня. Без спама и рассылок.
        </div>
      </div>
    </form>
  );
}
