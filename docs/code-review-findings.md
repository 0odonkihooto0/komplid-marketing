# Code Review Findings — 2026-05-05

Проверка 16 гипотез о потенциальных проблемах в коде `komplid-marketing`.
Ветка: `claude/review-docs-fix-imports-qhSLj`.

---

## Итог

| Статус | Количество |
|--------|-----------|
| ✅ Исправлено | 5 |
| ❌ Ложное срабатывание | 11 |

---

## ✅ Подтверждённые и исправленные проблемы

### 1. Неиспользуемый импорт `Link`
**Файл:** `src/components/smetchik/SmetchikPricing.tsx:4`  
**Описание:** `import Link from 'next/link'` присутствовал, но не использовался — компонент использует `<a>` теги напрямую.  
**Исправление:** Импорт удалён.

---

### 2. API newsletter возвращал 200 при отсутствии конфига
**Файл:** `src/app/api/newsletter/route.ts:32`  
**Описание:** При отсутствии `INTERNAL_API_URL` или `INTERNAL_API_TOKEN` эндпоинт возвращал `200 OK { success: true }`, хотя подписка фактически не была передана в основное приложение. Это приводило к молчаливой потере подписок пользователей.  
**Исправление:** Изменён на `500` с сообщением `{ error: 'API not configured' }` и `console.error` вместо `console.warn`.

---

### 3. Пустой catch-блок в template-download API
**Файл:** `src/app/api/template-download/route.ts:44`  
**Описание:** Fire-and-forget запрос отправки лида в основное приложение имел `.catch(() => {})`, который полностью заглушал ошибки сети и API. При сбое отправки лид терялся без какого-либо следа в логах.  
**Исправление:** Добавлено `console.error('[api/template-download] lead dispatch failed:', err)`.

---

### 4. N+1 последовательный I/O в `shablony.ts`
**Файл:** `src/content-loader/shablony.ts:36-44`  
**Описание:** `getAllTemplates()` читал файлы последовательно в цикле `for...of` с `await fs.readFile`. При N шаблонах это N последовательных дисковых операций вместо параллельных. При SSG-сборке замедляло генерацию страниц.  
**Исправление:** Заменён цикл на `await Promise.all(mdxFiles.map(...))` — все файлы читаются параллельно.

---

### 5. N+1 последовательный I/O в `blog.ts`
**Файл:** `src/content-loader/blog.ts:37-45`  
**Описание:** Аналогичный антипаттерн в `getAllBlogPosts()`. При росте контента до 150+ статей (цель Фазы 7) это значительно замедлило бы SSG-сборку.  
**Исправление:** Заменён цикл на `await Promise.all(mdxFiles.map(...))`.

---

## ❌ Ложные срабатывания

### 6. `VariantProps` в `button.tsx`
**Файл:** `src/components/ui/button.tsx:3`  
**Статус:** ❌ Ложное. `VariantProps` используется в интерфейсе `ButtonProps` как `VariantProps<typeof buttonVariants>`.

---

### 7. `VariantProps` в `badge.tsx`
**Файл:** `src/components/ui/badge.tsx:2`  
**Статус:** ❌ Ложное. `VariantProps` используется в `BadgeProps` как `VariantProps<typeof badgeVariants>`.

---

### 8. `CalculatorMeta` в `kalkulyator/page.tsx`
**Файл:** `src/app/kalkulyator/page.tsx:5`  
**Статус:** ❌ Ложное. Тип используется в `Record<CalculatorMeta['slug'], ...>` и параметре компонента `{ calc: CalculatorMeta }`.

---

### 9. `FormEvent` и `ChangeEvent` в `TemplateDownloadForm.tsx`
**Файл:** `src/components/forms/TemplateDownloadForm.tsx:3`  
**Статус:** ❌ Ложное. `FormEvent` используется в `handleSubmit(e: FormEvent<HTMLFormElement>)`, `ChangeEvent` — в onChange-обработчиках.

---

### 10. `ClassValue` в `utils.ts`
**Файл:** `src/lib/utils.ts:1`  
**Статус:** ❌ Ложное. Используется в сигнатуре `cn(...inputs: ClassValue[])`.

---

### 11. `TemplateFrontmatter` в `shablony/page.tsx`
**Файл:** `src/app/shablony/page.tsx:4`  
**Статус:** ❌ Ложное. Используется в `Map<string, TemplateFrontmatter[]>` и типе параметра компонента `TemplateCard`.

---

### 12. Тест для `extract-faq.ts`
**Файл:** `src/lib/extract-faq.ts`  
**Статус:** ❌ Не актуально сейчас. В проекте нет тестовой инфраструктуры (jest/vitest). Добавление тестов — отдельная задача, требующая настройки окружения.

---

### 13. Тест для `utils.ts`
**Файл:** `src/lib/utils.ts`  
**Статус:** ❌ Аналогично п.12. `cn()` — тривиальная обёртка над `clsx` + `tailwind-merge`, тесты оправданы только после настройки тестового окружения.

---

### 14. «Слишком много параметров» в `Cta.tsx`
**Файл:** `src/components/blocks/Cta.tsx:22`  
**Статус:** ❌ Ложное для React. Компонент принимает один объект `CtaProps` и деструктурирует его — это идиоматичный React-паттерн, не нарушение.

---

### 15. «Слишком много параметров» в `SoftwareAppSchema.tsx`
**Файл:** `src/components/seo/SoftwareAppSchema.tsx:18`  
**Статус:** ❌ Ложное. Аналогично п.14 — один объект `Props`.

---

### 16. «Слишком много параметров» в `Hero.tsx`
**Файл:** `src/components/blocks/Hero.tsx:18`  
**Статус:** ❌ Ложное. Аналогично п.14 — один объект `HeroProps`.
