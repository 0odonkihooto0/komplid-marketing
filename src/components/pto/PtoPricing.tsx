import { RolePricing, type PricingTierDef } from '@/components/blocks/RolePricing';

const TIERS: PricingTierDef[] = [
  {
    name: 'Бесплатно',
    subtitle: 'Попробовать без рисков.',
    monthlyPrice: 0,
    priceNote: 'до 10 АОСР/мес · без ЭЦП',
    features: [
      { text: 'До 10 актов АОСР в месяц', included: true },
      { text: 'Просмотр шаблонов', included: true },
      { text: 'ОЖР и ЭЦП', included: false },
      { text: 'Маршруты согласования', included: false },
      { text: 'КС-2 / КС-3 и экспорт ZIP', included: false },
    ],
    ctaLabel: 'Начать бесплатно',
    ctaHref:
      'https://app.komplid.ru/signup?plan=free&role=pto&utm_source=landing&utm_medium=organic&utm_campaign=pto',
  },
  {
    name: 'Базовый',
    subtitle: 'Для активной работы с ИД.',
    monthlyPrice: 1900,
    priceNote: '1 специалист · до 50 актов/мес · 1 объект',
    features: [
      { text: 'АОСР по приказу №344/пр', included: true },
      { text: 'Электронный ОЖР', included: true },
      { text: 'ЭЦП КриптоПро + МЧД', included: true },
      { text: 'Маршруты согласования', included: false },
      { text: 'КС-2 / КС-3 и экспорт XML ИСУП', included: false },
    ],
    ctaLabel: 'Выбрать Базовый',
    ctaHref:
      'https://app.komplid.ru/signup?plan=pto-base&role=pto&utm_source=landing&utm_medium=organic&utm_campaign=pto',
  },
  {
    name: 'Pro',
    subtitle: 'Полный арсенал ПТО-инженера.',
    monthlyPrice: 2900,
    priceNote: '1 специалист · безлимит · 5 объектов',
    features: [
      { text: 'Всё из Базового', included: true },
      { text: 'КС-2 / КС-3 автогенерация', included: true },
      { text: 'Маршруты согласования (4 этапа)', included: true },
      { text: 'Пакетный экспорт ZIP + XML ИСУП', included: true },
      { text: 'До 5 объектов одновременно', included: true },
    ],
    ctaLabel: 'Выбрать Pro',
    ctaHref:
      'https://app.komplid.ru/signup?plan=pto-pro&role=pto&utm_source=landing&utm_medium=organic&utm_campaign=pto',
    featured: true,
    tag: 'Популярный',
  },
];

export function PtoPricing() {
  return (
    <RolePricing
      eyebrow="Тарифы ИД-Мастера"
      title="Начните бесплатно, масштабируйте по мере задач"
      description="Все тарифы включают 50+ шаблонов актов по приказу №344/пр. Без лимитов на число видов актов."
      tiers={TIERS}
    />
  );
}
