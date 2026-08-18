import { describe, it, expect } from 'vitest';
import { envOr } from './env';

describe('envOr', () => {
  it('берёт значение переменной, когда она заполнена', () => {
    expect(envOr('/data', '/fallback')).toBe('/data');
  });

  it('пустая строка не побеждает значение по умолчанию', () => {
    // главный случай: .env.local копируется с .env.example, где ключи пустые.
    // С оператором ?? сюда приезжала пустая строка, mkdir('') падал,
    // и /api/lead отдавал 500 на каждую заявку
    expect(envOr('', '/fallback')).toBe('/fallback');
  });

  it('пробелы считаются незаполненным значением', () => {
    expect(envOr('   ', '/fallback')).toBe('/fallback');
  });

  it('отсутствующая переменная даёт значение по умолчанию', () => {
    expect(envOr(undefined, '/fallback')).toBe('/fallback');
  });

  it('обрезает пробелы по краям — путь с хвостовым пробелом ломает mkdir', () => {
    expect(envOr('  /data  ', '/fallback')).toBe('/data');
  });
});
