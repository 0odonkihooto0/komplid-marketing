import { describe, it, expect } from 'vitest';
import { PRIVACY_POLICY_SECTIONS } from './privacy-policy';
import { PRIVACY_POLICY_VERSION, PRIVACY_POLICY_PATH } from './privacy-consent';

/**
 * Инварианты структуры политики. Текст правится редко и вручную — тесты ловят
 * порчу документа: пропавший раздел, пустую секцию, дублирующийся якорь
 * (якоря публичные, на них ссылаются извне).
 */
describe('политика конфиденциальности', () => {
  it('содержит все 12 разделов документа', () => {
    expect(PRIVACY_POLICY_SECTIONS).toHaveLength(12);
    expect(PRIVACY_POLICY_SECTIONS.map((s) => s.no)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ]);
  });

  it('якоря уникальны и совпадают с номерами разделов', () => {
    const ids = PRIVACY_POLICY_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of PRIVACY_POLICY_SECTIONS) {
      expect(section.id).toBe(`razdel-${section.no}`);
    }
  });

  it('ни один раздел не пуст', () => {
    for (const section of PRIVACY_POLICY_SECTIONS) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(0);
      for (const block of section.blocks) {
        if (block.type === 'p') expect(block.text.trim().length).toBeGreaterThan(0);
        if (block.type === 'list') expect(block.items.length).toBeGreaterThan(0);
        if (block.type === 'table') expect(block.rows.length).toBeGreaterThan(0);
      }
    }
  });

  // Раздел 6 в исходном документе — таблица; плоским текстом он нечитаем.
  it('раздел 6 остаётся таблицей из четырёх строк', () => {
    const section = PRIVACY_POLICY_SECTIONS.find((s) => s.no === '6');
    const table = section?.blocks[0];
    expect(table?.type).toBe('table');
    if (table?.type !== 'table') throw new Error('раздел 6 должен быть таблицей');
    expect(table.rows.map((r) => r.label)).toEqual([
      'Цель обработки',
      'Персональные данные',
      'Правовые основания',
      'Виды обработки персональных данных',
    ]);
  });

  it('в тексте не осталось плейсхолдеров реквизитов', () => {
    // Только сам текст документа, без JSON-обёртки: реквизиты подставляются
    // из company.ts, и незакрытая подстановка вида ${...} — это баг в проде.
    const texts = PRIVACY_POLICY_SECTIONS.flatMap((s) =>
      s.blocks.flatMap((b) => {
        if (b.type === 'p') return [b.text];
        if (b.type === 'list') return b.items;
        return b.rows.flatMap((r) => [r.label, ...r.items]);
      }),
    );

    for (const text of texts) {
      expect(text).not.toContain('ИП Фамилия И.О.');
      expect(text).not.toContain('${');
      expect(text).not.toContain('undefined');
    }
  });

  it('версия политики — дата в формате ISO, путь канонический', () => {
    expect(PRIVACY_POLICY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(PRIVACY_POLICY_PATH).toBe('/legal/privacy');
  });
});
