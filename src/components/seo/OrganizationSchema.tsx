import { JsonLd } from './JsonLd';

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://komplid.ru/#organization',
    name: 'Комплид',
    // «Komplid Systems» убран: такого юрлица и бренда нет (BRAND_STRATEGY §4.3).
    // Латиница остаётся вторым именем: по ней ищут и на неё ведёт домен.
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
    // Город — тот же, что указан регионом сайта в Яндекс.Вебмастере: разметка,
    // страница контактов и панель должны говорить одно и то же, иначе регион
    // не подтверждается. areaServed отдельно: работаем онлайн по всей стране.
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressLocality: 'Санкт-Петербург',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Россия',
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
