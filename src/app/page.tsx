import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  FileText, BarChart2, BookOpen, Shield, Cpu, PenSquare,
  KeyRound, FileSignature, RefreshCw,
} from 'lucide-react';
import { Hero } from '@/components/blocks/Hero';
import { Modules } from '@/components/blocks/Modules';
import { Features } from '@/components/blocks/Features';
import { Metrics } from '@/components/blocks/Metrics';
import { SocialProof } from '@/components/blocks/SocialProof';
import { Pricing } from '@/components/blocks/Pricing';
import type { PricingTier } from '@/components/blocks/Pricing';
import { Faq } from '@/components/blocks/Faq';
import { Cta } from '@/components/blocks/Cta';
import { ProfiPackagesTeaser } from '@/components/blocks/ProfiPackagesTeaser';
import { LatestPosts } from '@/components/blocks/LatestPosts';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { SoftwareAppSchema } from '@/components/seo/SoftwareAppSchema';
import { BETA_METRICS, hasBetaMetrics } from '@/lib/proof-data';
import { primaryCtaHref, primaryCtaLabel } from '@/lib/waitlist';

export const metadata: Metadata = {
  title: 'Komplid — ERP для строительных проектов · ИД, Сметы, Журналы онлайн',
  description:
    'Цифровое управление строительством: 18 модулей в одной системе. ИД, КС-2/КС-3, ОЖР, смета, стройконтроль, ТИМ. От 12 000 ₽/мес для команды, от 1 900 ₽ для специалиста. Пробный период без карты.',
  alternates: { canonical: 'https://komplid.ru/' },
};

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: FileText,
    title: 'Исполнительная документация',
    description:
      'АОСР, ОЖР, КС-2/КС-3 по приказу №344/пр. Автогенерация из журналов, пакетный экспорт PDF/ZIP.',
  },
  {
    icon: BookOpen,
    title: 'Электронный ОЖР с телефона',
    description:
      'PWA офлайн-режим для прораба. Голосовой ввод, фото с GPS, автосинк при появлении связи.',
  },
  {
    icon: BarChart2,
    title: 'Сметы с версиями',
    description:
      'Импорт XML из Гранд-Сметы/РИК, визуальный diff двух версий, публичная ссылка для заказчика.',
  },
  {
    icon: Shield,
    title: 'Стройконтроль',
    description:
      'Предписания с фото, пины на план/BIM, маршруты устранения дефектов, шаблоны нарушений СНиП.',
  },
  {
    icon: Cpu,
    title: 'ТИМ / BIM',
    description: 'IFC-вьюер, BCF-замечания, коллизии, привязка элементов к АОСР и предписаниям.',
  },
  {
    icon: PenSquare,
    title: 'Подпись с привязкой к месту',
    description:
      'Простая электронная подпись с GPS-координатами и геозоной объекта — видно, кто и откуда подписал.',
  },
];

/**
 * Заявлять можно только поставленное (CLAUDE.md §21).
 * Эти функции в приложении ещё не работают — показываем отдельно и без сроков.
 */
