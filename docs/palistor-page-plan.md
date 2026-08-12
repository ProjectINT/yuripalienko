# Страница `/palistor` — план внедрения

**Что делаем:** отдельную посадочную страницу о фреймворке Palistor на `palisoft.ru/{ru,en}/palistor` — сжатая версия README из `github.com/ProjectINT/palistor`, с красиво оформленными примерами кода, полными метаданными, структурированными данными и перелинковкой.

**Дата плана:** 2026-08-13 · **Решения владельца внесены:** 2026-08-13 (§15) · **Основа:** `docs/seo-plan.md` (решения Q1–Q9), `README.md` / `README.ru.md` из репозитория palistor.

**Статус: реализовано 2026-08-13.** Все шаги §13 выполнены, кроме нулевого (замер бандла — колонки `First Load JS` в Next 16 с Turbopack больше нет). Машинная часть чек-листа §14 пройдена; открытыми остались три пункта, которым нужен браузер или живой носитель языка, — они помечены там же.

**Сквозное требование:** всё, что видит посетитель, существует в **обеих локалях** — включая комментарии внутри примеров кода, подписи блоков, `alt` картинок и `og:image:alt`. Реестр всех строк и точки, где двуязычность обычно теряется, — в §12.

---

## 0. Что уже проверено (факты, а не предположения)

| Факт | Значение | Откуда |
|---|---|---|
| Репозиторий | `github.com/ProjectINT/palistor`, MIT, default branch `main` | GitHub API |
| Описание репозитория | «MVVM framework for React. Split frontend to clean layers» | GitHub API |
| Демо / homepage | `https://projectint.github.io/palistor/` → 200 | проверено curl |
| npm | пакет `palistor`, latest `0.0.31` (2026-07-16), MIT, peer `react ^19` | registry.npmjs.org |
| npm keywords | mvvm, state-management, ai-friendly, forms, wizard, react, state, form-state, reactive | registry.npmjs.org |
| Второе имя пакета | `@projectint/palistor` в GitHub Packages (канонично — `palistor`) | README |
| README | есть **обе** локали: `README.md` (EN) и `README.ru.md` (RU), ~1095 строк каждая | скачаны |
| Скриншот | `public/works/palistor-1.webp` 1600×900 + `cards/palistor-1.webp` 800×450 — **уже в репо** | распакован VP8-заголовок |
| Упоминания в контенте | `works.json` (slug `palistor`), `site.json` (highlights), `about.json`, `cv.json`, `articles.json` (3 статьи про Palistor) | grep |
| Типизированные роуты | `PageProps<'/[lang]/…'>` генерируется Next в `.next/types/routes.d.ts` | прочитан файл |

**Важная находка:** в `content/{ru,en}/works.json` у элемента `palistor` поле `url` = `https://github.com/ProjectINT` — это профиль пользователя, а не репозиторий. То же у `paliproxy`. Оба репозитория существуют (`/palistor`, `/paliproxy` → 200). Это баг, чиним попутно.

---

## 1. Ключевые архитектурные решения

### 1.1. Роут: `app/[lang]/palistor/page.tsx`

Сайт целиком живёт под `/[lang]/`, поэтому «страница `/palistor`» физически — это `/ru/palistor` и `/en/palistor`.

