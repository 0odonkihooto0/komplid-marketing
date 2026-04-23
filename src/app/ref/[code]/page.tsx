import type { Metadata } from 'next';
import { Hero } from '@/components/blocks/Hero';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { validateRefCode } from '@/lib/referral';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: 'Вы приглашены в Komplid',
    description: `Приглашение в ERP Komplid. Активируйте код ${code} и получите скидку на первый месяц подписки.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReferralPage({ params }: PageProps) {
  const { code } = await params;

  // Cookie устанавливается middleware.ts ДО рендера этой страницы.
  // Здесь — только валидация кода для персонализации контента.
  const info = await validateRefCode(code);

  const discount = info?.discount ?? 30;
  const eyebrow = `Реферальный код · ${code.toUpperCase()}`;

  const titleContent = info?.inviterName ? (
    <>
      Вас пригласил <em>{info.inviterName}</em>
      <br />в Komplid
    </>
  ) : (
    <>
      Вы приглашены в <em>Komplid</em>
    </>
  );

  const subtitle =
    `Активируйте код и получите ${discount}% скидку на первый месяц подписки. ` +
    `Попробуйте все 18 модулей 14 дней бесплатно — скидка применится автоматически при оплате.`;

  const signupUrl =
    `https://app.komplid.ru/signup?ref=${encodeURIComponent(code)}&utm_source=referral`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru/' },
          { name: 'Приглашение', url: `https://komplid.ru/ref/${code}` },
        ]}
      />
      <Hero
        eyebrow={eyebrow}
        title={titleContent}
        subtitle={subtitle}
        primaryCta={{ label: 'Зарегистрироваться со скидкой', href: signupUrl }}
        secondaryCta={{ label: 'Узнать больше о Komplid', href: '/' }}
        variant="compact"
      />
    </>
  );
}
