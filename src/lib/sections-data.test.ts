import { describe, it, expect } from 'vitest';
import { DOC_FORMS, getDocForm, FORM_SECTIONS } from './formy-data';
import { GLOSSARY_TERMS, getGlossaryTerm, TERM_CATEGORIES } from './glossariy-data';
import { XSD_SCHEMAS, getXsdSchema, SCHEMA_GROUPS } from './isup-data';
import { ROLE_SOLUTIONS, getRoleSolution } from './solutions-data';
import {
  SP_CLAUSES,
  CLAUSE_DOCS,
  getClause,
  getClauseByPath,
  clauseDocSlug,
  clauseUrlPart,
  clauseUrl,
} from './normativ-clauses';

/**
 * Данные разделов перенесены из прототипов скриптом, а перелинковка в них
 * задана слагами. Опечатка в слаге даёт ссылку в 404 — ровно то, на чём сайт
 * уже обжёгся со ссылками на несуществующий /demo. Поэтому связность
 * проверяется тестом, а не глазами.
 */

describe('формы ИД', () => {
  it('слаги уникальны', () => {
    const slugs = DOC_FORMS.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('связанные формы существуют', () => {
    for (const form of DOC_FORMS) {
      for (const slug of form.related) {
        expect(getDocForm(slug), `${form.slug} → ${slug}`).toBeDefined();
      }
    }
  });

  it('форма не ссылается сама на себя', () => {
    for (const form of DOC_FORMS) {
      expect(form.related).not.toContain(form.slug);
    }
  });

  it('раздел каждой формы есть в списке разделов', () => {
    for (const form of DOC_FORMS) {
      expect(FORM_SECTIONS, form.slug).toContain(form.section);
    }
  });

  it('у каждой формы есть подписанты, приложения и вопросы', () => {
    for (const form of DOC_FORMS) {
      expect(form.signers.length, form.slug).toBeGreaterThan(0);
      expect(form.appendices.length, form.slug).toBeGreaterThan(0);
      expect(form.faq.length, form.slug).toBeGreaterThan(0);
    }
  });
});

describe('глоссарий', () => {
  it('слаги уникальны', () => {
    const slugs = GLOSSARY_TERMS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('смежные термины существуют', () => {
    for (const term of GLOSSARY_TERMS) {
      for (const slug of term.related) {
        expect(getGlossaryTerm(slug), `${term.slug} → ${slug}`).toBeDefined();
      }
    }
  });

  it('раздел термина есть в списке разделов', () => {
    for (const term of GLOSSARY_TERMS) {
      expect(TERM_CATEGORIES, term.slug).toContain(term.category);
    }
  });

  it('ссылки в связях ведут на существующие разделы сайта', () => {
    // /otkazy и /kurs прототип упоминал, но таких разделов нет —
    // генератор данных их вычистил, проверяем что не вернулись.
    for (const term of GLOSSARY_TERMS) {
      for (const use of term.usage) {
        expect(use.url.startsWith('/'), `${term.slug}: ${use.url}`).toBe(true);
        expect(use.url).not.toMatch(/^\/(otkazy|kurs)/);
      }
    }
  });

  it('ссылки на нормативы используют полный слаг документа', () => {
    // Короткий вид /normativ/sp-48/... не отдаётся: слаги корпуса полные.
    for (const term of GLOSSARY_TERMS) {
      for (const use of term.usage) {
        if (use.url.startsWith('/normativ/')) {
          expect(use.url, term.slug).toMatch(/^\/normativ\/sp-\d+-\d+-\d+\//);
        }
      }
    }
  });
});

describe('схемы ИСУП', () => {
  it('слаги уникальны', () => {
    const slugs = XSD_SCHEMAS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('группа схемы есть в списке групп', () => {
    for (const schema of XSD_SCHEMAS) {
      expect(SCHEMA_GROUPS, schema.slug).toContain(schema.group);
    }
  });

  it('у каждой схемы есть поля, фрагмент XML и разбор ошибок', () => {
    for (const schema of XSD_SCHEMAS) {
      expect(schema.fields.length, schema.slug).toBeGreaterThan(0);
      expect(schema.xml.length, schema.slug).toBeGreaterThan(0);
      expect(schema.errors.length, schema.slug).toBeGreaterThan(0);
    }
  });

  it('находится по слагу', () => {
    expect(getXsdSchema('aosr')).toBeDefined();
    expect(getXsdSchema('нет-такой')).toBeUndefined();
  });
});

describe('ролевые решения', () => {
  it('четыре роли, слаги совпадают с адресами страниц', () => {
    expect(ROLE_SOLUTIONS).toHaveLength(4);
    for (const role of ROLE_SOLUTIONS) {
      expect(role.url).toBe(`/solutions/${role.id}`);
      expect(getRoleSolution(role.id)).toBeDefined();
    }
  });

  it('у каждой роли заполнены все блоки страницы', () => {
    for (const role of ROLE_SOLUTIONS) {
      expect(role.pains.length, role.id).toBeGreaterThan(0);
      expect(role.day.length, role.id).toBeGreaterThan(0);
      expect(role.modules.length, role.id).toBeGreaterThan(0);
      expect(role.compare.length, role.id).toBeGreaterThan(0);
      expect(role.faq.length, role.id).toBeGreaterThan(0);
    }
  });

  it('вторичная ссылка ведёт внутрь сайта', () => {
    for (const role of ROLE_SOLUTIONS) {
      expect(role.secondaryHref.startsWith('/'), role.id).toBe(true);
    }
  });
});

describe('пункты сводов правил', () => {
  it('идентификаторы уникальны', () => {
    const ids = SP_CLAUSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('адрес пункта двухсегментный и с полным слагом документа', () => {
    // Односегментный /normativ/<slug> обязан остаться за статикой корпуса
    // (CLAUDE.md §19 п.3): роут на два сегмента её не перехватывает.
    for (const clause of SP_CLAUSES) {
      expect(clauseUrl(clause), clause.id).toMatch(/^\/normativ\/sp-\d+-\d+-\d+\/p-[\d-]+$/);
    }
  });

  it('номер пункта переводится в адрес однозначно', () => {
    const clause = SP_CLAUSES.find((c) => c.clause === '6.13');
    expect(clause && clauseUrlPart(clause)).toBe('p-6-13');
  });

  it('пункт находится по адресу, из которого собран', () => {
    for (const clause of SP_CLAUSES) {
      const found = getClauseByPath(clauseDocSlug(clause), clauseUrlPart(clause));
      expect(found?.id, clause.id).toBe(clause.id);
    }
  });

  it('смежные пункты существуют', () => {
    for (const clause of SP_CLAUSES) {
      for (const id of clause.related) {
        expect(getClause(id), `${clause.id} → ${id}`).toBeDefined();
      }
    }
  });

  it('у каждого пункта известен свод правил', () => {
    for (const clause of SP_CLAUSES) {
      expect(CLAUSE_DOCS[clause.docKey], clause.id).toBeDefined();
    }
  });

  it('СП 70 помечен как отсутствующий в корпусе', () => {
    // Документа в корпусе нет, поэтому ссылки на его страницу быть не должно —
    // иначе хлебная крошка ведёт в 404.
    expect(CLAUSE_DOCS['sp-70']?.slug).toBeNull();
    expect(CLAUSE_DOCS['sp-48']?.slug).toBe('sp-48-13330-2019');
  });
});
