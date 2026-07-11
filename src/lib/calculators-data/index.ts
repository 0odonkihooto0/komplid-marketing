import { SMETA_AVANS } from './smeta-avans';
import { KS2_NDSFREE } from './ks2-ndsfree';
import { RABOCHIE_DNI } from './rabochie-dni';
import { NEUSTOYKA_PODRYAD } from './neustoyka-podryad';
import { PROSROCHKA_SDACHI } from './prosrochka-sdachi';
import { GARANTIYNOE_UDERZHANIE } from './garantiynoe-uderzhanie';
import { TRUDOZATRATY } from './trudozatraty';
import { ZIMNEE_UDOROZHANIE } from './zimnee-udorozhanie';
import { OBEM_BETONA } from './obem-betona';
import { ARMATURA } from './armatura';

// Слаги всех опубликованных калькуляторов. Union расширяется по мере добавления
// новых калькуляторов (Волны 1–3 плана 02-CALCULATORS-PLAN.md).
export type CalcSlug =
  | 'smeta-avans'
  | 'ks2-ndsfree'
  | 'rabochie-dni'
  | 'neustoyka-podryad'
  | 'prosrochka-sdachi'
  | 'garantiynoe-uderzhanie'
  | 'trudozatraty'
  | 'zimnee-udorozhanie'
  | 'obem-betona'
  | 'armatura';

// Категории каталога /kalkulyator (план 02 §5): «Деньги и договоры» /
// «Материалы и объёмы» / «Инженерные расчёты по СП».
export type CalcCategory = 'money' | 'materials' | 'engineering';

export const CATEGORY_LABELS: Record<CalcCategory, { title: string; description: string }> = {
  money: {
    title: 'Деньги и договоры',
    description:
      'Расчёты по договору подряда: аванс, НДС в КС-2, неустойка, гарантийное удержание, сроки в рабочих днях.',
  },
  materials: {
    title: 'Материалы и объёмы',
    description:
      'Расход материалов и объёмы работ: бетон, арматура, кирпич, штукатурка, земляные работы.',
  },
  engineering: {
    title: 'Инженерные расчёты по СП',
    description:
      'Нагрузки, теплотехника и другие расчёты по действующим сводам правил с нормативным обоснованием.',
  },
};

// Блок «Как считается» — формула текстом (доступна краулерам) + расшифровка переменных.
export interface CalcHowItWorks {
  formula: string;
  variables: { name: string; description: string }[];
  note?: string;
}

// Блок «Пример расчёта» — конкретные числа, AEO-магнит.
export interface CalcExample {
  conditions: string[];
  calculation: string[];
  result: string;
}

// Блок «Нормативное обоснование» — авторитетные внешние ссылки (законы, приказы, ГСН).
export interface NormativeRef {
  title: string;
  reference: string;
  url: string;
}

export interface CalculatorMeta {
  slug: CalcSlug;
  category: CalcCategory;
  title: string;
  titleShort: string;
  description: string;
  keywords: string[];
  howToUse: string[];
  howItWorks: CalcHowItWorks;
  example: CalcExample;
  normativeBasis: NormativeRef[];
  related: CalcSlug[];
  faq: { question: string; answer: string }[];
  schemaName: string;
  schemaDescription: string;
}

export const CALCULATORS: CalculatorMeta[] = [
  SMETA_AVANS,
  KS2_NDSFREE,
  RABOCHIE_DNI,
  NEUSTOYKA_PODRYAD,
  PROSROCHKA_SDACHI,
  GARANTIYNOE_UDERZHANIE,
  TRUDOZATRATY,
  ZIMNEE_UDOROZHANIE,
  OBEM_BETONA,
  ARMATURA,
];

export function getCalcBySlug(slug: string): CalculatorMeta | undefined {
  return CALCULATORS.find(c => c.slug === slug);
}
