import type { PolicyBlock, PolicySection } from '@/lib/legal/privacy-policy';

/**
 * Вёрстка юридического документа: оглавление и пронумерованные разделы.
 *
 * Общая для политики конфиденциальности, оферты и пользовательского соглашения.
 * Раньше жила внутри страницы политики; с появлением ещё двух документов
 * копировать её в каждую страницу означало три места для одной правки.
 *
 * Типы блоков берутся у политики — она первой описала структуру, и заводить
 * ради оферты второй, идентичный набор типов незачем.
 */

export function LegalBlock({ block }: { block: PolicyBlock }) {
  if (block.type === 'p') {
    return (
      <p className="mb-4 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        {block.text}
      </p>
    );
  }

  if (block.type === 'list') {
    return (
      <ul className="mb-4 grid gap-2 pl-5" style={{ color: 'var(--ink-soft)', listStyle: 'disc' }}>
        {block.items.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  // Стили классом, а не инлайном: на узком экране строки должны распадаться
  // на блоки медиазапросом, а инлайновый style его перебивает (см. globals.css).
  return (
    <div className="mb-4" style={{ overflowX: 'auto' }}>
      <table className="policy-table">
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>
                {row.items.length === 1 ? (
                  row.items[0]
                ) : (
                  <ul>
                    {row.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalSection({ section }: { section: PolicySection }) {
  return (
    <section id={section.id} style={{ scrollMarginTop: 90 }} className="mb-10">
      <h2 className="mb-4 text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
        {section.no}. {section.title}
      </h2>
      {section.blocks.map((block, i) => (
        <LegalBlock key={i} block={block} />
      ))}
    </section>
  );
}

/** Оглавление документа. Без него до нужного пункта в длинном тексте не добраться. */
export function LegalContents({
  sections,
  label,
}: {
  sections: readonly PolicySection[];
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="mb-12 rounded-xl p-6"
      style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
    >
      <h2
        className="mb-4 font-mono text-[10px] uppercase tracking-widest"
        style={{ color: 'var(--ink-mute)' }}
      >
        Содержание
      </h2>
      <ol className="grid gap-2 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.id} className="text-sm">
            <a href={`#${section.id}`} style={{ color: 'var(--ink-soft)' }}>
              <span style={{ color: 'var(--ink-mute)' }}>{section.no}.</span> {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Дата редакции по-русски: в шапке её читают люди, а не машины. */
export function formatLegalVersion(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Реквизит задан, а не остался плейсхолдером из company.ts.
 *
 * Показать «ОГРНИП 000000000000000» на юридической странице хуже, чем
 * не показать реквизит вовсе: это выглядит как поддельные данные.
 */
export function isFilledRequisite(value: string): boolean {
  return !/^0+$/.test(value);
}
