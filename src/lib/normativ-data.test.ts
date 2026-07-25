import { describe, it, expect } from 'vitest';
import {
  normativCategory,
  normativNumber,
  NORMATIV_FALLBACK_CATEGORY,
  getAllNormativDocs,
} from './normativ-data';

describe('normativCategory', () => {
  it('относит профильные СП к ожидаемым категориям', () => {
    expect(normativCategory('Организация строительства')).toBe(
      'Организация и производство работ',
    );
    expect(normativCategory('Нагрузки и воздействия')).toBe(
      'Нагрузки, защита и климатология',
    );
    expect(normativCategory('Бетонные и железобетонные конструкции. Основные положения')).toBe(
      'Строительные конструкции',
    );
    expect(normativCategory('Основания зданий и сооружений')).toBe(
      'Основания, фундаменты и геотехника',
    );
    expect(normativCategory('Автомобильные дороги')).toBe('Транспорт и дороги');
    expect(normativCategory('Отопление, вентиляция и кондиционирование воздуха')).toBe(
      'Инженерные системы и сети',
    );
    expect(normativCategory('Системы противопожарной защиты. Эвакуационные пути и выходы')).toBe(
      'Пожарная безопасность',
    );
    expect(normativCategory('Общественные здания и сооружения')).toBe(
      'Здания и сооружения',
    );
  });

  it('неизвестное название уходит в фолбэк-категорию', () => {
    expect(normativCategory('Что-то совершенно нетипичное')).toBe(
      NORMATIV_FALLBACK_CATEGORY,
    );
  });
});

describe('normativNumber', () => {
  it('извлекает номер СП для числовой сортировки', () => {
    expect(normativNumber('СП 9.13130.2009')).toBe(9);
    expect(normativNumber('СП 48.13330.2019')).toBe(48);
    expect(normativNumber('СП 428.1325800.2018')).toBe(428);
    // мусор — в конец списка
    expect(normativNumber('ГОСТ 12345')).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('getAllNormativDocs', () => {
  it('читает реестр, отдаёт только published и сортирует по номеру', async () => {
    const docs = await getAllNormativDocs();
    // реестр генерируется tools/publish.py из mdTOhtmlBuild
    expect(docs.length).toBeGreaterThan(300);
    const sp48 = docs.find((d) => d.designation === 'СП 48.13330.2019');
    expect(sp48?.slug).toBe('sp-48-13330-2019');
    const numbers = docs.map((d) => d.designation);
    const idx9 = numbers.findIndex((d) => d.startsWith('СП 9.'));
    const idx48 = numbers.indexOf('СП 48.13330.2019');
    if (idx9 !== -1) expect(idx9).toBeLessThan(idx48);
  });
});
