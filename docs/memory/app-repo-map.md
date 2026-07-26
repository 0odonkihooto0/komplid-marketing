---
name: app-repo-map
description: Где лежит основное приложение и как в нём ориентироваться при сверке фактов
metadata:
  type: reference
---

Приложение app.komplid.ru — `C:\Komplid2copy`, сам Next.js-проект в подпапке `stroydocs\`.
Отдельный репозиторий, из маркетинга **не править** (CLAUDE.md §9), только читать для сверки.

Полезные точки входа при проверке фактов для сайта:
- `stroydocs\src\lib\ui\object-modules.ts` — состав модулей
- `stroydocs\prisma\seeds\subscription-plans.ts` — тарифы и лимиты
- `ROADMAP.md` — обратно-хронологический лог «Добавлено (дата) ✅», лучший источник
  о том, что реально поставлено
- `docs\stack.md` — стек и хостинг · `docs\minstroy-integration-plan.md` — статус XSD-схем

**Внутреннее имя проекта — StroyDocs**, наружу оно попадать не должно (`BRAND_STRATEGY.md` §4.4).
Реквизиты ИП в коде приложения отсутствуют — только env-плейсхолдеры, реальные ФИО/ОГРНИП/ИНН
спрашивать у владельца, не угадывать.

См. также [[app-module-list]], [[app-feature-reality]], [[app-plans-and-prices]].
