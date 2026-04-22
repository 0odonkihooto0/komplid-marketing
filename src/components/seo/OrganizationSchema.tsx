import { JsonLd } from './JsonLd';

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://komplid.ru/#organization',
    name: 'Komplid',
    alternateName: ['Комплид', 'Komplid Systems'],
    url: 'https://komplid.ru',
    logo: {
      '@type': 'ImageObject',
      url: 'https://komplid.ru/icons/logo-512.png',
      width: 512,
      height: 512,
    },
    description:
      'ERP-платформа для цифрового управления строительными проектами в России. 18 модулей: ИД, сметы, журналы, стройконтроль, ТИМ.',
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
    sameAs: ['https://t.me/komplid', 'https://vc.ru/u/komplid'],
  };

  return <JsonLd data={data} />;
}
