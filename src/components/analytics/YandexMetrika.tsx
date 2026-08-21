'use client';

import Script from 'next/script';

/**
 * Счётчик Яндекс.Метрики. ID берётся из NEXT_PUBLIC_YANDEX_METRIKA_ID и
 * вмерзает в бандл на сборке — на App Platform переменная должна быть задана
 * до запуска сборки, иначе счётчика на странице не будет и потребуется пересбор.
 *
 * Разметка — по сниппету из кабинета счётчика (2026):
 * ID передаётся в адресе tag.js, а не только в ym(...init).
 * ssr:true обязателен для Next.js: без него при серверном рендеринге первый
 * просмотр считается по адресу, который счётчик видит в момент инициализации,
 * и переходы внутри приложения дублируются.
 *
 * ecommerce из кабинетного сниппета убран намеренно: на маркетинг-сайте нет
 * корзины и window.dataLayer, слушать нечего. Вернуть, когда появится оплата.
 */
export function YandexMetrika() {
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!counterId) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${counterId}", "ym");
          ym(${counterId}, "init", {
            ssr: true,
            webvisor: true,
            clickmap: true,
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce: true,
            trackLinks: true
          });
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${counterId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
