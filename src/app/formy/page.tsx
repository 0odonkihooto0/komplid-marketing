import type { Metadata } from 'next';
import Link from 'next/link';
import { DOC_FORMS } from '@/lib/formy-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ItemListSchema } from '@/components/seo/ItemListSchema';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';

export const metadata: Metadata = {
  title: 'Формы исполнительной документации — какие нужны и кто подписывает',
  description:
    'Реестр форм ИД: АОСР, АООК, общий журнал работ, исполнительные схемы, протоколы. По каждой форме — кто подписывает, какие приложения обязательны, когда оформляется и из-за чего возвращают.',
  alternates: { canonical: 'https://komplid.ru/formy' },
};

const FAQ_ITEMS = [
  {
    question: 'Какие документы нужны на конкретный вид работ?',
    answer:
      'Состав комплекта задаётся видом работ и проектом. На скрытые работы оформляется акт освидетельствования скрытых работ, на ответственные конструкции — акт освидетельствования ответственных конструкций, ход работ фиксируется в общем журнале работ, геометрия — исполнительными схемами. Точный перечень по каждой форме — на её странице в этом реестре.',
  },
  {
    question: 'Кто подписывает акты исполнительной документации?',
    answer:
      'Обязательные подписанты — ответственный за производство работ со стороны подрядчика и представитель строительного контроля застройщика. Проектировщик подключается при авторском надзоре, субподрядчик подписывает свой объём. Состав по каждой форме указан отдельно: у актов и журналов он разный.',
  },
  {
    question: 'Из-за чего чаще всего возвращают исполнительную документацию?',
    answer:
      'Три типовые причины: не указаны реквизиты документов о качестве применённых материалов, акт подписан лицом без действующего приказа о назначении, даты акта расходятся с записями журнала работ. На странице каждой формы эти причины разобраны отдельно.',
  },
  {
    question: 'Где взять бланк формы?',
    answer:
      'Формы актов и журналов установлены приказами Минстроя и применяются в действующей редакции. Готовые к заполнению шаблоны в формате .docx лежат в разделе «Шаблоны документов» — они бесплатны и не требуют регистрации.',
  },
];

export default function FormyPage() {
  const bySection = FORM_GROUPS();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Формы ИД', url: 'https://komplid.ru/formy' },
        ]}
      />
      <ItemListSchema
        name="Формы исполнительной документации"
        items={DOC_FORMS.map((f) => ({
          name: f.name,
          url: `https://komplid.ru/formy/${f.slug}`,
        }))}
      />

      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow-ref">Реестр форм · {DOC_FORMS.length} документов</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, margin: '14px 0' }}>
              Какие документы нужны на этот вид работ — и кто их подписывает
            </h1>
            <p>
              По каждой форме: когда оформляется, кто ставит подпись и что подтверждает,
              какие приложения обязательны и из-за чего документ возвращают с приёмки.
            </p>
          </div>

          {bySection.map(([section, forms]) => (
            <div key={section} style={{ marginBottom: 34 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 14,
                  marginBottom: 14,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--t2)',
                }}
              >
                <span style={{ flex: 'none' }}>{section}</span>
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>

              <div className="mod-grid mod-grid--3">
                {forms.map((form) => (
                  <Link key={form.slug} href={`/formy/${form.slug}`} className="mod-featured">
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
                        {form.code}
                      </span>
                      <span
                        className="counter-label"
                        style={{ marginTop: 0, marginLeft: 'auto', letterSpacing: '0.08em' }}
                      >
                        {form.fileType}
                      </span>
                    </div>
                    <h2
                      style={{
                        margin: '12px 0 0',
                        fontSize: 16,
                        fontWeight: 500,
                        letterSpacing: 0,
                        color: 'var(--t1)',
                      }}
                    >
                      {form.name}
                    </h2>
                    <p
                      style={{
                        margin: '9px 0 0',
                        fontSize: 12.5,
                        lineHeight: 1.55,
                        color: 'var(--t3)',
                      }}
                    >
                      {form.summary}
                    </p>
                    <div
                      className="counter-label"
                      style={{ marginTop: 12, letterSpacing: '0.06em' }}
                    >
                      {form.basis}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Faq eyebrow="Часто спрашивают" title="Вопросы о составе документации" items={FAQ_ITEMS} />

      <WaitlistSection source="formy" />
    </>
  );
}

/** Группирует формы по разделу, сохраняя порядок появления. */
function FORM_GROUPS(): Array<[string, typeof DOC_FORMS[number][]]> {
  const map = new Map<string, typeof DOC_FORMS[number][]>();
  for (const form of DOC_FORMS) {
    const list = map.get(form.section) ?? [];
    list.push(form);
    map.set(form.section, list);
  }
  return [...map.entries()];
}