Голый `/palistor` при этом **работает без единой строчки кода**: matcher в [proxy.ts:22](../proxy.ts#L22) — `/((?!_next|.*\..*).*)` — ловит путь без точки, `pickLocale` разбирает `Accept-Language`, и запрос уходит 307-редиректом на `/en/palistor` (или `/ru/palistor`). Проверить это — пункт чек-листа, менять — ничего.

### 1.2. Конфликт с будущими страницами проектов (P1-3 из seo-plan)

`docs/seo-plan.md` §P1-3 планирует `/{lang}/works/[slug]` для всех 11 проектов — включая slug `palistor`. Если оба роута появятся, получим два URL с одним содержимым и каннибализацию.

**Решение:** `/palistor` — канонический URL бренда (короткий, под брендовый запрос `palistor` из кластера C-en). Когда дойдут руки до `works/[slug]`:

- либо исключить `palistor` из `generateStaticParams` этого роута,
- либо отдать с него 301 на `/{lang}/palistor` через `redirects()` в `next.config.ts`.

Записать это решение комментарием прямо в `app/[lang]/palistor/page.tsx`, чтобы через полгода не переоткрывать вопрос.

### 1.3. Контент — по существующей схеме, без исключений

Ровно тот же конвейер, что у остальных шести страниц: типизированный JSON на локаль → загрузчик в `lib/content.ts` → страница читает через геттер. Никакого MDX, никакого fetch с GitHub на сборке (внешняя сеть в билде = хрупкий Docker-билд).

```
types/content.ts          PalistorContent
content/ru/palistor.json  русский текст (источник — README.ru.md)
content/en/palistor.json  английский текст (источник — README.md)
lib/content.ts            getPalistor(lang)
```

### 1.4. Объём: ~700–900 слов, не перевод README

Пользовательское требование — «только короче, не так много». Плюс это же снимает реальный SEO-риск: README целиком опубликован на `github.com` **и** на `projectint.github.io` — третья копия того же текста на `palisoft.ru` даст near-duplicate между тремя доменами, где наш — самый слабый по авторитету.

**Правило:** страница — самостоятельный пересказ (позиционирование → 3 слоя → быстрый старт → возможности → границы применимости → ссылки), а не выжимка копипастой. Дословно переносим только примеры кода: их дублирование нормально и неизбежно.

---

## 2. Полный список файлов

### Новые (7)

| Файл | Назначение |
|---|---|
| `app/[lang]/palistor/page.tsx` | сама страница + `generateMetadata` |
| `lib/highlight.ts` | highlighter-синглтон: три языка, одна тема (§5) |
| `app/[lang]/palistor/opengraph-image.tsx` | OG-картинка 1200×630 через `lib/og.tsx`, **с локализованным `og:image:alt`** (§6) |
| `content/ru/palistor.json` | русский контент |
| `content/en/palistor.json` | английский контент |
| `components/ui/CodeBlock.tsx` | серверный блок кода (подсветка) |
| `components/ui/CopyButton.tsx` | `'use client'`, копирование в буфер; подписи приходят пропсами из контента |
| `components/ui/SmartLink.tsx` | внутренняя ссылка → `next/link`, внешняя → `ExternalLink` (§9.2, §9.4) |

### Изменяемые (11)

| Файл | Изменение |
|---|---|
| `types/content.ts` | `+ PalistorContent` и вложенные интерфейсы; `WorkItem` `+ page?: string \| null` |
| `lib/content.ts` | импорт двух JSON + `getPalistor` |
| `lib/schema.ts` | `+ palistorGraph()`, `+ faqPage()`, `+ PALISTOR_ID` |
| `app/sitemap.ts` | `+ { path: '/palistor', priority: 0.8, changeFrequency: 'monthly' }` |
| `content/{ru,en}/nav.json` | пункт «Palistor» последним, `index: "07"` — перенумерация не нужна |
| `content/{ru,en}/works.json` | чиним `url` у `palistor`/`paliproxy`; `+ "page": "/palistor"` |
| `content/{ru,en}/site.json` | highlights: ссылка Palistor → внутренняя `/palistor` |
| `content/{ru,en}/about.json` | `+ links[]` на `/palistor` |
| `app/[lang]/page.tsx` | highlights через `SmartLink` |
| `app/[lang]/about/page.tsx` | `links` через `SmartLink` |
| `components/works/WorkCard.tsx` | рендер внутренней ссылки «Подробнее →» при наличии `item.page` |

**Не трогаем:** `app/robots.ts` (правила общие, sitemap подтянет новый URL сам), `app/manifest.ts`, `proxy.ts`, `next.config.ts`, `app/[lang]/layout.tsx`.

---

## 3. Контент-модель

```ts
// types/content.ts
export interface PalistorLink {
  label: string
  url: string
  /** primary — выводится в верхнем ряду ссылок крупно */
  primary: boolean
}

export interface PalistorLayer {
  /** «01» / «02» / «03» — мононумерация в стиле nav */
  index: string
  title: string
  text: string
  code: PalistorCode | null   // у слоя Model примера нет — только текст
}

export interface PalistorCode {
  /** ключ для подсветки: 'ts' | 'tsx' | 'bash' */
  lang: string
  /** подпись над блоком: «ViewModel по MVVM» */
  caption: string
  /**
   * Код целиком, включая комментарии. Локализуется вместе с остальным JSON:
   * в README.md — «// getPhone is already the data layer»,
   * в README.ru.md — «// getPhone это уже слой данных».
   */
  code: string
}

export interface PalistorStep {
  index: string
  title: string
  text: string
  code: PalistorCode
}

export interface PalistorContent {
  title: string             // «Palistor»
  intro: string             // одна строка под h1
  seoTitle: string          // 50–60 символов
  seoDescription: string    // 140–160 символов
  /** alt для og:image — не берётся из intro, там своя длина и смысл */
  ogAlt: string
  /** «MIT · React 19 · TypeScript» — мета-строка под заголовком */
  meta: string[]
  links: PalistorLink[]     // Demo, GitHub, npm
  screenshotAlt: string

  /** «В продакшене: pali.rent, kvartly.com» — плашка доверия под ссылками */
  usedInTitle: string
  usedIn: { title: string; url: string; note: string }[]

  /** подписи кнопки копирования — иначе единственные хардкод-строки на странице */
  copyLabel: string         // «Копировать» / «Copy»
  copiedLabel: string       // «Скопировано» / «Copied»

  layersTitle: string
  layersLead: string
  layers: PalistorLayer[]           // 3 штуки

  startTitle: string
  install: PalistorCode             // npm i palistor
  steps: PalistorStep[]             // 2 шага: конфиг + компонент

  featuresTitle: string
  features: { term: string; text: string }[]   // 8 из 12 строк таблицы README

  fitTitle: string
  fit: string[]                     // «для чего» — 5 пунктов
  unfitTitle: string
  unfit: string[]                   // «для чего не подходит» — 4 пункта

  demoTitle: string
  demoLead: string
  demo: { label: string; url: string; note: string }[]   // 5 deep-ссылок на табы

  faqTitle: string
  faq: { q: string; a: string }[]   // 4–5 вопросов, идут в FAQPage JSON-LD

  ctaText: string
  ctaLabel: string                  // → /{lang}/contacts
  docsLabel: string                 // → README на GitHub
}
```

**Источник текстов:** RU — `README.ru.md`, EN — `README.md`. Обе локали пишутся руками автора README, а не машинным переводом: оригиналы уже двуязычные, стилистика сохранится.

**Жёсткое правило структуры:** `content/ru/palistor.json` и `content/en/palistor.json` имеют **идентичный набор ключей и одинаковую длину всех массивов**. Если в EN пять пунктов `fit` — в RU ровно пять. Иначе одна из локалей молча теряет блок: TypeScript типизирует форму, но не следит за длиной массивов между файлами. Пункт чек-листа §14 проверяет это машинно.

**Что режем из README (12 разделов → 6 секций):** API reference, ConfigNode, Async resolvers, Lists & entities, Flows, Field mapping, Persist, i18n, Notifications, Store context, TypeScript. Всё это — документация, её место в README; на странице от каждого остаётся строка в таблице возможностей и ссылка на соответствующий таб демо.

---

## 4. Структура страницы

Одна `<h1>`, дальше `<h2>` на секцию, `<h3>` внутри — как на остальных страницах. У каждой секции `id` для якорей: якоря помогают passage-индексации и дают точки для перелинковки из статей.

```
PageShell (space-y-16)
├─ JsonLd × 3          breadcrumbs · palistorGraph · faqPage
├─ PageHeader          h1 «Palistor» + intro
├─ мета-строка         MIT · React 19 · TypeScript   (font-mono text-xs uppercase)
├─ ряд ссылок          Демо ↗ · GitHub ↗ · npm ↗     (primary — рамкой, остальные текстом)
├─ #used   «В продакшене» — pali.rent · kvartly.com, обе ссылки внешние
│                       (короткая плашка, 2 строки — главный аргумент доверия, §11)
├─ <Image>             palistor-1.webp 1600×900, priority (LCP), осмысленный alt
│
├─ #layers   h2  «Три слоя»
│    3 блока: 01 View / 02 ViewModel (конфиг) / 03 Model (данные)
│    у 01 и 02 — CodeBlock; у 03 только текст
│
├─ #start    h2  «Быстрый старт»
│    CodeBlock bash (npm i palistor)
│    01 «Опишите форму»   → CodeBlock ts
│    02 «Подключите компонент» → CodeBlock tsx
│
├─ #features h2  «Возможности»
│    <dl> из 8 пар: granular re-renders, computed state, proxy API,
│    submit pipeline, async resolvers, lists & entities, flows, persist
│    сетка sm:grid-cols-2, dt — font-medium, dd — text-muted
│
├─ #fit      h2  «Где применять» + «Где не стоит»
│    две колонки lg:grid-cols-2, списки в стиле pricing (тире + текст)
│
├─ #demo     h2  «Живое демо»
│    5 deep-ссылок на табы (#form / #flow / #lists / #async / #mapping)
│
├─ #faq      h2  «Коротко о главном»  — 4–5 Q/A, размечены FAQPage
│
└─ CTA       «Обсудить проект →» /{lang}/contacts  +  «Полная документация ↗» GitHub
```

Все примитивы уже есть: `PageShell`, `PageHeader`, `Card`, `Tag`, `ExternalLink`, `PeriodText`. Новых стилей практически не потребуется — только `CodeBlock`.

---

## 5. Примеры кода — как сделать красиво

Требование «как примеры вставить красиво» — единственное место, где нужен новый инструмент.

### Рекомендация: Shiki, подсветка на этапе сборки

```bash
pnpm add -D shiki
```

```tsx
// components/ui/CodeBlock.tsx — серверный компонент, никакого 'use client'
import { highlight } from '@/lib/highlight'   // точечный highlighter, см. ниже
import CopyButton from './CopyButton'

export default async function CodeBlock({
  block,
  copyLabel,
  copiedLabel,
}: {
  block: PalistorCode
  copyLabel: string     // подписи приходят из локализованного контента,
  copiedLabel: string   // а не хардкодятся внутри компонента
}) {
  const html = await highlight(block.code, block.lang)
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
        {block.caption}
      </figcaption>
      <div className="relative rounded-lg border border-line bg-line/20">
        <CopyButton code={block.code} label={copyLabel} copiedLabel={copiedLabel} />
        {/* shiki отдаёт готовый <pre><code>; overflow-x-auto — обязателен для мобилы.
            dangerouslySetInnerHTML безопасен: вход — литералы из нашего JSON. */}
        <div
          className="overflow-x-auto p-4 text-sm [&_pre]:bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </figure>
  )
}
```

`lib/highlight.ts` — тонкая обёртка: создаёт highlighter один раз на процесс сборки (модульный синглтон), знает ровно три языка и одну тему. Так три десятка блоков кода на странице не пересоздают движок тридцать раз.

**Почему Shiki, а не подсветка на клиенте:**

- Все страницы SSG → `codeToHtml` выполняется на сборке, в статический HTML впекается готовая разметка. **Клиентского JS — ноль**, LCP/TBT не страдают.
- Краулер и AI-бот видят текст кода в HTML, а не пустой `<div>`, который заполнит скрипт.
- `devDependency`, а не `dependency`: в рантайм-образ (`output: 'standalone'`) не попадает.
- Тема — тёмная и сдержанная (`vesper` / `github-dark-default`), чтобы не разругаться с монохромной палитрой сайта (`--color-bg #0a0a0a`, `--color-fg #f5f5f5`, `--color-muted #8a8a8a`). Финальный выбор темы — на глаз после первой сборки.

### Гарантия: бандл остальных страниц не меняется (ответ на вопрос владельца)

Три независимых механизма, каждый достаточен сам по себе:

1. **`CodeBlock` — серверный компонент** (нет `'use client'`, есть `async`). Серверные компоненты в клиентский бандл не попадают в принципе — ни на своей странице, ни тем более на чужих.
2. **Next бьёт бандлы по роутам.** `CodeBlock` импортируется **только** из `app/[lang]/palistor/page.tsx`. Даже если бы он был клиентским, его чанк попал бы в дерево одного роута — `/works` и `/pricing` его не увидят.
3. **`shiki` в `devDependencies`.** Многостадийный `Dockerfile` ставит dev-зависимости на стадии сборки, а в финальный образ копирует только `.next/standalone` — `node_modules/shiki` туда не едет.

Единственный **клиентский** код на странице — `CopyButton` (~15 строк, `useState` + `navigator.clipboard`). Он тоже живёт только в дереве `/palistor`.

Отдельный нюанс, который стоит сделать сразу: `import { codeToHtml } from 'shiki'` подтягивает **все** грамматики и темы (десятки мегабайт исходников на стадии сборки). На вес клиента это не влияет, но замедляет билд и раздувает серверный чанк роута. Поэтому — точечный импорт: движок + ровно три языка (`ts`, `tsx`, `bash`) + одна тема, через `createHighlighterCore` из `shiki/core` с JS-движком регулярок (без WASM). Точный вид импортов сверить с README установленной версии `shiki` перед реализацией — API этого слоя менялся между мажорами.

**Проверка, а не обещание** (в чек-листе §14): сравнить колонку `First Load JS` в выводе `pnpm build` до и после. У `/[lang]/works`, `/[lang]/pricing` и остальных цифра обязана остаться **байт в байт** прежней; у `/[lang]/palistor` — вырасти только на вес `CopyButton`.

**Альтернатива без зависимости:** обычный `<pre><code>` в `font-mono` с рамкой `border-line`, без цвета. Честно, аккуратно, но «красиво» — с натяжкой. Оставляю как запасной вариант, если сборка с Shiki чем-то не устроит.

**Обязательные требования к блокам в любом случае:**

- `overflow-x-auto` на обёртке — иначе длинные строки ломают вёрстку на телефоне;
- `<figure>` + `<figcaption>` для подписи («ViewModel по MVVM» / «ViewModel declaration in MVVM terms») — семантика, а не `<div>`; подпись берётся из контента, значит переводится;
- кнопка «копировать» — единственный клиентский компонент на странице, ~15 строк; **обе её подписи приходят пропсами из локализованного JSON**, внутри компонента строк нет;
- `dangerouslySetInnerHTML` здесь безопасен: вход — литералы из нашего JSON, не пользовательский ввод. Пометить комментарием.

---

## 6. Метаданные

```ts
export async function generateMetadata({ params }: PageProps<'/[lang]/palistor'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const palistor = getPalistor(lang)
  return metaFor(lang, '/palistor', palistor.seoTitle, palistor.seoDescription)
}
```

`metaFor` из [lib/seo.ts:45](../lib/seo.ts#L45) закрывает разом всё, из-за отсутствия чего в seo-plan горели P0-2/P0-3/P0-4:

- self-canonical `/{lang}/palistor` (без него страница канонизируется на главную — наследование `alternates` в Next);
- hreflang `ru` + `en` + `x-default` → `/en/palistor`;
- Open Graph (`type`, `url`, `title`, `description`, `siteName`, `locale`, `alternateLocale`) и Twitter `summary_large_image`;
- `robots` под рубильником `ALLOW_INDEXING`.

**Черновик title/description** (уложиться в 50–60 / 140–160 символов):

| | RU | EN |
|---|---|---|
| `seoTitle` | `Palistor — MVVM-фреймворк для React \| Palisoft` | `Palistor — MVVM Framework for React \| Palisoft` |
| `seoDescription` | «Открытый MVVM-фреймворк для React: формы, списки, мастера. Точечные ре-рендеры, конфиг вместо useEffect. В продакшене pali.rent и kvartly.com.» | «Open-source MVVM framework for React: forms, lists, wizards. Granular re-renders, config instead of useEffect. In production on pali.rent and kvartly.com.» |

Упоминание живых проектов прямо в `description` — не украшательство: у брендового запроса `palistor` в выдаче будут соперничать github.com, npmjs.com и наша страница. Единственное, чего нет у первых двух, — доказательство продакшен-использования. Это и есть причина кликнуть по нашей ссылке.

**OG-картинка** — `app/[lang]/palistor/opengraph-image.tsx`. Отличие от [works/opengraph-image.tsx](../app/%5Blang%5D/works/opengraph-image.tsx): там `alt` — статическая строка на обе локали, а нам нужен двуязычный. Статический `export const alt` этого не умеет, но `generateImageMetadata` **получает `params`** (проверено в `01-app/03-api-reference/04-functions/generate-image-metadata.md`), а значит, знает `lang`:

```tsx
export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const palistor = getPalistor(isLocale(params.lang) ? params.lang : DEFAULT_LOCALE)
  // id обязателен; при одной картинке достаточно постоянного значения
  return [{ id: 'og', alt: palistor.ogAlt, size: OG_SIZE, contentType: OG_CONTENT_TYPE }]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const palistor = getPalistor(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return ogImage(palistor.title, palistor.intro)
}
```

Сам рисунок (заголовок + подзаголовок внутри картинки) локализован в обоих вариантах — `ogImage` получает данные из `getPalistor(lang)`. `generateImageMetadata` добавляет к этому локализованный `og:image:alt`.

Next сам подставит картинку и в `og:image`, и в `twitter:image` — руками прописывать не нужно.

> Побочный эффект: URL картинки получает суффикс `id` (`…/opengraph-image-og?…`). На индексацию не влияет. Три существующие OG-картинки (`works`, `pricing`, `cv`) остаются со статическим `alt` — переводить их на тот же механизм имеет смысл, но это отдельная задача, в scope этой страницы не входит.

**Версию пакета на странице не показываем.** `0.0.31` протухнет через месяц после первого же релиза, а следить за синхронизацией никто не будет. Вместо неё — `npm i palistor` и ссылка на npm, где версия всегда актуальна. То же касается `softwareVersion` в JSON-LD (см. ниже).

---

## 7. Структурированные данные (JSON-LD)

Три блока `<script type="application/ld+json">` через существующий `components/seo/JsonLd.tsx` (он уже экранирует `<`).

### 7.1. `palistorGraph(lang, content)` — новая функция в `lib/schema.ts`

Основная сущность — **мультитип** `["SoftwareSourceCode", "SoftwareApplication"]`. Это валидный schema.org и ровно тот случай, для которого мультитип придуман: `SoftwareSourceCode` описывает репозиторий и язык, `SoftwareApplication` — устанавливаемый пакет (и только он даёт право на rich-result-сниппет).

```ts
const PALISTOR_ID = `${SITE_URL}/#palistor`

export function palistorGraph(lang: Locale, content: PalistorContent) {
  const url = urlFor(lang, '/palistor')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: content.seoTitle,
        description: content.seoDescription,
        inLanguage: lang,
        isPartOf: { '@id': WEBSITE_ID },   // уже есть в rootGraph
        about: { '@id': PALISTOR_ID },
        mainEntity: { '@id': PALISTOR_ID },
        primaryImageOfPage: `${SITE_URL}/works/palistor-1.webp`,
        // Продакшен-внедрения: связываем страницу с двумя живыми доменами.
        // Единственное подтверждаемое отличие от github.com и npmjs.com.
        mentions: content.usedIn.map((project) => ({
          '@type': 'WebSite',
          name: project.title,
          url: project.url,
        })),
      },
      {
        '@type': ['SoftwareSourceCode', 'SoftwareApplication'],
        '@id': PALISTOR_ID,
        name: 'Palistor',
        alternateName: '@projectint/palistor',
        description: content.seoDescription,
        url,                                                   // канон — наша страница
        codeRepository: 'https://github.com/ProjectINT/palistor',
        programmingLanguage: { '@type': 'ComputerLanguage', name: 'TypeScript' },
        runtimePlatform: 'React 19',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'JavaScript framework',
        operatingSystem: 'Any',
        license: 'https://spdx.org/licenses/MIT.html',
        author:     { '@id': PERSON_ID },   // связка с Person из rootGraph
        maintainer: { '@id': PERSON_ID },
        publisher:  { '@id': ORG_ID },
        keywords: 'mvvm, react, state management, forms, wizard, typescript, ai-friendly',
        screenshot: `${SITE_URL}/works/palistor-1.webp`,
        downloadUrl: 'https://www.npmjs.com/package/palistor',
        installUrl:  'https://www.npmjs.com/package/palistor',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
        sameAs: [
          'https://www.npmjs.com/package/palistor',
          'https://github.com/ProjectINT/palistor',
          'https://projectint.github.io/palistor/',
        ],
      },
    ],
  }
}
```

Смысл `author: { '@id': PERSON_ID }` — не украшение: это второе ребро графа к `Person`, который уже объявлен в `rootGraph` на каждой странице. Так «Yuri Palienko» связывается не только с работодателем и CV, но и с публичным open-source-артефактом, у которого есть независимые подтверждения на npm и GitHub. Ровно то, что собирает Knowledge Panel (Q6 из seo-plan).

`offers` с `price: 0` — единственный способ в schema.org сказать «бесплатно»; для `SoftwareApplication` Google требует либо `offers`, либо `aggregateRating`, иначе сущность считается неполной.

**Чего сознательно НЕ добавляем:**

- `softwareVersion` — протухнет (см. §6);
- `aggregateRating` / `review` — рейтингов нет, выдумывать нельзя: это прямое нарушение правил Google и повод под ручные санкции;
- `HowTo` — Google убрал этот тип из выдачи в сентябре 2023, разметка мертва.

### 7.2. `breadcrumbs(lang, '/palistor', content.title)`

Функция уже есть в [lib/schema.ts:66](../lib/schema.ts#L66), сайт двухуровневый — Главная → Palistor. Ничего писать не надо, только вызвать.

### 7.3. `faqPage(lang, '/palistor', content.faq)` — новая функция

```ts
export function faqPage(lang: Locale, path: string, items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: urlFor(lang, path),
    inLanguage: lang,
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
```

**Честная оценка:** с августа 2023 Google показывает FAQ-сниппеты только авторитетным гос- и медресурсам — визуального выигрыша в выдаче не будет. Разметку всё равно ставим, и вот почему: `app/robots.ts` осознанно пускает GPTBot, ClaudeBot, PerplexityBot и компанию (цитирование в AI-ответах названо каналом входящих обращений), а вопрос-ответная разметка — самый удобный для LLM формат извлечения фактов. Плюс FAQ-секция сама по себе добавляет 150–200 слов уникального текста.

Вопросы — 5 штук, **в обеих локалях с одинаковыми формулировками**:

| # | Вопрос | Суть ответа |
|---|---|---|
| 1 | Что такое Palistor? | Три слоя, конфиг вместо `useEffect`, MIT |
| 2 | Чем отличается от Redux / Zustand / React Hook Form? | Те решают состояние или формы по отдельности; Palistor задаёт архитектуру экрана целиком — поведение, данные и отображение разнесены |
| 3 | Используется ли в реальных проектах? | **Да: pali.rent и kvartly.com в продакшене** |
| 4 | Почему это удобно для генерации кода AI? | AI плохо архитектурит, но отлично заполняет декларативные слоты; ревьюить нужно один плоский объект вместо дерева хуков |
| 5 | Какая лицензия и как поставить? | MIT, `npm i palistor`, peer-зависимость `react ^19` |

**Про тон вопроса №3 (решение владельца, §15.3).** Palistor работает в продакшене pali.rent и kvartly.com — это самый сильный аргумент страницы, и подавать его надо прямо, не прячась за словом «экспериментальный». Оба проекта уже есть в `works.json` и на `/works`, оба открыты по ссылке — заявление проверяемое, а не маркетинговое.

Но: `0.0.31` на npm и 2 звезды на GitHub видны за пять секунд. Формулировка не должна создавать впечатление зрелой экосистемы с комьюнити — иначе разработчик, пришедший из выдачи, поймает расхождение и потеряет доверие уже ко всей странице. Рабочая рамка: **«обкатан в продакшене автора, публичный API ещё уплотняется — версии 0.0.x»**. Это одновременно и сильное утверждение, и честное. Слово «экспериментальный» не используем ни в одной локали.

То же — в `intro` под `h1` и в плашке «В продакшене» (§4).

---

## 8. Sitemap

Одна строка в `ROUTES` в [app/sitemap.ts:5](../app/sitemap.ts#L5):

```ts
{ path: '/palistor', priority: 0.8, changeFrequency: 'monthly' as const },
```

Ставить после `/cv` — приоритет 0.8 наравне с ним: страница важнее `/about` (0.7), но ниже коммерческих `/works` и `/pricing` (0.9). `lastModified`, `alternates.languages` и `x-default` навесятся автоматически — цикл по `LOCALES` уже это делает.

Помнить: `sitemap()` возвращает `[]`, пока `ALLOW_INDEXING !== 'true'` ([app/sitemap.ts:21](../app/sitemap.ts#L21)). Для проверки собирать с `ALLOW_INDEXING=true`.

`robots.txt` править не нужно — правила общие для всего сайта.

---

## 9. Перелинковка

Изолированная страница без входящих внутренних ссылок не индексируется — это отдельная работа, а не «ещё один файл».

### 9.1. Главная навигация

`content/{ru,en}/nav.json` — сейчас 6 пунктов с `index` `01`–`06`.

**Решение владельца (§15.1): последним пунктом, `index: "07"`.** Перенумерация не нужна — существующие 01–06 не трогаем, дописываем одну строку в каждый из двух файлов:

```jsonc
// content/ru/nav.json — добавить в конец items
{ "index": "07", "href": "/palistor", "label": "Palistor" }

// content/en/nav.json — добавить в конец items
{ "index": "07", "href": "/palistor", "label": "Palistor" }
```

Метка `Palistor` одинакова в обеих локалях — имя собственное не переводится. Это единственный пункт меню, где RU и EN совпадают дословно; при проверке двуязычности (§12) он не должен быть принят за забытый перевод.

Код менять не нужно: `NavList` рендерит массив как есть, активное состояние считает по `pathname`.

Что теряем по сравнению с позицией 02: ссылка из глобальной навигации — сильнейший внутренний сигнал, и последняя позиция передаёт его слабее. Компенсируем остальными входящими ссылками — с главной (§9.2), с карточки на `/works` (§9.3) и с `/about` (§9.4). Для брендового запроса `palistor` этого достаточно; акцент меню при этом остаётся на коммерческих разделах.

### 9.2. Главная страница

`content/{ru,en}/site.json` → `home.highlights` — последний пункт «Palistor framework» сейчас ведёт наружу, на `https://projectint.github.io/palistor`. Меняем на внутреннюю `/palistor`.

Но `app/[lang]/page.tsx` рендерит все highlights через `ExternalLink` (`target="_blank"`). Нужна развилка по префиксу — выносим её в `components/ui/SmartLink.tsx`, потому что то же самое понадобится на `/about` (§9.4):

```tsx
// components/ui/SmartLink.tsx
export default function SmartLink({ href, lang, children, className }: …) {
  // Свои страницы («/palistor») — в той же вкладке через next/link: префетч,
  // без target="_blank" и без внешнего rel. Всё остальное — как раньше.
  return href.startsWith('/') ? (
    <Link href={`/${lang}${href}`} className={className}>{children}</Link>
  ) : (
    <ExternalLink href={href} className={className}>{children}</ExternalLink>
  )
}
```

`HomeContent.highlights[].link` остаётся `string | null` — новых полей не заводим.

### 9.3. Страница `/works`

Карточка `palistor` в `content/{ru,en}/works.json`:

- `url`: `https://github.com/ProjectINT` → `https://github.com/ProjectINT/palistor` (**починка бага**);
- у `paliproxy` заодно: → `https://github.com/ProjectINT/paliproxy` (репозиторий существует, проверено);
- новое поле `"page": "/palistor"`.

`types/content.ts` → `WorkItem` `+ page?: string | null` (опционально — остальные 10 проектов его не имеют).

`components/works/WorkCard.tsx` — после списка стека:

```tsx
{item.page && (
  <Link href={`/${lang}${item.page}`} className="…mt-5 inline-block border-b border-fg pb-1 font-mono text-xs uppercase tracking-widest">
    {lang === 'ru' ? 'Подробнее' : 'Read more'} →
  </Link>
)}
```

Побочная польза: это готовая точка расширения для P1-3 (страницы проектов) — когда появятся остальные, достаточно проставить `page` у каждого.

### 9.4. Страница `/about`

`content/{ru,en}/about.json` уже упоминает Palistor в тексте абзаца — но `AboutContent.paragraphs` это `string[]`, ссылку туда не вставить без смены типа. Зато рядом есть `links`, где сейчас одна запись — GitHub-профиль. Добавляем вторую:

```jsonc
{ "label": "Palistor — MVVM-фреймворк для React", "url": "/palistor" }   // ru
{ "label": "Palistor — MVVM framework for React",  "url": "/palistor" }   // en
```

`app/[lang]/about/page.tsx` рендерит их через `ExternalLink` — нужна ровно та же развилка по префиксу `/`, что и на главной (§9.2). Логику стоит вынести в общий компонент `components/ui/SmartLink.tsx` (внутренние — `next/link`, внешние — `ExternalLink` со стрелкой ↗) и использовать в обоих местах, а не копировать тернарник дважды.

### 9.5. Ссылки со страницы наружу

С `/palistor` — на `/{lang}/contacts` (CTA), на `/{lang}/works` (в тексте: «фреймворк вырос из продакшена SaaS-платформ») и внешние на pali.rent / kvartly.com из плашки «В продакшене». Обратная перелинковка с внешних площадок (dev.to, vc.ru, Хабр — три статьи про Palistor уже есть в `articles.json`) — Этап 5 seo-plan, здесь не трогаем.

---

## 10. Доступность и производительность

| Пункт | Как делаем |
|---|---|
| `alt` у скриншота | Осмысленный, не пустой: «Интерфейс демо-стенда Palistor: форма оплаты с условными полями». seo-plan §P1-2 отдельно ругается на пустые `alt` — не повторяем |
| LCP | `<Image priority width={1600} height={900} sizes="(max-width: 1024px) 100vw, 65vw">` — размеры известны, CLS = 0 |
| Кэш скриншота | `/works/:path*` уже отдаётся с `immutable` из [next.config.ts:19](../next.config.ts#L19) — новых правил не нужно |
| Клиентский JS | Только `CopyButton`. Страница остаётся почти полностью статическим HTML |
| Иерархия заголовков | Один `h1`, дальше `h2` по секциям, `h3` внутри слоёв и шагов — без пропусков уровней |
| Списки | `<dl>/<dt>/<dd>` для возможностей, `<ul>` для «где применять» |
| Горизонтальный скролл | `overflow-x-auto` на каждом блоке кода; `min-w-0` на flex/grid-контейнерах (в проекте это уже привычка — см. `WorkCard`, `articles/page.tsx`) |
| Фокус | `focus-visible:outline-2 focus-visible:outline-offset-2` на всех интерактивных элементах — как везде |
| Кнопка «копировать» | `aria-label`, смена текста на «Скопировано» + `aria-live="polite"` |

---

## 11. Риски и как их снимаем

| Риск | Снятие |
|---|---|
| **Near-duplicate** с `github.com/ProjectINT/palistor` и `projectint.github.io/palistor` — оба уже в индексе с тем же текстом | Страница — сжатый пересказ (~700–900 слов против ~6000 в README), а не копия. Дословно совпадают только примеры кода. §1.4 |
| Каннибализация с будущим `/works/palistor` | Решение зафиксировано в §1.2 и продублировано комментарием в коде |
| Типизированные роуты: `PageProps<'/[lang]/palistor'>` ещё не существует | `.next/types/routes.d.ts` генерируется на `next dev`/`next build`. После создания файла — один прогон сборки, до него `tsc` будет ругаться. Ожидаемо, не баг |
| Расхождение между «в продакшене» и видимой зрелостью (v0.0.31, 2 ⭐) | Продакшен-использование заявляем прямо и с проверяемыми ссылками (pali.rent, kvartly.com), но без намёка на зрелую экосистему: «обкатан в продакшене автора, API уплотняется». Формулировка §7.3 |
| **Локали разъезжаются**: в EN добавили пункт, в RU забыли | Идентичная форма и длина массивов в двух JSON — требование §3, машинная проверка в §14. Плюс правило «правим контент — правим оба файла в одном коммите» |
| Внешние ссылки протухнут | Ссылки только на корни (`/palistor`, npm-пакет, демо) — без deep-ссылок в файлы репозитория, которые переезжают при рефакторинге. Исключение — 5 табов демо, они якорные и стабильные |
| Страница не попадёт в sitemap | `ALLOW_INDEXING` — общий рубильник; при выключенном флаге sitemap пуст **для всего сайта**. Проверять сборкой с `ALLOW_INDEXING=true` |
| Shiki утяжелит билд | `devDependency`, работает только на сборке; в `output: 'standalone'` образ не едет. Прирост времени сборки — секунды |

---

## 12. Двуязычность: полный реестр строк

Требование владельца — **на двух языках должно быть всё**. Ниже перечислено каждое место, где на странице появляется человекочитаемый текст, и способ его локализации. Если строки нет в этой таблице — её не должно быть в коде.

### 12.1. Где живут строки

| Что видит посетитель | Откуда берётся | Риск |
|---|---|---|
| `h1`, intro, все заголовки секций | `content/{lang}/palistor.json` | — |
| Мета-строка «MIT · React 19 · TypeScript» | `meta[]` в контенте | низкий, но хранится всё равно на локаль |
| Подписи ссылок (Демо / GitHub / npm) | `links[]` | — |
| Плашка «В продакшене» + примечания к проектам | `usedInTitle`, `usedIn[].note` | — |
| **Подписи блоков кода** («ViewModel по MVVM») | `PalistorCode.caption` | 🔴 частая потеря — подпись легко захардкодить в компоненте |
| **Комментарии внутри примеров кода** | `PalistorCode.code` целиком | 🔴 самая частая потеря: код копируется из EN README один раз и остаётся английским в обеих локалях |
| Термины и описания в «Возможностях» | `features[]` | — |
| Списки «где применять» / «где не стоит» | `fit[]`, `unfit[]` | — |
| Подписи и примечания табов демо | `demo[].label`, `demo[].note` | — |
| Вопросы и ответы FAQ | `faq[]` | — |
| CTA и «Полная документация» | `ctaText`, `ctaLabel`, `docsLabel` | — |
| **`alt` скриншота** | `screenshotAlt` | 🔴 частая потеря |
| **Подписи кнопки «Копировать» / «Скопировано»** | `copyLabel`, `copiedLabel` → пропсы в `CopyButton` | 🔴 естественное место для хардкода |
| `title`, `description` в `<head>` | `seoTitle`, `seoDescription` | — |
| Текст **внутри** OG-картинки | `ogImage(palistor.title, palistor.intro)` | — |
| **`og:image:alt`** | `ogAlt` через `generateImageMetadata` (§6) | 🔴 статический `export const alt` двуязычным быть не может |
| Пункт меню «Palistor» | `content/{lang}/nav.json` | совпадает в обеих локалях — так и задумано |
| «Подробнее» / «Read more» на карточке `/works` | `lang === 'ru' ? … : …` в `WorkCard` | приемлемо: в компоненте уже есть такой же тернарник для `alt` |
| Ссылка на `/palistor` в `/about` | `content/{lang}/about.json` → `links[]` | — |
| Пункт highlights на главной | `content/{lang}/site.json` | — |

### 12.2. Правило для примеров кода

Оба README уже двуязычны, включая комментарии в примерах. Значит, локализованный код берётся из готового источника, а не переводится заново:

```ts
// content/en/palistor.json  ← источник README.md
"resolver: async (v) => { return await getPhone(v.id) } // getPhone is already the data layer."

// content/ru/palistor.json  ← источник README.ru.md
"resolver: async (v) => { return await getPhone(v.id) } // getPhone это уже слой данных."
```

Исполняемая часть строки при этом обязана совпадать **байт в байт** — расходиться может только комментарий. Разошедшийся код означает, что одна из локалей показывает читателю нерабочий пример.

### 12.3. Машинная проверка вместо ручной вычитки

Форму двух JSON сверяем скриптом, а не глазами — глаз пропускает именно то, что реже всего видно (вложенный `caption`, пятый элемент массива):

```bash
# Сравнение множества ключей и длин массивов в двух локалях
node -e '
const a = require("./content/ru/palistor.json"), b = require("./content/en/palistor.json");
const shape = (o, p = "") => typeof o !== "object" || o === null ? [] :
  Array.isArray(o) ? [`${p}[]=${o.length}`, ...o.flatMap((v, i) => shape(v, `${p}[${i}]`))]
                   : Object.keys(o).sort().flatMap(k => [`${p}.${k}`, ...shape(o[k], `${p}.${k}`)]);
const [x, y] = [shape(a).join("\n"), shape(b).join("\n")];
console.log(x === y ? "OK: формы совпадают" : "РАЗОШЛИСЬ");
'
```

Плюс дешёвая проверка на непереведённые строки: `diff <(jq -r .. content/ru/palistor.json) <(jq -r .. content/en/palistor.json)` — все строки, оказавшиеся идентичными, кроме кода, `lang`, `index` и URL-ов, требуют объяснения.

---

## 13. Порядок выполнения

**Статус: реализовано 2026-08-13** (шаги 1–12; отметки проверки — §14).

- [ ] 0. **Зафиксировать замер бандла до изменений:** `pnpm build`, сохранить колонку `First Load JS` по всем роутам. **Пропущено:** Next 16 с Turbopack больше не печатает эту колонку в выводе сборки — сравнивать оказалось не с чем. Обещание §5 проверено иначе, см. §14.
- [x] 1. **Прочитать документацию Next** — требование `AGENTS.md` (эта версия Next отличается от тренировочных данных):
   `01-app/03-api-reference/04-functions/generate-metadata.md`,
   `01-app/03-api-reference/04-functions/generate-image-metadata.md`,
   `01-app/03-api-reference/03-file-conventions/01-metadata/{sitemap,opengraph-image}.md`,
   `01-app/03-api-reference/03-file-conventions/page.md`.
- [x] 2. **Типы** — `PalistorContent` и вложенные в `types/content.ts`; `WorkItem.page`.
- [x] 3. **Контент EN** — `content/en/palistor.json` из `README.md`.
- [x] 4. **Контент RU** — `content/ru/palistor.json` из `README.ru.md`, **сразу за EN, в том же заходе**. Разнести по разным сессиям — верный способ получить расхождение локалей (§11).
- [x] 5. **Сверка форм** — прогнать скрипт из §12.3, убедиться, что «формы совпадают».
- [x] 6. **Загрузчик** — `getPalistor` в `lib/content.ts`.
- [x] 7. **Подсветка** — `pnpm add -D shiki` (`^4.4.3`), `lib/highlight.ts`, `components/ui/CodeBlock.tsx`, `components/ui/CopyButton.tsx`.
- [x] 8. **Схемы** — `palistorGraph` и `faqPage` в `lib/schema.ts`.
- [x] 9. **Страница** — `app/[lang]/palistor/page.tsx` со всеми секциями из §4.
- [x] 10. **OG** — `app/[lang]/palistor/opengraph-image.tsx` с `generateImageMetadata`.
- [x] 11. **Sitemap** — строка в `ROUTES`.
- [x] 12. **Перелинковка** — `SmartLink.tsx`; nav.json ×2, site.json ×2, works.json ×2, about.json ×2; `app/[lang]/page.tsx`, `app/[lang]/about/page.tsx`, `WorkCard.tsx`.
- [x] 13. **Проверка** — чек-лист §14 (машинная часть; браузерные и внешние проверки остались, см. отметки).

Шаги 2–6 и 7 независимы, могут идти параллельно. Шаг 9 требует 2–8.

---

## 14. Чек-лист проверки

```bash
pnpm lint
ALLOW_INDEXING=true pnpm build
```

**Прогон 2026-08-13.** Отмечено `[x]` — проверено машинно на этой сборке. Осталось `[ ]` — только то, что требует браузера, внешнего сервиса или живого носителя языка; у каждого пункта написано, чем он заменён или почему отложен.

**Сборка и метаданные**

- [x] `pnpm lint` — 0 ошибок (одно предупреждение в `Footer.tsx` — досталось от прежнего кода, к этой задаче отношения не имеет)
- [x] Сборка проходит; `/[lang]/palistor` помечен `●` (SSG, prerendered static HTML) — динамического `ƒ` нет. Значка `○` у роутов с `generateStaticParams` в Next 16 не бывает: `○` только у роутов без параметров
- [x] `.next/server/app/en/palistor.html` и `ru/palistor.html` существуют
- [x] В HTML: `<link rel="canonical" href="https://palisoft.ru/en/palistor">`; на RU — `…/ru/palistor`
- [x] В HTML: три `hreflang` (`ru`, `en`, `x-default` → `/en/palistor`), все указывают на `…/palistor`
- [x] В HTML: `og:title`, `og:description`, `og:image`, `og:image:alt`, `twitter:card=summary_large_image`
- [x] В HTML: код примеров присутствует текстом — `<pre class="shiki vesper">` с готовыми токенами (подсветка на сборке)
- [~] Блоки `application/ld+json` — на странице их 4: три своих (breadcrumbs, palistorGraph, faqPage) плюс `rootGraph` из layout. JSON парсится, поля на месте. **Прогон через validator.schema.org и Rich Results Test не делался** — внешние сервисы, руками
- [x] В JSON-LD `mentions` — pali.rent и kvartly.com
- [x] `sitemap.xml.body` содержит `/ru/palistor` и `/en/palistor` с `xhtml:link` альтернативами
- [x] `curl -I localhost:3111/palistor` → 307 на `/en/palistor`; с `Accept-Language: ru` → 307 на `/ru/palistor`. Кода не потребовалось, как и предсказано в §1.1

**Бандл (прямой ответ на вопрос §15.2)**

- [~] `First Load JS` — **сравнить не с чем: Next 16 с Turbopack эту колонку больше не печатает** (поэтому и замер шага 0 не состоялся). Обещание проверено по существу двумя пунктами ниже: клиентского кода shiki нет нигде, `CodeBlock` — серверный компонент, `CopyButton` живёт только в дереве `/palistor`
- [x] `node_modules/shiki` отсутствует в `.next/standalone/node_modules`
- [x] `grep -r "shiki" .next/static/` — пусто

**Двуязычность (§12)**

- [x] Скрипт сверки форм из §12.3 печатает «OK: формы совпадают»
- [x] `og:image:alt` на `/ru/palistor` — по-русски, на `/en/palistor` — по-английски
- [x] `alt` скриншота различается между локалями
- [x] Подписи блоков кода (`figcaption`) переведены — все 5 пар
- [x] **Комментарии внутри примеров кода** переведены. Уточнение к правилу §12.2: кроме комментариев расходятся ещё и строковые литералы, которые видит пользователь демо (`label: "Сумма"` / `label: "Amount"`, текст кнопки «Оплатить» / «Pay»). Это сделано намеренно — иначе русский читатель видит английскую форму. Структура кода, имена полей и API совпадают байт в байт
- [x] Кнопка копирования подписана на языке страницы, в обоих состояниях («Копировать»/«Скопировано», Copy/Copied)
- [x] Все 5 вопросов FAQ присутствуют в обеих локалях
- [ ] Обе локали читаемы носителем; RU — не калька с EN. **Вычитка за владельцем** — машинно не проверяется

**Перелинковка и вёрстка**

- [x] Пункт «Palistor» (07) есть в разметке обеих локалей — и в боковом меню, и в мобильном drawer. Активное состояние считает прежний `NavList` по `pathname`, своего кода не добавлялось
- [x] С главной ссылка «Palistor framework» ведёт на `/{lang}/palistor` через `next/link` — без `target="_blank"`
- [x] На `/works` у карточки palistor: внешняя ссылка → `github.com/ProjectINT/palistor` (профиль починен, у `paliproxy` тоже), внутренняя «Подробнее» → `/{lang}/palistor`
- [x] На `/about` ссылка на Palistor — внутренняя, без `target="_blank"`
- [x] Плашка «В продакшене» ведёт на pali.rent и kvartly.com — обе отвечают 200
- [ ] Мобильная ширина 320px: блоки кода скроллятся сами, страница по горизонтали — нет. **Глазами в браузере.** В разметке `overflow-x-auto` и `min-w-0` на месте
- [ ] Кнопка «копировать» работает и озвучивает результат. **Глазами в браузере.** `aria-live="polite"` в HTML присутствует
- [x] Скриншот: `alt` не пустой, `width`/`height` заданы (1600×900) + `priority` → CLS = 0

---

## 15. Решения владельца (зафиксированы 2026-08-13)

| # | Вопрос | Решение | Где отражено |
|---|---|---|---|
| 1 | Место в навигации | **Последним пунктом**, `index: "07"`, без перенумерации | §9.1 |
| 2 | Подсветка кода | **Shiki**, при условии что бандл остальных страниц не меняется. Гарантия разложена на три механизма, проверка вынесена в чек-лист | §5, §14 |
| 3 | Тон о зрелости | **Не «экспериментальный».** Palistor в продакшене pali.rent и kvartly.com, показывает себя хорошо — говорим об этом прямо, с проверяемыми ссылками. Рамка: «обкатан в продакшене автора, публичный API уплотняется» | §6, §7.1, §7.3, §11 |
| 4 | FAQ-секция | **Оставляем**, 5 вопросов, `FAQPage` в разметке | §7.3 |
| 5 | «Где не стоит применять» | **Оставляем**, сокращаем до 4 пунктов | §3, §4 |
| 6 | Двуязычность | **Всё — на двух языках**, включая комментарии в коде, `alt` и `og:image:alt`. Заведён отдельный раздел с реестром строк и машинной сверкой | §12, §14 |

Решение №3 — самое влияющее на текст: продакшен-использование переехало из FAQ в `seoDescription`, в отдельную плашку под шапкой страницы и в `mentions` разметки. Это единственное утверждение, которого нет ни у github.com, ни у npmjs.com в той же выдаче по запросу `palistor`.