const IN_PROGRESS: FeatureItem[] = [
  {
    icon: KeyRound,
    title: 'УКЭП КриптоПро',
    description: 'Квалифицированная подпись через КриптоПро CSP и Рутокен.',
  },
  {
    icon: FileSignature,
    title: 'Машиночитаемая доверенность',
    description: 'МЧД по 63-ФЗ — подписание в рамках делегированных полномочий.',
  },
  {
    icon: RefreshCw,
    title: 'Обмен с 1С',
    description: 'Двусторонняя синхронизация смет и актов с 1С:Предприятие.',
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Старт',
    subtitle: 'Одна команда, один объект.',
    price: '12 000',
    priceUnit: '₽/мес',
    priceNote: 'до 10 пользователей · 50 ГБ',
    features: [
      { text: 'Все 18 модулей', included: true },
      { text: 'Мобильное приложение', included: true },
      { text: 'Базовые шаблоны КС, АОСР, ОЖР', included: true },
      { text: 'Маршруты согласования', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
    cta: { label: 'Начать пробный период', href: 'https://app.komplid.ru/signup?plan=start' },
  },
  {
    name: 'Команда',
    subtitle: 'Генподрядчик и заказчик с несколькими объектами.',
    price: '48 000',
    priceUnit: '₽/мес',
    priceNote: 'до 50 пользователей · 1 ТБ · до 10 объектов',
    tag: 'Популярный',
    featured: true,
    features: [
      { text: 'Всё из «Старт»', included: true },
      { text: 'Маршруты согласований с подписью', included: true },
      { text: 'ТИМ · IFC, BCF, коллизии', included: true },
      { text: 'Импорт смет из Гранд-Сметы и РИК', included: true },
      { text: 'SLA 8×5, чат и менеджер', included: true },
    ],
    cta: { label: 'Выбрать «Команду»', href: 'https://app.komplid.ru/signup?plan=team' },
  },
  {
    name: 'Корпоративный',
    subtitle: 'Группы компаний и холдинги.',
    price: 'По запросу',
    priceUnit: '',
    features: [
      { text: 'Всё из «Команды»', included: true },
      { text: 'On-premise в вашем контуре', included: true },
      { text: 'Кастомизация под процессы', included: true },
      { text: 'SLA 24×7, менеджер внедрения', included: true },
      { text: 'SSO, ActiveDirectory', included: true },
    ],
    cta: { label: 'Связаться', href: '/company/contact' },
  },
];

const FAQ_ITEMS = [
  {
    question: 'Что такое Komplid?',
    answer:
      'Komplid — это облачная ERP-система для управления строительными проектами в России. Она объединяет 18 модулей: исполнительную документацию, сметы, журналы работ, стройконтроль, ТИМ, управление ресурсами. Подходит для генподрядчиков, заказчиков, технадзора и одиночных специалистов.',
  },
  {
    question: 'Чем Komplid отличается от ЦУС и Exon?',
    answer:
      'Komplid отличается тремя ключевыми особенностями. Во-первых, это единственная платформа в России с Профи-пакетами для одиночных специалистов от 1 900 ₽ в месяц (сметчики, ПТО, прорабы). Во-вторых, у Komplid работает PWA с полноценным offline-режимом для объектов без связи. В-третьих, цены фиксированные и публичные.',
  },
  {
    question: 'Сколько стоит Komplid?',
    answer:
      'Для компаний: «Старт» 12 000 ₽/мес до 10 пользователей, «Команда» 48 000 ₽/мес до 50 пользователей, «Корпоративный» индивидуально. Для специалистов: Профи-пакеты (Сметчик-Студио, ИД-Мастер, Прораб-Журнал) 1 900–2 900 ₽/мес. Годовая подписка со скидкой 20%.',
  },
  {
    question: 'Хранятся ли данные в России?',
    answer:
      'Да. Вся инфраструктура Komplid размещена в российских дата-центрах Timeweb Cloud (Москва, Санкт-Петербург). Платформа соответствует требованиям ФЗ-152 о персональных данных. Данные не передаются в зарубежные юрисдикции.',
  },
  {
    question: 'Есть ли бесплатный период?',
    answer:
      'Да. Тарифы Pro и командные — 14 дней полного доступа без привязки карты, тарифы Базовый — 7 дней. Постоянного бесплатного уровня для команд нет: это осознанное решение, чтобы не тянуть неактивные аккаунты за счёт платящих.',
  },
  {
    question: 'Работает ли Komplid офлайн на стройке?',
    answer:
      'Да, мобильное приложение Komplid работает как PWA с полноценным offline-режимом. Прораб может вести ОЖР, делать фото с GPS-координатами, фиксировать дефекты без интернета. При появлении связи всё синхронизируется автоматически.',
  },
  {
    question: 'Можно ли использовать Komplid на одном объекте?',
    answer:
      'Да. Тариф «Старт» рассчитан именно на один объект и подходит для пилотного проекта. Также у нас есть Профи-пакеты для одиночных специалистов, которые ведут собственные сметы или исполнительную документацию без привязки к компании.',
  },
];

export default function HomePage() {
  return (
    <>
      <SoftwareAppSchema
        name="Komplid"
        description="ERP-платформа для строительных проектов: 18 модулей в одной системе. ИД, КС-2/КС-3, ОЖР, смета, стройконтроль, ТИМ."
        url="https://komplid.ru"
      />

      <Hero
        eyebrow="ERP для строительных проектов"
        title={
          <>
            <span className="line">Стройка</span>
            <span className="line">
              без <em>бумаг, потерь</em>
            </span>
            <span className="line">и недельных сверок.</span>
          </>
        }
        subtitle="Komplid ведёт объект от ПИР и сметы до КС-2 и ввода в эксплуатацию. 18 модулей в одной системе: ИД, ГПР, СК, ТИМ, журналы, отчёты — с реальным числом полей, подписей и ссылок между документами по СП и СНиП."
        primaryCta={{
          label: primaryCtaLabel('Попробовать 14 дней'),
          href: primaryCtaHref('https://app.komplid.ru/signup'),
        }}
        secondaryCta={{ label: 'Бесплатные шаблоны документов', href: '/shablony' }}
      />

      {/* Клиентские метрики появятся здесь, когда бета их измерит — src/lib/proof-data.ts.
          До тех пор показываем только проверяемые факты о самой платформе. */}
      <SocialProof />

      {hasBetaMetrics && (
        <Metrics
          eyebrow="Komplid в цифрах"
          title="Что показывает бета"
          variant="dark"
          items={BETA_METRICS}
        />
      )}

      <Modules />

      <Features
        eyebrow="Что получает команда"
        title="Главные возможности"
        description="Инструменты, которые знают как устроена стройка в России. Правильные поля, маршруты и ссылки между документами."
        items={FEATURES}
      />

      <Features
        eyebrow="Честно о статусе"
        title="Что пока в разработке"
        description="Komplid ещё не запущен. Эти возможности спроектированы, но пока не работают — мы не обещаем их сроков и не считаем частью текущего продукта."
        items={IN_PROGRESS}
      />

      <ProfiPackagesTeaser />

      <Pricing
        eyebrow="Для команд и компаний"
        title="Прозрачные цены. Без скрытых лимитов на объекты."
        description="Любой тариф включает все 18 модулей."
        tiers={PRICING_TIERS}
      />

      <Faq
        eyebrow="Часто спрашивают"
        title="Ответы на главные вопросы."
        items={FAQ_ITEMS}
        centered
      />

      <LatestPosts limit={3} />

      <WaitlistSection source="homepage" />

      <Cta
        eyebrow="Пробный период без карты"
        title="Попробуйте Komplid на реальном объекте."
        description="Заведите объект, загрузите договор и пару документов — через 15 минут ваш прораб будет работать в системе."
        primary={{
          label: primaryCtaLabel('Начать бесплатно'),
          href: primaryCtaHref('https://app.komplid.ru/signup'),
        }}
        secondary={{ label: 'Смотреть шаблоны и калькуляторы', href: '/shablony' }}
      />
    </>
  );
}
