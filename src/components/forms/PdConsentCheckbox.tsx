'use client';

import type { ChangeEvent } from 'react';
import { PRIVACY_POLICY_PATH } from '@/lib/legal/privacy-consent';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Уникален в пределах страницы: форм на странице может быть несколько. */
  id: string;
}

/**
 * Согласие на обработку персональных данных — обязательная галочка под каждой
 * формой, которая собирает email (152-ФЗ, ст. 9).
 *
 * Один компонент на все формы: текст согласия и адрес политики должны совпадать
 * везде, иначе в спорной ситуации непонятно, на что человек соглашался.
 *
 * Ссылка открывается в новой вкладке намеренно — уход на политику не должен
 * стирать уже заполненную форму.
 */
export function PdConsentCheckbox({ checked, onChange, id }: Props) {
  return (
    <label
      htmlFor={id}
      className="mt-4 flex cursor-pointer items-start gap-2 text-xs"
      style={{ color: 'var(--ink-mute)' }}
    >
      <input
        id={id}
        type="checkbox"
        required
        checked={checked}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        style={{ accentColor: 'var(--accent)' }}
      />
      <span>
        Согласен на обработку персональных данных в соответствии с{' '}
        <a
          href={PRIVACY_POLICY_PATH}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}
        >
          политикой конфиденциальности
        </a>
        .
      </span>
    </label>
  );
}
