import { describe, it, expect } from 'vitest';
import { readPublicImage } from './public-image';

describe('readPublicImage', () => {
  it('читает размеры настоящего PNG из public', () => {
    expect(readPublicImage('icons/icon-192.png')).toEqual({
      src: '/icons/icon-192.png',
      width: 192,
      height: 192,
    });
  });

  it('ведущий слэш в пути не мешает', () => {
    expect(readPublicImage('/icons/icon-512.png')?.src).toBe('/icons/icon-512.png');
  });

  it('отсутствующий файл — null, а не исключение', () => {
    expect(readPublicImage('images/home/nothing-here.png')).toBeNull();
  });

  it('не-PNG отвергается: размеры из него не прочитать', () => {
    expect(readPublicImage('brand/komplid-mark.svg')).toBeNull();
  });
});
