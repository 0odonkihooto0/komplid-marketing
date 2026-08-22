import Image from 'next/image';
import type { PublicImage } from '@/lib/public-image';

interface HeroShotProps {
  /** Результат readPublicImage: null, если файла ещё нет в репозитории */
  image: PublicImage | null;
  alt: string;
  /** Ширина отрисовки. Снимок показывается в этом масштабе, а не вписывается в блок. */
  width: number;
  /** Во сколько раз плейсхолдер выше своей ширины, пока снимка нет */
  fallbackRatio: number;
  priority?: boolean;
}

/**
 * Снимок интерфейса на первом экране — или штриховка вместо него.
 *
 * Снимки кладёт владелец, и до этого момента файлов в репозитории нет. Вместо
 * битой картинки на самом видном месте показываем заштрихованную заглушку тех же
 * пропорций: геометрия героя остаётся проверяемой, а после появления PNG ничего
 * править не нужно — размеры компонент берёт из самого файла.
 */
export function HeroShot({ image, alt, width, fallbackRatio, priority }: HeroShotProps) {
  // Ширина едет через переменную, а не числом в style: инлайновое значение
  // перебило бы медиазапрос, и на узком экране снимок остался бы обрезанным.
  const sizing = {
    '--shot-w': `${width}px`,
    width: 'var(--shot-w)',
  } as React.CSSProperties;

  if (!image) {
    return (
      <div
        aria-hidden="true"
        style={{
          ...sizing,
          aspectRatio: `1 / ${fallbackRatio}`,
          backgroundImage:
            'repeating-linear-gradient(135deg, var(--hatchA) 0 6px, var(--hatchB) 6px 12px)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--t4)',
          }}
        >
          снимок интерфейса
        </span>
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      priority={priority}
      // height: auto обязателен рядом с заданной шириной — иначе снимок исказится
      style={{ ...sizing, height: 'auto', display: 'block' }}
    />
  );
}
