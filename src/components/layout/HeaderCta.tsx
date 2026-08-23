'use client';

import { useWaitlistHref } from '@/lib/use-waitlist-href';
import { primaryCtaLabel } from '@/lib/waitlist';

const SIGNUP_HREF = 'https://app.komplid.ru/signup';

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Первичная кнопка в шапке и мобильном меню. Отдельный клиентский узел,
 * чтобы сама шапка осталась серверной: ей нужно знать только адрес формы,
 * который зависит от текущей страницы (см. useWaitlistHref).
 */
export function HeaderCta({ className, style }: Props) {
  const href = useWaitlistHref(SIGNUP_HREF);

  return (
    <a href={href} className={className} style={style}>
      {primaryCtaLabel('Попробовать')}
    </a>
  );
}
