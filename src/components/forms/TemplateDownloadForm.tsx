'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { requestTemplateDownload, TemplateDownloadError } from '@/lib/template-download';
import { WAITLIST_MODE, WAITLIST_OFFER } from '@/lib/waitlist';
import { PdConsentCheckbox } from './PdConsentCheckbox';
import { PRIVACY_POLICY_VERSION } from '@/lib/legal/privacy-consent';

interface Props {
  slug: string;
  filename: string;
}

type Role = 'prorab' | 'pto' | 'smetchik' | 'other';

const ROLES: { value: Role; label: string }[] = [
  { value: 'pto', label: 'ПТО-инженер' },
  { value: 'prorab', label: 'Прораб' },
  { value: 'smetchik', label: 'Сметчик' },
  { value: 'other', label: 'Другое' },
];

export function TemplateDownloadForm({ slug, filename }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('pto');
  const [newsletter, setNewsletter] = useState(true);
  const [earlyAccess, setEarlyAccess] = useState(false);
  // Согласие на обработку ПДн — отдельно от подписки на рассылку: это разные
  // согласия, и смешивать их в одну галочку нельзя.
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await requestTemplateDownload({
        slug,
        filename,
        email,
        role,
        newsletterConsent: newsletter,
        earlyAccess,
        pdConsent: consent,
        pdConsentVersion: PRIVACY_POLICY_VERSION,
      });

      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDone(true);
    } catch (err) {
      // Не-OK ответ API и сетевой сбой различаем для понятного текста.
      setError(
        err instanceof TemplateDownloadError
          ? 'Не удалось получить файл. Попробуйте ещё раз.'
          : 'Ошибка сети. Проверьте соединение и попробуйте ещё раз.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <div
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
              Файл скачивается
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>
              Если скачивание не началось — обратитесь к браузеру или{' '}
              <a
                href={`/shablony-files/${filename}`}
                download={filename}
                style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}
              >
                скачайте напрямую
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-6"
      style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
    >
      <h2 className="mb-1 font-semibold" style={{ color: 'var(--ink)', fontSize: '15px' }}>
        Скачать шаблон бесплатно
      </h2>
      <p className="mb-5 text-sm" style={{ color: 'var(--ink-mute)' }}>
        Оставьте email — пришлём ссылку на обновления формы.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label
            htmlFor="tdf-email"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--ink-mute)' }}
          >
            Email
          </Label>
          <Input
            id="tdf-email"
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
            htmlFor="tdf-role"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--ink-mute)' }}
          >
            Роль
          </Label>
          <select
            id="tdf-role"
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

        <div className="flex items-end">
          <label className="flex cursor-pointer items-start gap-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewsletter(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              style={{ accentColor: 'var(--accent)' }}
            />
            <span>Получать обновления форм и нормативов</span>
          </label>
        </div>
      </div>

      {WAITLIST_MODE && (
        <label
          className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg p-3 text-sm"
          style={{ background: 'var(--accent-soft)', color: 'var(--ink-soft)' }}
        >
          <input
            type="checkbox"
            checked={earlyAccess}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEarlyAccess(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            style={{ accentColor: 'var(--accent)' }}
          />
          <span>
            Хочу ранний доступ к Komplid. <strong>{WAITLIST_OFFER}</strong>
          </span>
        </label>
      )}

      <PdConsentCheckbox id="tdf-consent" checked={consent} onChange={setConsent} />

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
        {isLoading ? 'Подготавливаем файл…' : 'Получить шаблон'}
      </Button>
    </form>
  );
}
