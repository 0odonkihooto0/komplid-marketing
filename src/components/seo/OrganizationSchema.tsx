import { JsonLd } from './JsonLd';

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://komplid.ru/#organization',
    name: 'Комплид',
    // «Komplid Systems» убран: такого юрлица и бренда нет (BRAND_STRATEGY §4.3).
    // Латиница осталась вторым именем: по ней ищут и на неё ведёт домен.
    alternateName: ['Komplid'],
    url: 'https://komplid.ru',
    logo: {
      '@type': 'ImageObject',
      url: 'https://komplid.ru/icons/logo-512.png',
      width: 512,
      height: 512,
    },
    description:
      'Платформа управления строительными проектами в России. 21 модуль: ИД, сметы, журналы, стройконтроль, ТИМ.',
    foundingDate: '2026',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressLocality: 'Москва',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@komplid.ru',
      contactType: 'customer support',
      availableLanguage: 'Russian',
    },
    // Только существующие профили. vc.ru/u/komplid не создан — ссылка на
    // несуществующий профиль в sameAs подрывает доверие к разметке у поисковиков.
    // Заводить профиль — пункт пре-лонча 0.8 в PROMOTION_STRATEGY.
    sameAs: ['https://t.me/komplid'],
  };

  return <JsonLd data={data} />;
}
