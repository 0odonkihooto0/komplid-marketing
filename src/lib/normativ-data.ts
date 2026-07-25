import fs from 'fs/promises';
import path from 'path';

// Реестр корпуса СП генерирует tools/publish.py репозитория mdTOhtmlBuild:
// ключ — обозначение («СП 48.13330.2019»), сами страницы — статические HTML
// в public/normativ/<slug>.html (отдаются через rewrite без расширения).
const REGISTRY_PATH = path.join(process.cwd(), 'content', 'normativ', 'registry.json');

export interface NormativDoc {
  designation: string;
  slug: string;
  title: string;
  snip: string | null;
  publishedAt?: string;
}

interface RegistryEntry {
  slug: string;
  title: string;
  snip: string | null;
  published?: boolean;
  publishedAt?: string;
}

/** Правила категоризации по названию: первый совпавший — категория. */
const CATEGORY_RULES: ReadonlyArray<{ name: string; keywords: string[] }> = [
  {
    name: 'Пожарная безопасность',
    keywords: ['пожарн', 'огнестойк', 'эвакуац', 'пожаротушен'],
  },
  {
    name: 'Транспорт и дороги',
    keywords: ['дорог', 'мосты', 'мостов', 'тоннел', 'аэродром', 'метрополитен',
      'железнодорожн', 'трамва', 'транспорт'],
  },
  {
    name: 'Инженерные системы и сети',
    keywords: ['отоплен', 'вентиляц', 'кондиционир', 'водоснабжен', 'водоотведен',
      'канализац', 'газораспределит', 'газоснабжен', 'тепловые сети', 'теплоснабжен',
      'электро', 'освещен', 'лифт', 'трубопровод', 'сети связи', 'мусоропровод'],
  },
  {
    name: 'Основания, фундаменты и геотехника',
    keywords: ['основани', 'фундамент', 'свайн', 'подпорн', 'земляны', 'грунт',
      'геотехн', 'подземн'],
  },
  {
    name: 'Строительные конструкции',
    keywords: ['конструкци', 'бетонн', 'железобетон', 'стальн', 'каменн',
      'деревянн', 'алюминиев', 'кровл', 'полы', 'изоляционн', 'отделочн'],
  },
  {
    name: 'Нагрузки, защита и климатология',
    keywords: ['нагрузки', 'воздейств', 'сейсмическ', 'климатолог', 'защит',
      'затоплен', 'коррози', 'шум', 'вибрац', 'молни', 'надежност', 'геофизик'],
  },
  {
    name: 'Организация и производство работ',
    keywords: ['организация строительства', 'геодезическ', 'производство работ',
      'исполнительн', 'консервац', 'снос', 'демонтаж'],
  },
  {
    name: 'Здания и сооружения',
    keywords: ['здани', 'жилы', 'общественн', 'производственн', 'склад', 'стоянк',
      'гостиниц', 'дошкольн', 'спортивн', 'теплиц', 'животновод', 'холодильник',
      'сооружени', 'помещени', 'планировк', 'застройк'],
  },
];

export const NORMATIV_FALLBACK_CATEGORY = 'Прочие своды правил';

/** Категория СП по названию — чистая функция, покрыта юнит-тестом. */
export function normativCategory(title: string): string {
  const t = title.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => t.includes(kw))) return rule.name;
  }
  return NORMATIV_FALLBACK_CATEGORY;
}

/** Числовой номер СП для сортировки («СП 9.x» раньше «СП 48.x»). */
export function normativNumber(designation: string): number {
  const m = designation.match(/СП\s+(\d+)/);
  return m?.[1] ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

let cache: NormativDoc[] | null = null;

/** Опубликованные документы корпуса, отсортированы по номеру СП. */
export async function getAllNormativDocs(): Promise<NormativDoc[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const registry = JSON.parse(raw) as Record<string, RegistryEntry>;
    cache = Object.entries(registry)
      .filter(([, e]) => e.published)
      .map(([designation, e]) => ({
        designation,
        slug: e.slug,
        title: e.title,
        snip: e.snip ?? null,
        publishedAt: e.publishedAt,
      }))
      .sort((a, b) => normativNumber(a.designation) - normativNumber(b.designation));
    return cache;
  } catch {
    return [];
  }
}

/** Документы, сгруппированные по категориям (порядок категорий стабилен). */
export async function getNormativByCategory(): Promise<
  Array<{ category: string; docs: NormativDoc[] }>
> {
  const docs = await getAllNormativDocs();
  const groups = new Map<string, NormativDoc[]>();
  for (const doc of docs) {
    const cat = normativCategory(doc.title);
    const list = groups.get(cat);
    if (list) list.push(doc);
    else groups.set(cat, [doc]);
  }
  const order = [...CATEGORY_RULES.map((r) => r.name), NORMATIV_FALLBACK_CATEGORY];
  return order
    .filter((cat) => groups.has(cat))
    .map((cat) => ({ category: cat, docs: groups.get(cat) ?? [] }));
}
