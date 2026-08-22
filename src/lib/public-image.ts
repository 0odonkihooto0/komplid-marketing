import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface PublicImage {
  /** Адрес для next/image — от корня сайта */
  src: string;
  width: number;
  height: number;
}

/** Сигнатура PNG — восемь байт в начале файла. */
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Размеры PNG из папки public — читаются на сборке, а не в браузере.
 *
 * Зачем: снимки интерфейса на главную кладёт владелец, и до этого момента файлов
 * в репозитории нет. next/image требует width и height, поэтому без такой проверки
 * пришлось бы либо захардкодить размеры (и исказить картинку, если реальные другие),
 * либо получить битую картинку на первом экране. Функция возвращает null, если файла
 * нет или это не PNG, — вызывающий код рисует плейсхолдер и вёрстка остаётся целой.
 *
 * Разбирается только заголовок IHDR: он всегда идёт первым чанком, ширина и высота
 * лежат по смещениям 16 и 20 как big-endian uint32.
 */
export function readPublicImage(relativePath: string): PublicImage | null {
  const file = path.join(process.cwd(), 'public', relativePath);

  let head: Buffer;
  try {
    head = readFileSync(file).subarray(0, 24);
  } catch {
    return null;
  }

  if (head.length < 24 || !head.subarray(0, 8).equals(PNG_SIGNATURE)) return null;

  const width = head.readUInt32BE(16);
  const height = head.readUInt32BE(20);
  if (width === 0 || height === 0) return null;

  return { src: `/${relativePath.replace(/^\/+/, '')}`, width, height };
}
