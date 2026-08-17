import type { Metadata } from 'next';
import { ProfiPackages } from '@/components/home/ProfiPackages';
import { TariffCards } from '@/components/home/TariffCards';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { OBJECT_MODULES, ORG_MODULES } from '@/lib/home-data';

const TOTAL_MODULES = OBJECT_MODULES.length + ORG_MODULES.length;

export const metadata: Metadata = {
  title: 'Тарифы «Комплид» — от 1 900 ₽ специалисту, от 12 000 ₽ команде',
  description:
    'Цены на «Комплид» без «по запросу»: Профи-пакеты для сметчика, ПТО и прораба от 1 900 ₽/мес, командные тарифы от 12 000 ₽/мес. Все модули открыты в любом тарифе, годовая оплата −20%.',
  alternates: { canonical: 'https://komplid.ru/pricing' },
};

const FAQ_ITEMS = [
  {
    question: 'Сколько стоит «Комплид»?',
    answer:
      'Специалисту: Базовый 1 900 ₽/мес, Про 2 900 ₽/мес. Команде: «Команда Старт» 12 000 ₽/мес на 10 человек и один объект, «Команда» 48 000 ₽/мес на 50 человек и десять объектов, «Корпоративный» — по счёту. Годовая оплата дешевле на 20%.',
  },
  {
    question: 'Чем тарифы отличаются по функциям?',
    answer:
      `Ничем: все ${TOTAL_MODULES} модуля открыты в любом тарифе. Различаются число людей, количество активных строек и объём хранилища. Мы сознательно не режем функциональность по тарифам — иначе на объекте не хватает ровно того модуля, который сегодня нужен.`,
  },
  {
    question: 'Считаются ли заказчик и технадзор как пользователи?',
    answer:
      'Нет. Внешние участники — заказчик, строительный контроль, проектировщик — заходят по ссылке на один объект и места в тарифе не занимают. Платите только за свою команду.',
  },
  {
    question: 'Есть ли бесплатный уровень?',
    answer:
      'Постоянно бесплатны материалы самого сайта: база из 323 сводов правил и ГОСТ с поиском и 22 инженерных калькулятора — регистрация для них не нужна. Постоянного бесплатного тарифа для команд нет: это осознанное решение, чтобы неактивные аккаунты не тянули деньги с платящих.',
  },
  {
    question: 'Как оплатить и что с закрывающими документами?',
    answer:
      'Оплата по счёту, закрывающие документы приходят в ЭДО. Исполнитель — ИП на упрощённой системе налогообложения, поэтому в счетах указано «НДС не облагается».',
  },
  {
    question: 'Можно ли докупить хранилище отдельно?',
    answer:
      'Да, пакетами: 50 ГБ — 490 ₽/мес, 250 ГБ — 1 900 ₽/мес, 1 ТБ — 4 900 ₽/мес. Это дешевле, чем переходить на старший тариф ради одного места на диске.',
  },
];

export default function PricingPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Тарифы', url: 'https://komplid.ru/pricing' },
        ]}
      />

      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow-ref">Тарифы</span>
            <h1 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 500, margin: '14px 0' }}>
              Прозрачные цены. Без скрытых лимитов на объекты.
            </h1>
            <p>
              Специалист платит за себя, компания — за команду. Все {TOTAL_MODULES} модуля открыты
              в любом тарифе: различаются только число людей, активных строек и объём хранилища.
            </p>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>
            Специалисту — Профи-пакеты
          </h2>
          <ProfiPackages />

          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '48px 0 18px' }}>
            Команде и компании
          </h2>
          <TariffCards />
        </div>
      </section>

      <Faq eyebrow="Часто спрашивают" title="Вопросы о тарифах" items={FAQ_ITEMS} centered />

      <WaitlistSection source="pricing" />
    </>
  );
}
