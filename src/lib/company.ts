// Реквизиты ИП — единая точка чтения env. При переходе на ООО меняем здесь,
// а не в футере/контактах/оферте по отдельности (см. CLAUDE.md раздел 11).
export const company = {
  name: process.env.COMPANY_NAME ?? 'ИП Фамилия И.О.',
  inn: process.env.COMPANY_INN ?? '000000000000',
  ogrnip: process.env.COMPANY_OGRNIP ?? '000000000000000',
  email: process.env.COMPANY_EMAIL ?? 'hello@komplid.ru',
} as const;
