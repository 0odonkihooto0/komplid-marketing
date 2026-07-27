import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { WAITLIST_MODE } from '@/lib/waitlist';

export const metadata: Metadata = {
  title: 'Регистрация в Komplid',
  description: 'Ранний доступ к Komplid — ERP для строительных проектов.',
  // Страница-переходник: в поиске ей делать нечего.
  robots: { index: false, follow: true },
};

/**
 * Точка входа для ссылок вида komplid.ru/signup.
 *
 * До запуска приложения регистрации нет — вместо пустой страницы (что тут было
 * раньше) показываем форму раннего доступа. После запуска страница просто
 * перенаправляет в приложение.
 */
export default function SignupPage() {
  if (!WAITLIST_MODE) {
    redirect('https://app.komplid.ru/signup?utm_source=komplid_ru&utm_medium=redirect');
  }

  return (
    <WaitlistSection
      source="signup_page"
      eyebrow="Регистрация ещё закрыта"
      title="Komplid откроется скоро — оставьте почту"
      description="Мы запускаем доступ волнами и начинаем со списка раннего доступа. Напишем в день открытия и закрепим скидку."
    />
  );
}
