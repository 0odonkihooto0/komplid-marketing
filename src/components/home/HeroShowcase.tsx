import { Smartphone, Monitor } from 'lucide-react';
import { readPublicImage } from '@/lib/public-image';
import { HeroShot } from './HeroShot';

/** Ширина карточки телефона — как в эталоне. */
const PHONE_WIDTH = 184;
/** Снимок веба показывается в натуральную величину и уезжает за правый край. */
const WEB_WIDTH = 1400;

function ColumnLabel({
  icon: Icon,
  text,
  className,
}: {
  icon: typeof Smartphone;
  text: string;
  className?: string;
}) {
  return (
    // Раскладка подписи — классом, а не инлайном: инлайновый display перебил бы
    // правило, которое прячет колонку телефона на узком экране.
    <div className={className ? `hero-showcase__label ${className}` : 'hero-showcase__label'}>
      <Icon size={13} style={{ flex: 'none', color: 'var(--acc)' }} />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--t3)',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
      <span style={{ flex: 1, height: 1, background: 'var(--line2)' }} />
    </div>
  );
}

/**
 * Правая часть первого экрана: два снимка живого приложения — мобильный экран
 * с офлайн-очередью и веб-обзор договора. Веб-снимок намеренно шире своей колонки
 * и уходит за правый край окна: так видно, что интерфейс продолжается.
 *
 * Блок декоративный по смыслу, но подписи в нём осмысленные, поэтому целиком
 * от скринридеров не прячем — у снимков есть alt.
 */
export function HeroShowcase() {
  const phone = readPublicImage('images/home/hero-phone.png');
  const web = readPublicImage('images/home/hero-web.png');

  return (
    <div className="hero-showcase">
      <ColumnLabel icon={Smartphone} text="мобильный" className="hero-showcase__label--phone" />
      <ColumnLabel icon={Monitor} text="веб · контур объекта" />

      <div className="hero-showcase__phone">
        <div
          className="anim-rise"
          style={{
            width: PHONE_WIDTH,
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 26px 60px var(--shadow)',
            animationDelay: '0.15s',
          }}
        >
          <HeroShot
            image={phone}
            alt="Мобильное приложение «Комплид»: список дел на день и очередь действий без сети"
            width={PHONE_WIDTH}
            fallbackRatio={2.1}
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            lineHeight: 1.5,
            letterSpacing: '0.05em',
            color: 'var(--t4)',
          }}
        >
          <span
            className="anim-pulse"
            style={{
              flex: 'none',
              marginTop: 5,
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--acc)',
            }}
          />
          без связи · 4 действия ждут отправки
        </div>
      </div>

      <div className="hero-showcase__web">
        <div className="browser-frame">
          <div className="browser-frame__bar">
            <span className="browser-frame__dot" />
            <span className="browser-frame__dot" />
            <span className="browser-frame__dot" />
            <span className="browser-frame__url">
              komplid.ru / ЖК «Северный» корпус 2 / договор №2 · обзор
            </span>
          </div>
          <div className="browser-frame__viewport">
            <div className="browser-frame__shot">
              <HeroShot
                image={web}
                alt="Обзор договора в «Комплид»: работы, документы, финансы и лента событий"
                width={WEB_WIDTH}
                fallbackRatio={0.56}
                priority
              />
            </div>
            {/* Полоса сканера — подсказка, что снимок живой, а не картинка в рамке */}
            <div
              className="anim-scan"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 64,
                background: 'linear-gradient(var(--glow1), transparent)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        <div className="hero-callout anim-rise" style={{ animationDelay: '0.25s' }}>
          <span
            className="anim-pulse"
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--acc)' }}
          />
          <span>21 модуль объекта</span>
        </div>
      </div>
    </div>
  );
}
