import type { Metadata } from 'next';
import Link from 'next/link';
import { XSD_SCHEMAS, ISUP_FLOW } from '@/lib/isup-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ItemListSchema } from '@/components/seo/ItemListSchema';
import { HowToSchema } from '@/components/seo/HowToSchema';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';

/** Сколько комплектов схем поддержано в приложении — см. app-feature-reality.md. */
const SUPPORTED_SETS = 12;

export const metadata: Metadata = {
  title: 'XSD-схемы Минстроя для ИСУП — поля, ошибки валидации, порядок сдачи',
  description:
    'Разбор XSD-схем для сдачи исполнительной документации в ИСУП: обязательные поля, фрагмент XML-пакета и что означают ошибки валидатора. Схемы АОСР, АООК, ОЖР, КС-2, КС-3.',
  alternates: { canonical: 'https://komplid.ru/isup' },
};

const FAQ_ITEMS = [
  {
    question: 'Что такое ИСУП?',
    answer:
      'Информационная система управления проектами — государственная система, через которую передаётся документация по объектам капитального строительства. Документы подаются XML-пакетами по официальным XSD-схемам: структура файла и порядок элементов заданы схемой строго, свободной формы нет.',
  },
  {
    question: 'Передаёт ли «Комплид» документы в ИСУП напрямую?',
    answer:
      'Нет. «Комплид» формирует XML-пакет по официальным XSD-схемам, вы выгружаете его и подаёте сами. Прямой машинной передачи в ИСУП у нас нет, и сроков её появления мы не обещаем.',
  },
  {
    question: 'Сколько схем поддержано?',
    answer:
      `В приложении реализована выгрузка по ${SUPPORTED_SETS} комплектам схем. Здесь разобраны основные из них — если нужен разбор ещё одного комплекта, напишите, добавим следующим.`,
  },
  {
    question: 'Почему валидатор ругается на порядок элементов?',
    answer:
      'Последовательность элементов в XSD-схеме строгая. Если необязательный блок пуст и выпадает целиком, валидатор видит нарушение порядка и сообщает об ошибке cvc-complex-type. Пустой элемент по схеме допустим, а отсутствующий — нет.',
  },
];

export default function IsupPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'ИСУП и XSD-схемы', url: 'https://komplid.ru/isup' },
        ]}
      />
      <ItemListSchema
        name="XSD-схемы Минстроя для ИСУП"
        items={XSD_SCHEMAS.map((s) => ({
          name: s.name,
          url: `https://komplid.ru/isup/${s.slug}`,
        }))}
      />
      <HowToSchema
        name="Как сдать исполнительную документацию в ИСУП"
        description="Порядок подготовки и подачи XML-пакета по XSD-схемам Минстроя."
        steps={ISUP_FLOW.map((f) => `${f.title}. ${f.text}`)}
      />

      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow-ref">Сдача ИД в ИСУП · {SUPPORTED_SETS} комплектов схем</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, margin: '14px 0' }}>
              XML по схемам Минстроя: поля, ошибки валидации, порядок сдачи
            </h1>
            <p>
              Документы подаются пакетами по официальным XSD-схемам. Здесь разобрано, из чего
              состоит каждая схема, какие поля обязательны и что на самом деле означают ошибки
              валидатора.
            </p>
          </div>

          {/* Честный статус — сразу, а не мелким шрифтом внизу */}
          <div
            style={{
              marginBottom: 34,
              padding: '18px 22px',
              borderRadius: 12,
              background: 'var(--accCard)',
              border: '1px solid var(--acc)',
              maxWidth: 860,
            }}
          >
            <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
              Что делает «Комплид»
            </div>
            <p style={{ margin: '9px 0 0', fontSize: 14.5, lineHeight: 1.55, color: 'var(--t2)' }}>
              «Комплид» формирует XML-пакет по официальным XSD-схемам — по {SUPPORTED_SETS}{' '}
              поддержанным комплектам. Вы выгружаете пакет и подаёте его сами: прямой машинной
              передачи в ИСУП у нас нет.
            </p>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>
            Порядок сдачи, если делаете это впервые
          </h2>
          <div className="mod-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 40 }}>
            {ISUP_FLOW.map((step) => (
              <div className="mod-featured" key={step.n}>
                <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
                  {step.n}
                </div>
                <h3 style={{ margin: '10px 0 0', fontSize: 15, fontWeight: 500, letterSpacing: 0 }}>
                  {step.title}
                </h3>
                <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--t3)' }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>Разобранные схемы</h2>
          <div className="mod-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {XSD_SCHEMAS.map((s) => (
              <Link key={s.slug} href={`/isup/${s.slug}`} className="mod-featured">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      padding: '4px 9px',
                      borderRadius: 6,
                      background: 'var(--accSoft)',
                      color: 'var(--acc)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {s.code}
                  </span>
                  <span
                    className="counter-label"
                    style={{ marginTop: 0, marginLeft: 'auto', letterSpacing: '0.08em' }}
                  >
                    v{s.version}
                  </span>
                </div>
                <h3 style={{ margin: '12px 0 0', fontSize: 16, fontWeight: 500, letterSpacing: 0 }}>
                  {s.short}
                </h3>
                <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.55, color: 'var(--t3)' }}>
                  {s.teaser}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Faq eyebrow="Часто спрашивают" title="Вопросы о сдаче в ИСУП" items={FAQ_ITEMS} />

      <WaitlistSection source="isup" />
    </>
  );
}
