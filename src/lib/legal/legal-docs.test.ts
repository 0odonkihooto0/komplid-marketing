import { describe, it, expect } from 'vitest';
import { OFFER_SECTIONS, OFFER_VERSION, OFFER_PATH } from './offer';
import { TERMS_SECTIONS, TERMS_VERSION, TERMS_PATH } from './terms';
import { company } from '@/lib/company';
import type { PolicySection } from './privacy-policy';

/**
 * Инварианты оферты и пользовательского соглашения.
 *
 * Тексты правятся редко и вручную — тесты ловят порчу документа: пропавший
 * раздел, пустую секцию, дублирующийся якорь (якоря публичные, на них
 * ссылаются извне) и, главное, реквизиты, оставшиеся плейсхолдером из нулей.
 * «ОГРНИП 000000000000000» в юридическом документе выглядит как подделка.
 */

const DOCS: [string, PolicySection[], string, string][] = [
  ['публичная оферта', OFFER_SECTIONS, OFFER_VERSION, OFFER_PATH],
  ['пользовательское соглашение', TERMS_SECTIONS, TERMS_VERSION, TERMS_PATH],
];

function plainText(sections: PolicySection[]): string {
  return sections
    .flatMap((s) =>
      s.blocks.flatMap((b) => {
        if (b.type === 'p') return [b.text];
        if (b.type === 'list') return b.items;
        return b.rows.flatMap((r) => [r.label, ...r.items]);
      }),
    )
    .join('\n');
}

describe.each(DOCS)('%s', (_name, sections, version, path) => {
  it('нумерация разделов сплошная и начинается с единицы', () => {
    expect(sections.length).toBeGreaterThan(0);
    expect(sections.map((s) => s.no)).toEqual(sections.map((_, i) => String(i + 1)));
  });

  it('якоря уникальны и совпадают с номерами разделов', () => {
    const ids = sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(sections.map((s) => `razdel-${s.no}`));
  });

  it('в каждом разделе есть заголовок и хотя бы один блок', () => {
    for (const section of sections) {
      expect(section.title.trim().length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(0);
    }
  });

  it('пустых абзацев и пустых пунктов списков нет', () => {
    for (const section of sections) {
      for (const block of section.blocks) {
        if (block.type === 'p') expect(block.text.trim()).not.toBe('');
        if (block.type === 'list') {
          expect(block.items.length).toBeGreaterThan(0);
          for (const item of block.items) expect(item.trim()).not.toBe('');
        }
        if (block.type === 'table') {
          expect(block.rows.length).toBeGreaterThan(0);
          for (const row of block.rows) expect(row.items.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('реквизиты подставлены, а не остались строкой нулей', () => {
    const text = plainText(sections);
    expect(text).toContain(company.name);
    expect(text).toContain(company.inn);
    expect(text).toContain(company.ogrnip);
    expect(text).not.toMatch(/\b0{10,}\b/);
  });

  it('версия — дата в формате ISO', () => {
    expect(version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(new Date(version).getTime())).toBe(false);
  });

  it('канонический путь лежит в /legal', () => {
    expect(path).toMatch(/^\/legal\//);
  });
});

describe('разграничение документов', () => {
  it('оферта отвечает за платный доступ и называет режим налогообложения', () => {
    const text = plainText(OFFER_SECTIONS);
    // ИП на УСН: «НДС 22%» в документах недопустим (CLAUDE.md §9, §11).
    expect(text).toContain('НДС не облагается');
    expect(text).not.toMatch(/НДС\s+\d+\s*%/);
    expect(text).toContain('акцепт');
  });

  it('соглашение отвечает за сайт и ссылается на оферту', () => {
    const text = plainText(TERMS_SECTIONS);
    expect(text).toContain('/legal/oferta');
  });

  it('оба документа ведут за персональными данными в политику', () => {
    for (const [, sections] of DOCS) {
      expect(plainText(sections)).toContain('/legal/privacy');
    }
  });

  it('шаблоны отданы бесплатно и без обязательств по применению', () => {
    const text = plainText(TERMS_SECTIONS);
    expect(text).toContain('как есть');
    expect(text).toContain('бесплатно');
  });
});
