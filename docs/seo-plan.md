# SEO: аудит и план внедрения

**Проект:** palisoft.ru — сайт-портфолио / студия одного разработчика (Next.js 16 App Router, 2 локали `ru`/`en`)
**Дата аудита:** 2026-08-05 · **Решения владельца внесены:** 2026-08-05
**Метод:** статический анализ исходников + разбор реального HTML из `pnpm build` (`.next/server/app/**/*.html`, `robots.txt.body`, `sitemap.xml.body`) + проверка DNS домена.

**Принятые вводные (детали в §7 Этап 0):** домен `palisoft.ru` (единственный) · позиционирование «мы» (ИП, Organization + Person) · рынок — весь мир, английский приоритетный · цены в USD (250 / 1000 / 6000) · индексация целиком под флагом `ALLOW_INDEXING`, по умолчанию **выключена**.

---

## 0. Краткое резюме

Технический фундамент неплохой: SSG на всех страницах, серверный рендер контента (не CSR-пустышка), человекочитаемые URL, `next/font` (self-hosted), `next/image` с корректными `sizes`, семантические `<h1>/<h2>/<article>`, `<html lang>` выставлен, 404 отдаёт настоящий 404.

Но **сайт в текущем виде не проиндексируется корректно**. Три ошибки из категории «стоп-индексация»:

1. **Домен в коде не существует.** `https://yuripalienko.com` захардкожен в трёх местах и не резолвится в DNS. README указывает `palisoft.ru` (резолвится в `31.186.100.50`). Все canonical, hreflang и sitemap указывают на несуществующий хост.
2. **Все 12 страниц канонизируются на главную.** Проверено в собранном HTML.
3. **Ноль Open Graph / Twitter-разметки.** Ни одного тега на всём сайте.

Оценка по 10-балльной: **техническое SEO 3/10, контентное SEO 2/10, скорость 6/10, внешнее SEO 0/10.**

Ниже — детальный разбор, затем план внедрения на 6 этапов.

---

## 1. Что уже сделано правильно (не трогаем)

| Пункт | Где |
|---|---|
| Полноценный SSR/SSG контента — краулер видит текст без JS | все `app/[lang]/*/page.tsx` (SSG, кроме catch-all) |
| Уникальные `title` и `description` на каждой странице | `generateMetadata` в каждом `page.tsx` |
| Шаблон title (`%s · Юрий Палиенко`) | [app/[lang]/layout.tsx:41](app/%5Blang%5D/layout.tsx#L41) |
| `<html lang="ru|en">` | [app/[lang]/layout.tsx:60](app/%5Blang%5D/layout.tsx#L60) |
| Один `<h1>` на страницу, корректная иерархия `h1 → h2` | [components/ui/PageHeader.tsx](components/ui/PageHeader.tsx), [components/works/WorkCard.tsx](components/works/WorkCard.tsx) |
| `next/font` — шрифты self-hosted, без запроса к Google, с `preload` | [app/[lang]/layout.tsx:12-20](app/%5Blang%5D/layout.tsx#L12-L20) |
| `next/image` с `width/height` и `sizes` — нет CLS | [components/works/WorkCard.tsx:12-19](components/works/WorkCard.tsx#L12-L19) |
| three.js вынесен в `dynamic(ssr:false)` — не блокирует первый рендер и не ломает SSR-контент | [components/hero/Hero.tsx:14](components/hero/Hero.tsx#L14) |
| Ассеты исключены из locale-редиректа (`sitemap.xml`, `robots.txt` доступны без 307) | [proxy.ts:20-24](proxy.ts#L20-L24) |
| `prefers-reduced-motion` и мобильный lightweight-режим | [components/hero/Hero.tsx:26-28](components/hero/Hero.tsx#L26-L28) |
| Реальный 404-статус на несуществующих путях | [app/[lang]/[...rest]/page.tsx](app/%5Blang%5D/%5B...rest%5D/page.tsx) |
| Осмысленный `manifest.ts` + полный набор фавиконов | [app/manifest.ts](app/manifest.ts) |

---

## 2. Критические проблемы (P0 — блокируют индексацию)

### P0-1. Домен `yuripalienko.com` не существует

Захардкожен в трёх местах с комментарием `// TODO_CONFIRM домен`:

- [app/robots.ts:3](app/robots.ts#L3) → `Sitemap: https://yuripalienko.com/sitemap.xml`
- [app/sitemap.ts:5](app/sitemap.ts#L5) → все 14 `<loc>`
- [app/[lang]/layout.tsx:38](app/%5Blang%5D/layout.tsx#L38) → `metadataBase`, а значит **все** canonical/hreflang/OG-URL

Проверка DNS:

```
palisoft.ru       → 31.186.100.50   (резолвится)
yuripalienko.com  → NXDOMAIN        (не существует)
```

**Последствие:** sitemap ведёт на мёртвый хост → Google/Яндекс не смогут обойти ни одной страницы; canonical на чужой/несуществующий домен → страницы выпадают из индекса как «Alternate page with proper canonical tag».

**✅ Решено:** канонический домен — **`palisoft.ru`**, он единственный. Домен `yuripalienko.com` не зарегистрирован, редиректы не нужны, вопрос второго хоста снят. Остаётся чисто механическая правка: убрать хардкод в трёх файлах (Этап 1.1).

---

### P0-2. Все страницы канонизируются на главную

`alternates` задан только в root-layout как `canonical: '/${lang}'` ([app/[lang]/layout.tsx:43-46](app/%5Blang%5D/layout.tsx#L43-L46)). В Next.js метаданные **наследуются**, если дочерний сегмент их не переопределяет (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`, раздел «Inheriting fields»). Ни один `page.tsx` не задаёт `alternates`.

Факт из собранного HTML (`.next/server/app/ru/works.html`):

```html
<title>Работы · Юрий Палиенко</title>
<link rel="canonical" href="https://yuripalienko.com/ru"/>          <!-- ← должно быть /ru/works -->
<link rel="alternate" hrefLang="ru" href="https://yuripalienko.com/ru"/>
<link rel="alternate" hrefLang="en" href="https://yuripalienko.com/en"/>
```

**Последствие:** `/ru/works`, `/ru/cv`, `/ru/pricing`, `/ru/about`, `/ru/articles`, `/ru/contacts` (и все `en`-аналоги) явно говорят поисковику «я — копия главной, не индексируй меня». Из 12 страниц в индекс попадут 2. Это самая дорогая ошибка на сайте: страницы `/cv` и `/pricing` — именно те, что должны приводить заказчиков и рекрутеров.

---

### P0-3. hreflang неверный на всех подстраницах + нет `x-default`

Из того же наследования: на `/ru/works` hreflang-альтернативой для `en` объявлена **главная** `/en`, а не `/en/works`. Google требует, чтобы hreflang-кластер был симметричным и постраничным; асимметричный кластер игнорируется целиком.

Также:
- нет `x-default` — а он критичен, т.к. корень `/` отдаёт 307 в зависимости от `Accept-Language` ([proxy.ts](proxy.ts)), и краулер без заголовка языка всегда попадает на `/ru`. Английская версия рискует не индексироваться вовсе.
- нет self-referencing hreflang на каждой странице.
- языковые коды `ru`/`en` без региона — для мультиязычного сайта без региональной привязки это как раз правильно, регионы (`ru-RU`, `en-US`) не нужны.

**⚠️ Усилено решением по рынку (Q3: весь мир).** Раз целевой рынок международный, текущее поведение особенно вредно: `DEFAULT_LOCALE = 'ru'` ([lib/i18n.ts:3](lib/i18n.ts#L3)) означает, что **любой краулер без `Accept-Language` — включая Googlebot — уходит на русскую версию**. Английские страницы при этом ещё и объявлены неканоническими (P0-2). Для мирового рынка нужно:
- `x-default` → **`/en`**;
- `DEFAULT_LOCALE` → **`en`** (фолбэк `pickLocale`, когда язык не распознан);
- при этом русский остаётся полноценной локалью, ничего не удаляется — меняется только то, что видит «безъязыкий» посетитель.

---

### P0-4. Полное отсутствие Open Graph и Twitter Card

В собранном HTML **ноль** тегов `og:*` и `twitter:*` на всех 12 страницах. Проверено grep-ом по `.next/server/app/ru.html` и `ru/works.html`.

**Последствие:** ссылка на сайт в Telegram, LinkedIn, vc.ru, Хабре, Slack, WhatsApp разворачивается голым текстом без картинки. Для портфолио, которое распространяется именно через мессенджеры и соцсети, это прямая потеря конверсии — CTR ссылки с OG-картинкой выше в 2–3 раза.

Существующий `public/favicon/og-preview-256.png` — **256×256**, для OG не годится (нужно 1200×630, минимум 600×315) и нигде не подключён.

---

### P0-5. Sitemap неполный и неинформативный

Текущий вывод (`.next/server/app/sitemap.xml.body`) — 14 голых `<loc>` на мёртвом домене. Отсутствует:

- `lastModified` — поисковик не понимает, что обновилось; переобход редкий;
- `alternates.languages` (`xhtml:link rel="alternate"`) — Next это поддерживает нативно (`node_modules/next/dist/docs/.../sitemap.md`, «Generate a localized Sitemap»), и для двуязычного сайта это второй канал передачи hreflang, страхующий P0-3;
- `priority` / `changeFrequency` — вес страниц не разделён;
- корневой `/` — отсутствует;
- image sitemap для 15 скриншотов работ.

---

## 3. Важные проблемы (P1 — сильно ограничивают потолок)

### P1-1. Ноль структурированных данных (JSON-LD)

Не размечено ничего. Это упущенная возможность №1 — связка `Organization` + `Person` + `sameAs` формирует Knowledge Panel по бренд-запросам «Palisoft» и «Юрий Палиенко» / «Yuri Palienko».

**Схема с учётом Q2 («мы» = ИП, бизнес с возможностью найма):** корневая сущность — `Organization` (можно уточнить до `ProfessionalService`), а `Person` привязывается к ней через `founder` / `employee`. Это честно отражает реальность (ИП = юрлицо + один известный человек) и даёт обе панели: бренд студии и персональный профиль.

Нужны схемы:

| Схема | Страница | Что даёт |
|---|---|---|
| `Organization` / `ProfessionalService` (+ `founder`, `sameAs`, `areaServed: Worldwide`, `knowsLanguage`) | все (в layout) | бренд-панель «Palisoft», связка с профилями |
| `Person` (+ `sameAs`, `knowsAbout`, `jobTitle`, `worksFor` → Organization) | все (в layout) | персональная панель, экспертность |
| `WebSite` (+ `inLanguage`, `publisher` → Organization) | layout | понимание структуры сайта |
| `ProfilePage` | `/about`, `/cv` | тип страницы-профиля |
| `BreadcrumbList` | все внутренние | хлебные крошки в выдаче вместо голого URL |
| `ItemList` → `CreativeWork` | `/works` | список проектов |
| `SoftwareApplication` / `WebApplication` | каждая работа | описание продукта |
| `Service` + `Offer` (`priceCurrency: USD`, `price` = 250 / 1000 / 6000, `availability`) | `/pricing` | цены в выдаче |
| `ContactPage` | `/contacts` | |
| `Article` / `BlogPosting` | будущие свои статьи | Discover, Top Stories |
| `FAQPage` | `/pricing` (блок FAQ) | расширенный сниппет |

Способ подключения — `<script type="application/ld+json">` в серверном компоненте с экранированием `<` → `<` (рекомендация из `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`).

---

### P1-2. Пустой `alt` на всех скриншотах работ

[components/works/WorkCard.tsx:15](components/works/WorkCard.tsx#L15) — `alt=""`. В собранном HTML все 6 изображений на `/ru/works` идут с `alt=""`.

`alt=""` означает «изображение декоративно, игнорируй». Скриншот продукта — не декорация: это контент, который должен ранжироваться в Картинках и давать доп. трафик. Плюс нарушение доступности (WCAG 1.1.1), а accessibility косвенно влияет на оценку качества страницы.

То же и в hero-лайтбоксе, и в `HeroScene` (там `aria-hidden` на всём кольце — это как раз оправданно, т.к. работы дублируются на `/works`).

---

### P1-3. Нет отдельных страниц проектов

11 проектов живут одним списком на `/works`. Каждый проект — это готовая посадочная страница под кластер запросов («SaaS для управления автопарком», «маркетплейс аренды авто разработка», «BI-система на ClickHouse», «palistor MVVM React»). Сейчас весь этот семантический вес размазан по одному URL и не ранжируется ни по чему.

Структура `content/{ru,en}/works.json` уже готова к этому: есть `slug`, `summary`, `highlights`, `stack`, `images` — не хватает только роута и расширенного описания (`body`).

**Потенциал:** 11 проектов × 2 локали = 22 новых индексируемых URL с уникальным контентом. Это утроит объём индексируемого сайта.

---

### P1-4. Раздел «Статьи» не даёт SEO-эффекта

[content/ru/articles.json](content/ru/articles.json) — три внешние ссылки (dev.to, vc.ru, Хабр). Сайт отдаёт весь ссылочный вес наружу и не получает ни одного индексируемого материала взамен.

Дополнительно: ссылка на `habr.com/ru/sandbox/294410/` — песочница Хабра, страница нестабильная (может исчезнуть) → риск битой внешней ссылки.

**Что делать:** перенести канонические версии статей на свой домен (`/[lang]/articles/[slug]`), а на внешних площадках оставить кросс-пост со ссылкой «оригинал опубликован на …». Это стандартная и безопасная практика; дублирование снимается тем, что на своём домене статья — canonical.

---

### P1-5. Страница 404 не локализована и без метаданных

- `app/[lang]/not-found.tsx` — хардкод «Page not found» + смешанный русско-английский текст, `lang` недоступен.
- Глобальный `_not-found` отдаёт дефолтный `<title>404: This page could not be found.</title>` — попадает в индекс/логи как есть.
- На 404 нет `robots: { index: false }`.
- Ссылка «← Home» ведёт на `/`, что вызывает лишний 307-редирект.

---

### P1-6. Дублирующийся манифест с битыми путями

`public/favicon/site.webmanifest` дублирует `app/manifest.ts`, при этом ссылается на `/icon-192.png` и `/icon-512.png`, которых по этим путям нет (реальные — `/favicon/icon-192.png`). Файл не подключён (Next отдаёт `/manifest.webmanifest` из `app/manifest.ts`), но лежит в `public` и доступен по прямой ссылке — источник путаницы и потенциальных 404 в отчётах.

Также `manifest.start_url: '/'` ([app/manifest.ts:9](app/manifest.ts#L9)) → при запуске PWA срабатывает 307-редирект. Лучше `/ru` (или сохранить `/` и явно принять редирект).

---

### P1-7. robots.txt минимален

```
User-Agent: *
Allow: /
Sitemap: https://yuripalienko.com/sitemap.xml
```

Не хватает: запрета служебных путей (~~`/_next/`~~, `/api/` — **правка при внедрении:** `/_next/` закрывать нельзя, оттуда идут `/_next/image`, CSS и JS), явного `Host` (устаревшая директива Яндекса, но безвредна), и — по желанию владельца — правил для AI-краулеров (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `CCBot`). Для портфолио разработчика я бы **разрешил** их: цитирование в AI-ответах сейчас реальный канал входящих обращений.

---

### P1-8. Title и description не работают на запросы

Сейчас:

| URL | Title | Проблема |
|---|---|---|
| `/ru` | `Юрий Палиенко — Full-Stack Architect & Team Lead` | 45 симв., ок, но нет коммерческих слов |
| `/ru/works` | `Работы · Юрий Палиенко` | 22 симв. — половина сниппета пустует, ноль ключей |
| `/ru/cv` | `Резюме · Юрий Палиенко` | то же |
| `/ru/pricing` | `Цены · Юрий Палиенко` | то же; а это коммерческая страница |
| `/ru/contacts` | `Контакты · Юрий Палиенко` | то же |

Оптимальная длина title — 50–60 символов, description — 140–160. Сейчас используется ~35% доступного места. Заголовки нужно задавать в контенте (`content/{ru,en}/*.json` → поля `seoTitle`, `seoDescription`), а не выводить из `title` страницы, — тогда `<h1>` остаётся коротким и красивым, а `<title>` работает на выдачу.

Пример: `Цены · Юрий Палиенко` → `Разработка SaaS и MVP на Next.js/NestJS — цены | Юрий Палиенко` (61 симв.)

---

### P1-9. Заголовок главной не несёт смысла для поиска

`<h1>Юрий Палиенко</h1>` ([components/hero/Hero.tsx:92](components/hero/Hero.tsx#L92)) — только имя, `text-2xl`. Tagline с реальными ключами («SaaS-платформы и маркетплейсы», «Node.js/NestJS») лежит в `<p>`. На главной должен быть один h1, включающий и имя, и специализацию; tagline логично поднять в `<h2>` или `<p>` рядом.

Плюс: главная состоит почти целиком из `aria-hidden` 3D-сцены — текстового контента на ней ~40 слов. Для главной страницы домена это мало. Стоит добавить под hero сжатый текстовый блок (услуги, стек, 3–4 ключевых проекта ссылками) — он же улучшит внутреннюю перелинковку.

---

### P1-10. Мелочи в семантике

- ~~«О нас» → «Обо мне»~~ — **отменено решением Q2.** «О нас» остаётся: позиционирование «мы» выбрано осознанно. Но тогда нужно **выровнять тон**: сейчас `about.json` и `cv.json` написаны от первого лица единственного числа («Специализируюсь», «вёл команду», «Сейчас — собственные продукты»), а навигация обещает «нас». Смешение «мы/я» на одной странице читается как непроработанность и снижает доверие — а доверие на коммерческой странице конвертируется в заявки.
  **Рекомендация:** «мы» — на страницах про услуги (главная, `/pricing`, `/works`, `/contacts`, `Organization` JSON-LD); «я» — на `/cv` и в блоке личного опыта `/about` (это резюме конкретного человека, там «мы» звучало бы странно и мешало бы рекрутерам). Разделение честное и не создаёт противоречия.
- Нет `<time datetime>` у периодов работы (`period`, `duration`) — усложняет парсинг дат в CV.
- В `CvTimeline` заголовки должностей — не `<h3>`; иерархия под `<h2>Опыт</h2>` разорвана.
- Внешние ссылки без `rel="nofollow"`/`ugc` — здесь это нормально (это ваши же профили), но ссылку на Хабр-песочницу стоит пересмотреть.

---

### P1-11. Контент не соответствует принятому позиционированию (новое, после ответов)

Решения Q2–Q4 расходятся с тем, что сейчас лежит в `content/`:

| Что решено | Что в контенте сейчас | Файл |
|---|---|---|
| Рынок — весь мир | «Сочи, РФ», «Удалённо, готов к командировкам. РФ · разрешение на работу в Грузии» — читается как локальный исполнитель | [content/ru/contacts.json:11-12](content/ru/contacts.json#L11-L12) |
| Цены в USD | `"price": "TODO_CONFIRM"` ×2 и `"от 500 000 ₽"` ×1 — рубли, плюс плейсхолдеры выводятся как «по запросу» | [content/ru/pricing.json](content/ru/pricing.json), [app/[lang]/pricing/page.tsx:20](app/%5Blang%5D/pricing/page.tsx#L20) |
| Стек на `/pricing` обязателен | поля под стек в `PricingTier` нет вообще | [types/content.ts](types/content.ts) → `PricingTier` |
| Позиционирование «мы» (бизнес) | ожидания по зарплате «от 250 000 ₽ net», «Готовность к выходу 2–4 недели» на `/cv` — это язык найма, а не подряда | [content/ru/cv.json](content/ru/cv.json) → `facts` |

Последний пункт — не ошибка, если `/cv` осознанно нацелен на рекрутеров: тогда сайт обслуживает две разные аудитории (заказчики → `/pricing`, работодатели → `/cv`), и это нормально. Но стоит понимать, что для заказчика из США «ожидания 250 000 ₽ net» на соседней вкладке обесценивает ценник «$6000 за SaaS». **Решение за вами** — вариант «оставить обе воронки» рабочий, просто разведите их явно (см. §8, Q8).

**Отдельно: стек в контенте занижен относительно реального.** Проблема обратная той, что кажется на первый взгляд, — не «заявлено лишнее», а «не заявлено имеющееся»:

| Технология | Где реально используется | Где упомянута в контенте |
|---|---|---|
| **Supabase** | `kvartly.com`, `pali.rent` | **нигде** — ни в `works.json`, ни в `cv.json` |
| **Redis** | `kvartly.com` | только в `cv.json` → «Базы данных»; в `works.json` отсутствует |
| **Three.js** | на этом сайте (hero-сцена) | **нигде** — ни в `works.json`, ни в `cv.json` |

У `kvartly` и `palirent` стек в обеих локалях сведён к `["Next.js", "NestJS", "TypeScript", "PostgreSQL"]` ([content/ru/works.json:76](content/ru/works.json#L76), [content/ru/works.json:88](content/ru/works.json#L88) и их `en`-аналоги).

Это прямая потеря семантики: `supabase development`, `redis caching`, `react three fiber` — рабочие поисковые запросы, а на сайте этих слов нет вообще. Плюс страница `/pricing` будет обещать стек, который не подтверждён ни одной карточкой портфолио — не потому, что опыта нет, а потому что его забыли записать.

**Правка дешёвая и делается в JSON:**
- [ ] `kvartly` → добавить `Supabase`, `Redis`
- [ ] `palirent` → добавить `Supabase`
- [ ] `cv.json` → `stack`: добавить `Supabase` в «Базы данных», `Three.js` в «Frontend»
- [ ] Пройти остальные 9 проектов тем же вопросом — почти наверняка занижены и они
- [ ] Рассмотреть сам сайт как кейс в портфолио (Next.js 16 + React Three Fiber + i18n без библиотек) — закрывает `Three.js` и заодно даёт 12-й проект

> Supabase и PostgreSQL в одном списке — не дубль: Supabase построен на Postgres, но как отдельная строка стека он несёт свой пул запросов. Указывать стоит оба.

---

## 4. Производительность и Core Web Vitals (P2)

CWV — подтверждённый фактор ранжирования; для сайта с three.js-сценой это узкое место.

| Находка | Детали | Влияние |
|---|---|---|
| `public/hdri/studio.hdr` — **1.5 МБ** | грузится на десктопе для окружения стекла; в комментарии кода честно указано «HDRI весит ~1.6 МБ: до его загрузки канвас пустой» | сетевой бюджет, конкуренция за полосу с LCP-ресурсом |
| Нет `priority` на первом изображении `/works` | все 6 картинок `loading="lazy"` | LCP на `/works` может быть картинкой |
| `next.config.ts` пуст | нет `images.formats` (AVIF), нет `poweredByHeader: false`, нет long-cache заголовков для `/works/*`, `/hdri/*` | упущенный лёгкий выигрыш |
| three.js + drei + fiber в клиентском бандле | ~600 КБ JS gzip (оценка по стеку; нужно замерить `pnpm build --profile`) | INP/TBT на слабых устройствах |
| Нет `<link rel="preconnect">`/`preload` для HDRI | сцена ждёт | TTI сцены |
| Нет `Cache-Control: immutable` для `public/works/*` | Next кэширует `_next/image`, но исходники — нет | повторные визиты |

**Смягчения (не ломая визуал):**
1. Сжать HDRI: 1.5 МБ `.hdr` → `.ktx2`/сжатый EXR или снизить разрешение до 512×256 (для reflection-окружения этого достаточно) — реалистично **1.5 МБ → 80–150 КБ**.
2. `priority` + `fetchPriority="high"` на первой карточке `/works`.
3. `images: { formats: ['image/avif', 'image/webp'] }` в `next.config.ts`.
4. `poweredByHeader: false`, `compress: true`.
5. Замерить фактические цифры через Lighthouse/PageSpeed после деплоя — до деплоя все числа выше это оценки, а не измерения.

---

## 5. Внешнее SEO (сейчас — ноль)

Ничего из этого не настроено. Приоритеты пересобраны под Q3 (мировой рынок):

- **Google Search Console** — не подтверждён (нет `verification` в метаданных). **Приоритет №1**: ~90% мирового поиска.
- **Bing Webmaster Tools** — не подтверждён. Раньше был бы третьим пунктом, теперь второй: Bing питает поиск ChatGPT и Copilot, а это заметный канал для B2B-разработки.
- **Яндекс.Вебмастер** — не подтверждён. С мировым позиционированием он **понижается до третьего приоритета**, но не отменяется: русская локаль остаётся, домен в зоне `.ru`, и русскоязычные заказчики никуда не делись. Региональность в Вебмастере теперь ставим **не** «Сочи», а «не имеет региональной принадлежности» — иначе Яндекс сузит показы до Краснодарского края.
- **IndexNow** — мгновенное уведомление Bing/Яндекса об обновлениях; для статики настраивается один раз.
- **Аналитика** — не подключена вообще. Для мирового рынка логичнее Plausible / GA4, а не Метрика (Метрика — опционально, если важен Вебвизор по русскому трафику). Без аналитики эффект от всего плана неизмерим.
- **Обратные ссылки** — потенциал не реализован. Для международного рынка ценность площадок меняется: GitHub, npm, dev.to, Hacker News, Reddit (r/webdev, r/node), Product Hunt, LinkedIn, X — выше; vc.ru и Хабр — ниже, но для русской локали остаются.
- **`.ru` в мировом контексте** — зона `.ru` не является для Google геотаргетингом «только Россия» в жёстком смысле, но исторически даёт ассоциацию с РФ и у части западных заказчиков вызывает настороженность. Это **не SEO-проблема, а вопрос доверия**. Технически можно жить с `.ru`; если появится бюджет — `.com`/`.dev` под тот же бренд с 301 на выбранный канонический хост усилит международную воронку. Сейчас в план не включаю (домен один — решение Q1), просто фиксирую как будущий рычаг.

---

## 6. Семантическое ядро

**Пересобрано под Q3 (весь мир): английский кластер теперь основной, русский — вторичный.** Раньше приоритеты были обратными. Точные частотности нужно снять в Google Keyword Planner / Ahrefs (для EN) и Яндекс.Wordstat (для RU) перед финализацией — ниже гипотезы под структуру сайта.

### EN — основной (→ `/en/*`)

**A-en. Коммерческие (главная цель) → `/en/pricing`, страницы проектов**
`saas development company`, `mvp development services`, `nestjs development agency`, `hire nextjs developer`, `custom marketplace development`, `b2b saas development cost`, `saas mvp cost`, `event-driven architecture consulting`, `supabase development agency`

**B-en. Экспертные (трафик + доверие) → `/en/articles/[slug]`** — **самый сильный актив**
`mvvm in react`, `declarative state management react`, `duckdb in the browser`, `clickhouse analytics dashboard`, `ai agent harness architecture`, `nestjs prisma clickhouse`, `kafka in saas platform`, `react three fiber portfolio`

**C-en. Бренд**
`palisoft`, `yuri palienko`, `palistor`, `paliproxy`, `projectint github`

### RU — вторичный (→ `/ru/*`)

**D-ru. Коммерческие**
`разработка saas под ключ`, `заказать mvp`, `разработка маркетплейса цена`, `nestjs разработчик заказать`, `разработка b2b платформы`

**E-ru. Экспертные**
`mvvm в react`, `duckdb в браузере`, `clickhouse аналитика`, `ai-агент harness архитектура`, `kafka в saas-платформе`

**F-ru. Найм (для рекрутеров) → `/ru/cv`**
`senior full-stack javascript`, `team lead node.js резюме`, `nestjs team lead`

### Стратегическая заметка

Кластер **B-en** — то, где вы реально можете выиграть. Коммерческие запросы («saas development company») — это ниша, где бьются агентства с бюджетами на ссылки; одиночному сайту там первые позиции недостижимы в разумный срок. А вот `duckdb in the browser`, `ai agent harness architecture`, `declarative mvvm react` — запросы, по которым у вас **производственный опыт, которого почти ни у кого нет**, и конкуренция близка к нулю. Это и трафик, и доказательство экспертизы, которое потом продаёт коммерческие страницы через внутреннюю перелинковку.

**Честная оценка ожиданий:** по кластеру B-en первые результаты — 3–6 месяцев после публикации при регулярности. По коммерческим EN-запросам органика в топ-10 за год маловероятна без ссылочной работы; их роль — добирать длинный хвост и конвертировать брендовый/реферальный трафик. Не стоит планировать поток заявок из органики по «saas development company» — это не тот рычаг.

---

## 7. План внедрения

Оценки — в часах чистой работы.

### Этап 0 — Решения ✅ приняты

| # | Вопрос | Решение владельца | Что из этого следует |
|---|---|---|---|
| Q1 | Канонический домен | **`palisoft.ru`** — единственный домен | Хардкод `yuripalienko.com` убрать; редиректы второго хоста не нужны |
| Q2 | Позиционирование | **«Мы»** — ИП, бизнес с возможностью найма | JSON-LD `Organization` + `Person`; «О нас» остаётся; тон текстов выровнять (P1-10) |
| Q3 | Рынок | **Весь мир**, не только РФ | `x-default` → `/en`, `DEFAULT_LOCALE` → `en`, приоритет Google/Bing, EN-кластер ядра основной |
| Q4 | Цены | **USD:** сайты от **$250**, MVP от **$1000**, SaaS от **$6000**. Стек на странице обязателен | `Offer` c `priceCurrency: USD`; убрать `TODO_CONFIRM` и `от 500 000 ₽`; новое поле `stack` в `PricingContent` |
| Q5 | Индексация | **Всё под флагом `ALLOW_INDEXING=true`. По умолчанию — выключено** | Глобальный kill-switch: `robots.txt` + `<meta robots>`; включается одним флагом на запуске |

**Стек для `/pricing` (по Q4):** `supabase`, `nextjs`, `nestjs`, `react`, `threejs`, `prisma`, `clickhouse`, `duckdb`, `kafka`, `redis`, `postgres`.

> ⚠️ **Важно по Q5.** Формулировку «пока по умолчанию всё отключено» я реализую как **глобальный запрет индексации всего сайта** (не только AI-ботов): `robots.txt` отдаёт `Disallow: /` и на каждой странице ставится `<meta name="robots" content="noindex, nofollow">`. При `ALLOW_INDEXING=true` — открывается всё, включая `GPTBot` / `ClaudeBot` / `PerplexityBot` / `Google-Extended`.
> Если имелось в виду иное (например: обычные поисковики открыты, а под флагом только AI-краулеры) — скажите, это правка на 5 минут, но **последствия ошибки несимметричны**: лишний месяц под `noindex` стоит месяца роста, поэтому по умолчанию беру более строгий вариант, как вы и написали.
>
> **Двойное предупреждение о механике флага:** страницы у нас SSG, значит значение переменной **впекается в HTML на этапе сборки**. Смена `ALLOW_INDEXING` требует **пересборки и передеплоя**, а не просто рестарта. Забыть снять флаг на запуске = сайт остаётся невидимым для поиска при полностью выполненном плане. Поэтому пункт «снять флаг» вынесен в §11 отдельным блокирующим шагом.

---

### Этап 1 — Технический фундамент (P0) · 4–5 ч

Цель: сайт становится корректно индексируемым.

**1.1. Единый источник истины для URL** — новый файл `lib/seo.ts`:

```ts
// lib/seo.ts
import type { Locale } from './i18n'
import { LOCALES } from './i18n'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palisoft.ru'

/** Q5: глобальный рубильник индексации. Впекается на этапе сборки (SSG). */
export const INDEXING_ENABLED = process.env.ALLOW_INDEXING === 'true'

/** Q3: рынок — весь мир, поэтому «безъязыкий» краулер должен попадать на английскую версию */
export const X_DEFAULT_LOCALE: Locale = 'en'

export const OG_LOCALE: Record<Locale, string> = { ru: 'ru_RU', en: 'en_US' }

/** Абсолютный URL страницы в конкретной локали */
export const urlFor = (lang: Locale, path = '') => `${SITE_URL}/${lang}${path}`

/** Полный набор alternates: self-canonical + все локали + x-default */
export function alternatesFor(lang: Locale, path = '') {
  return {
    canonical: `/${lang}${path}`,
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])),
      'x-default': `/${X_DEFAULT_LOCALE}${path}`,
    },
  }
}

/** Q5: пока флаг не поднят — запрещаем индексацию на уровне каждой страницы */
export const robotsMeta = INDEXING_ENABLED
  ? undefined
  : { index: false, follow: false, nocache: true }
```

- [ ] Убрать хардкод домена из `app/robots.ts`, `app/sitemap.ts`, `app/[lang]/layout.tsx`; все три читают `SITE_URL`.
- [ ] Добавить `NEXT_PUBLIC_SITE_URL=https://palisoft.ru` и `ALLOW_INDEXING=false` в env продакшена и в `.env.example`.
- [ ] Удалить все комментарии `// TODO_CONFIRM домен`.
- [ ] **Q3:** `lib/i18n.ts` → `DEFAULT_LOCALE = 'en'`. Проверить, что `pickLocale` по-прежнему отдаёт `ru` при `Accept-Language: ru`, и что редирект с `/` работает в обе стороны.

**1.1-bis. Kill-switch индексации (Q5)** — добавить `robots: robotsMeta` в `generateMetadata` root-layout (наследуется всеми страницами, и здесь наследование работает *в нашу пользу*).

~~Защита от «забыли снять флаг» — падающая проверка в `next.config.ts`~~ — **отменено при внедрении.** Проверка требовала вторую переменную (`ALLOW_NOINDEX_BUILD`) только для того, чтобы обходить саму себя. Рубильник один: `ALLOW_INDEXING` — открыто или закрыто.

- [ ] Пока сайт не готов — ничего не задавать, дефолт закрыт
- [ ] На запуске — `ALLOW_INDEXING=true`, **пересобрать и передеплоить**

**1.2. Исправить canonical и hreflang на каждой странице** — в каждый `generateMetadata` добавить `alternates: alternatesFor(lang, '/works')` и т.д. Это единственный способ: наследование от layout здесь работает против нас.

- [ ] `app/[lang]/layout.tsx` → `alternatesFor(lang)` (главная)
- [ ] `works`, `about`, `articles`, `pricing`, `cv`, `contacts` → каждая со своим `path`
- [ ] Добавить `openGraph.locale` / `alternateLocale`

**1.3. Переписать sitemap** (`app/sitemap.ts`):

```ts
import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n'
import { SITE_URL } from '@/lib/seo'

const ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'monthly' as const },
  { path: '/works', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/cv', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/articles', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/contacts', priority: 0.6, changeFrequency: 'yearly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((lang) =>
    ROUTES.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: new Date(BUILD_TIME),   // из env, не Date.now() в рантайме
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
        ),
      },
    }))
  )
}
```

- [ ] Добавить `lastModified` (взять из git-времени изменения соответствующего JSON или из времени билда)
- [ ] Добавить `alternates.languages` (нативная поддержка, см. docs `sitemap.md` → «Generate a localized Sitemap»)
- [ ] Добавить `priority` / `changeFrequency`

**1.4. robots.ts с рубильником (Q5):**

```ts
import type { MetadataRoute } from 'next'
import { SITE_URL, INDEXING_ENABLED } from '@/lib/seo'

const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Google-Extended', 'Applebot-Extended',
  'CCBot', 'Bytespider', 'Amazonbot', 'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    // Всё закрыто, sitemap не публикуем — чтобы не приглашать обход
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' }, // /_next/ не закрывать!
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
```

> Заметка: `robots.txt` — это *просьба*, а не защита. Пока сайт закрыт, полагаться стоит на `<meta robots noindex>` (п. 1.1-bis) — он надёжнее, потому что действует и на уже обойдённые страницы. Если нужна настоящая приватность до запуска — только HTTP-аутентификация на уровне хостинга.

**1.5. Отключить sitemap, пока индексация закрыта** — чтобы `/sitemap.xml` не оставался живой картой закрытого сайта:

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  if (!INDEXING_ENABLED) return []
  // …
}
```

**Критерий приёмки этапа 1** (собрать с `ALLOW_INDEXING=true`, иначе проверять нечего):

```bash
ALLOW_INDEXING=true pnpm build
grep -o '<link rel="canonical"[^>]*>' .next/server/app/ru/works.html
# → href="https://palisoft.ru/ru/works"
grep -c 'hrefLang' .next/server/app/ru/works.html      # → 3 (ru, en, x-default)
grep 'x-default' .next/server/app/en/pricing.html      # → href=".../en/pricing"
cat .next/server/app/sitemap.xml.body | grep -c '<url>' # → 14
```

Плюс сборка **без** флага: во всех HTML должен появиться `<meta name="robots" content="noindex, nofollow">`, `robots.txt` → `Disallow: /`, `sitemap.xml` — пустой.

---

### Этап 2 — Соцсети и структурированные данные · 5–6 ч

**2.1. Open Graph / Twitter на всех страницах.** Общий хелпер в `lib/seo.ts`:

```ts
export function metaFor(lang: Locale, path: string, title: string, description: string): Metadata {
  return {
    title, description,
    robots: robotsMeta,                      // Q5: kill-switch
    alternates: alternatesFor(lang, path),
    openGraph: {
      type: 'website', url: urlFor(lang, path), title, description,
      siteName: 'Palisoft',                  // Q2: бренд студии, не имя
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter(l => l !== lang).map(l => OG_LOCALE[l]),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
```

**2.2. Динамические OG-картинки** через `ImageResponse` из `next/og` (file convention `opengraph-image.tsx`, см. docs `opengraph-image.md`):

- [ ] `app/[lang]/opengraph-image.tsx` — 1200×630, фон `#0a0a0b`, монограмма YP, имя + роль, шрифт Geist из `assets/`
- [ ] `app/[lang]/works/opengraph-image.tsx`, `/cv`, `/pricing` — свои заголовки
- [ ] Позже — по одной на каждый проект (`/works/[slug]/opengraph-image.tsx`) со скриншотом проекта
- [ ] Добавить `opengraph-image.alt.txt` рядом с каждой
- [ ] Удалить неиспользуемый `public/favicon/og-preview-256.png`

**2.3. JSON-LD.** Новый `components/seo/JsonLd.tsx` + генераторы схем в `lib/schema.ts`:

```tsx
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'), // защита от XSS-инъекции
      }}
    />
  )
}
```

- [ ] **`Organization` + `Person` + `WebSite`** — в `app/[lang]/layout.tsx`, одним графом через `@graph` с перекрёстными `@id`-ссылками (см. набросок ниже)
- [ ] `BreadcrumbList` — во все внутренние страницы (генерировать из `nav.json`)
- [ ] `ItemList` + `CreativeWork` — `/works` (из `works.json`)
- [ ] `Service` + `Offer` (**`priceCurrency: 'USD'`**, `price`: 250 / 1000 / 6000) — `/pricing` (из `pricing.json`)
- [ ] `ProfilePage` — `/about` и `/cv`
- [ ] `ContactPage` — `/contacts`

Набросок корневого графа (Q2 + Q3):

```ts
// lib/schema.ts
export const rootGraph = (lang: Locale) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#organization`,
      name: 'Palisoft',
      url: SITE_URL,
      description: getSite(lang).description,
      founder: { '@id': `${SITE_URL}/#person` },
      employee: { '@id': `${SITE_URL}/#person` },
      areaServed: { '@type': 'Place', name: 'Worldwide' },   // Q3
      availableLanguage: ['en', 'ru'],
      priceRange: '$250–$6000+',                              // Q4
      sameAs: [/* GitHub, LinkedIn, dev.to, X, npm — см. Q6 */],
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: getSite(lang).name,
      jobTitle: getSite(lang).role,
      worksFor: { '@id': `${SITE_URL}/#organization` },
      knowsAbout: [/* плоский стек из cv.json */],
      sameAs: [/* личные профили */],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      inLanguage: lang,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
})
```

> ⚠️ По `Offer`: Google показывает цены в расширенных сниппетах в основном для `Product`, а не для `Service`. Разметка полезна (её читают AI-ассистенты и она уточняет сущность), но **рассчитывать на «цены прямо в выдаче Google» не стоит** — это не тот тип, где они стабильно появляются. Пишу прямо, чтобы не было ложных ожиданий от этого пункта.

**2.4. Верификация площадок:**
- [ ] `verification: { google: '…', other: { 'msvalidate.01': '…' }, yandex: '…' }` в метаданных layout (порядок приоритета по Q3: Google → Bing → Яндекс)

**Критерий приёмки:** валидация в Google Rich Results Test и Schema.org Validator — без ошибок; превью ссылки в Telegram и LinkedIn Post Inspector показывает картинку 1200×630.

---

### Этап 3 — Контент и архитектура · 10–14 ч

Здесь появляется реальный органический трафик.

**Приоритет локалей изменён (Q3):** EN-версия каждой страницы теперь первична. Русский перевод делается вторым и не блокирует публикацию. Отдельно заложите вычитку EN-текстов носителем или хотя бы прогон через качественный редактор — при мировом позиционировании неестественный английский на коммерческой странице стоит дороже, чем любая техническая недоработка из этого плана.

**3.0. Наполнить `/pricing` (Q4)** · 1.5 ч — быстрый и заметный результат, делать первым.

- [ ] `types/content.ts` → `PricingTier`: заменить `price: string` на `price: number | null` + `currency: 'USD'` (нужно для `Offer`, строку «от $250» собирать на рендере)
- [ ] `types/content.ts` → `PricingContent`: добавить `stack: { group: string; items: string[] }[]`
- [ ] `content/{ru,en}/pricing.json`: `landing` → 250, `mvp` → 1000, `complex` → 6000; убрать оба `TODO_CONFIRM` и `«от 500 000 ₽»`
- [ ] Убрать ветку `tier.price === 'TODO_CONFIRM' ? onRequest : …` из [app/[lang]/pricing/page.tsx:20](app/%5Blang%5D/pricing/page.tsx#L20)
- [ ] Добавить блок стека на страницу: `supabase`, `nextjs`, `nestjs`, `react`, `threejs`, `prisma`, `clickhouse`, `duckdb`, `kafka`, `redis`, `postgres`
- [ ] Сгруппировать стек осмысленно (Frontend / Backend / Данные / Инфраструктура) — плоский список из 11 слов хуже читается и хуже работает как семантика
- [ ] Синхронизировать стек с портфолио (P1-11): дописать `Supabase` + `Redis` в `kvartly`, `Supabase` в `palirent`, `Supabase`/`Three.js` в `cv.json` — сейчас реальный стек в контенте занижен
- [ ] `Offer` JSON-LD с `priceCurrency: 'USD'` (Этап 2.3)

> Про валюту: цены в USD при ИП в РФ — нормальная практика для экспорта услуг, но на странице стоит одной строкой указать, в чём происходит расчёт (USD / рубли по курсу / крипта), иначе первый же вопрос заказчика — «а как платить». Это вопрос конверсии, а не SEO, но страница коммерческая.

**3.1. Страницы проектов `/[lang]/works/[slug]`** — главный прирост.

- [ ] Роут `app/[lang]/works/[slug]/page.tsx` с `generateStaticParams()` по локалям × слагам
- [ ] Расширить `WorkItem` в [types/content.ts](types/content.ts): `body: string[]` (300–600 слов на проект), `problem`, `solution`, `result`, `seoTitle`, `seoDescription`
- [ ] Наполнить в `content/{ru,en}/works.json` — **самая трудоёмкая часть, но и самая ценная**
- [ ] На `/works` карточки становятся ссылками на детальные страницы (сейчас ведут наружу — внешние ссылки оставить, но добавить внутреннюю «Подробнее →»)
- [ ] Осмысленные `alt` из `item.title` + контекста скриншота (исправляет P1-2)
- [ ] Добавить в sitemap + `BreadcrumbList` + собственная OG-картинка
- [ ] Кросс-линковка: «Похожие проекты» по пересечению `stack`

**3.2. Свои статьи `/[lang]/articles/[slug]`**

- [ ] Роут + типы (`ArticleItem` расширить: `slug`, `body`, `publishedAt`, `updatedAt`, `readingTime`)
- [ ] Перенести 3 существующие статьи как canonical-версии на свой домен; на dev.to/vc.ru/Хабре добавить «Оригинал: …»
- [ ] `Article` JSON-LD с `datePublished`/`dateModified`/`author`
- [ ] RSS-фид `app/[lang]/articles/feed.xml/route.ts`
- [ ] План на 6 статей из кластера C (§6) — по одной в 2 недели

**3.3. Текстовый блок на главной**
- [ ] Под hero — секция «Чем занимаюсь» + 4 ключевых проекта ссылками + CTA. 200–300 слов. Решает P1-9 и усиливает перелинковку.

**3.4. Оптимизация title/description**
- [ ] Ввести `seoTitle`/`seoDescription` в каждый `content/{ru,en}/*.json`
- [ ] Заполнить по всем 12 страницам под 50–60 / 140–160 символов с ключами из §6
- [ ] `generateMetadata` берёт их, а `<h1>` продолжает использовать короткий `title`

**3.5. Тон, локализация и правки семантики**
- [ ] ~~«О нас» → «Обо мне»~~ — **отменено (Q2)**, «О нас» остаётся
- [ ] Вместо этого: выровнять «мы/я» по правилу из P1-10 — «мы» на главной, `/works`, `/pricing`, `/contacts`; «я» на `/cv` и в личном блоке `/about`
- [ ] Обновить `contacts.json` под мировой рынок (Q3): вынести вперёд «Remote, worldwide», локацию оставить, но не как первый факт
- [ ] `<time dateTime>` в `CvTimeline` и `WorkCard`
- [ ] Должности в CV → `<h3>`
- [ ] Локализованная 404: пробросить `lang`, добавить `robots: { index: false }`, ссылку `← /${lang}`
- [ ] `app/[lang]/[...rest]/page.tsx` — добавить `generateMetadata` с `noindex`

**3.6. Чистка**
- [ ] Удалить `public/favicon/site.webmanifest` (дубль с битыми путями)
- [ ] `manifest.start_url: '/en'` (Q3 — было `/`, редирект; `/en` вместо `/ru`, т.к. рынок мировой)
- [ ] `manifest.name` → «Palisoft — …» (Q2, бренд студии)
- [ ] Проверить, нужен ли `components/hero/HeroPlaceholder.tsx` (похоже, мёртвый код со Stage-1)
- [ ] `agencidev-stack-roadmap.md`, `stage-1-skeleton-plan.md`, `seo-plan.md` в корне — не индексируются (не в `public`), но стоит убрать в `docs/`

---

### Этап 4 — Производительность / CWV · 3–4 ч

- [ ] Сжать `public/hdri/studio.hdr` (1.5 МБ → ~100 КБ): понизить разрешение или перевести в `.ktx2`
- [ ] `priority` + `fetchPriority="high"` на первой карточке `/works`
- [ ] `next.config.ts`: `images: { formats: ['image/avif','image/webp'] }`, `poweredByHeader: false`, `compress: true`
- [ ] `headers()` — `Cache-Control: public, max-age=31536000, immutable` для `/works/*`, `/hdri/*`, `/logo/*`
- [ ] Замерить бандл: `pnpm build` + анализ; при необходимости догрузка `drei`-хелперов по требованию
- [ ] Прогнать PageSpeed Insights по всем 6 страницам (mobile + desktop), зафиксировать базовые цифры
- [ ] Цель: LCP < 2.5 c, INP < 200 мс, CLS < 0.1 на mobile

---

### Этап 5 — Внешнее SEO и мониторинг · 2–3 ч + постоянно

> ⛔ **Всё в этом этапе выполняется только после `ALLOW_INDEXING=true` (Q5).** Подтверждать домен и отправлять sitemap при активном `noindex` бессмысленно: панели просто зафиксируют «страница исключена тегом noindex», и это придётся расчищать. Единственное исключение — аналитику можно подключить раньше.

- [ ] **Google Search Console** — приоритет №1 (Q3): подтвердить домен, отправить sitemap, проверить «Индексирование страниц», выставить международный таргетинг (для `.ru` — убедиться, что не стоит привязка к региону)
- [ ] **Bing Webmaster Tools** — приоритет №2: питает ChatGPT Search и Copilot; импорт из GSC занимает 2 минуты
- [ ] **Яндекс.Вебмастер** — приоритет №3: подтвердить, отправить sitemap, **региональность → «не имеет региональной принадлежности»** (не «Сочи»! иначе показы сузятся до региона)
- [ ] IndexNow: ключ в `public/<key>.txt` + пинг при деплое (работает для Bing и Яндекса; Google IndexNow не поддерживает)
- [ ] Аналитика: Plausible или GA4 (основной вариант при мировом рынке); Яндекс.Метрика — опционально, ради Вебвизора по русскому трафику
- [ ] Обратные ссылки — двусторонняя связка с `sameAs`. Приоритет пересобран под Q3:
  - **Высокий (EN):** GitHub профиль `ProjectINT` → сайт в bio + README `palistor`/`paliproxy`; npm-страницы пакетов → `homepage` на домен; dev.to; LinkedIn; X
  - **Средний (EN):** Hacker News / Reddit при запуске `palistor` (только как участник обсуждения, не как спам); Product Hunt; awesome-списки по React/state-management — PR с ссылкой на `palistor`
  - **Низкий (RU):** vc.ru, Хабр (перенести статью из песочницы в основной раздел), Хабр Карьера
  - ~~301-редирект второго домена~~ — **снято (Q1: домен один)**

**Мониторинг (ежемесячно):**
- позиции по ядру §6 (отдельно EN и RU), охват индексации в GSC/Bing/Вебмастере, CWV в GSC, битые ссылки, органический трафик и конверсии в обращения

---

## 8. Вопросы: статус

**Закрыты:** Q1 (домен `palisoft.ru`), Q2 («мы», Organization + Person), Q3 (весь мир, EN-first), Q4 (цены в USD + стек), Q5 (kill-switch индексации). Детали — в Этапе 0.

**Остались открытыми** (не блокируют старт Этапа 1, но понадобятся дальше):

| # | Вопрос | Когда понадобится | Что будет, если не ответить |
|---|---|---|---|
| Q6 | **Список профилей для `sameAs`:** точные URL — LinkedIn, X, npm-пакеты (`palistor`, `paliproxy` опубликованы?), Telegram-канал, dev.to, Product Hunt | Этап 2.3 | Разметка `Organization`/`Person` будет неполной, Knowledge Panel не соберётся |
| Q7 | Готовы писать статьи — 1 раз в 2 недели? | Этап 3.2 | Кластер B-en (главный источник органики) не запустится; тогда честнее убрать раздел статей, чем держать 3 внешние ссылки |
| Q8 | **`/cv` оставляем?** Сайт обслуживает две воронки: заказчики (`/pricing`) и работодатели (`/cv` с «ожидания 250 000 ₽ net»). При позиционировании «мы» + мировой рынок это может подрывать ценник | Этап 3.5 | Оставлю как есть — обе воронки работают параллельно |
| Q9 | Юридическое имя бренда: «Palisoft» как название студии подтверждаете? Оно пойдёт в `Organization.name`, `og:site_name`, PWA-манифест | Этап 2.3 | Возьму «Palisoft» из домена |
| Q10 | Нужен ли раздел FAQ на `/pricing` (что входит, сроки, как платить, кто владеет кодом)? | Этап 3 | Пропущу; но это дешёвый способ закрыть возражения и получить `FAQPage`-разметку |

---

## 9. Сводка приоритетов

| Приоритет | Что | Трудозатраты | Эффект |
|---|---|---|---|
| 🔴 P0 | Домен, canonical, hreflang, sitemap, robots, kill-switch, `DEFAULT_LOCALE=en` | 5–6 ч | Сайт становится индексируемым. **Без этого всё остальное бессмысленно** |
| 🔴 P0 | Open Graph + OG-картинки | 3–4 ч | ×2–3 CTR при шеринге ссылки |
| 🟠 P1 | Цены + стек на `/pricing` (Q4) | 1.5 ч | коммерческая страница наконец продаёт |
| 🟠 P1 | JSON-LD (Organization + Person, Breadcrumbs, Offer) | 2–3 ч | Knowledge Panel, понимание сущностей |
| 🟠 P1 | Страницы проектов `/works/[slug]` | 6–8 ч | +22 URL, ×3 объём индекса |
| 🟠 P1 | `alt` у изображений | 0.5 ч | трафик из Картинок, a11y |
| 🟠 P1 | Title/description по ядру (EN-first) | 2 ч | +CTR из выдачи |
| 🟡 P2 | Свои статьи + RSS (кластер B-en) | 4 ч + контент | долгосрочный органический трафик — **главный рычаг** |
| 🟡 P2 | HDRI и CWV | 3–4 ч | ранжирование + UX |
| 🟡 P2 | GSC / Bing / Вебмастер / аналитика | 2 ч | измеримость |
| 🟡 P2 | Вычитка EN-текстов носителем | вне разработки | доверие мирового заказчика |

**Итого до «хорошо»: ~17 ч (этапы 1–2 + 3.0). До «отлично»: ~37 ч (этапы 1–5).**

---

## 10. Порядок работ

```
Этап 0 ✅ (решения приняты)
   ↓
Этап 1 (P0: индексируемость, всё ещё под noindex)
   ↓
Этап 2 (OG + JSON-LD)  +  Этап 3.0 (цены и стек — быстро и заметно)
   ↓
🚩 СНЯТЬ ФЛАГ: ALLOW_INDEXING=true → пересборка → передеплой
   ↓
Этап 5 (GSC → Bing → Вебмастер: сразу после снятия флага, чтобы копить историю)
   ↓
Этап 3 (контент: /works/[slug], статьи)  ⇄  Этап 4 (CWV)
```

Ключевое отличие от исходного плана: раньше панели вебмастеров подключались сразу после Этапа 1. Теперь между ними стоит **снятие флага индексации** — подключать GSC к сайту под `noindex` бессмысленно.

---

## 11. Что нужно, чтобы начать

### Можно начинать прямо сейчас (ничего не ждём)

Этапы 1, 2 и 3.0 полностью разблокированы принятыми решениями — это ~11 ч работы, которая не зависит ни от одного открытого вопроса. Единственное место, где всплывёт Q6, — список `sameAs`; его можно оставить заглушкой и дозаполнить.

### Нужно от вас — данные

1. **URL профилей для `sameAs`** (Q6): LinkedIn, X, npm (`palistor` / `paliproxy` опубликованы в реестре?), Telegram-канал, dev.to. Уже есть в контенте: GitHub `ProjectINT`, Telegram `@yurapalienko`, vc.ru, Хабр.
2. **Подтверждение бренда** (Q9): «Palisoft» — верное название? Оно попадёт в `og:site_name`, JSON-LD и PWA.
3. **Валюта расчётов** — как заказчик платит (USD-перевод / рубли по курсу / что-то ещё). Одна строка на `/pricing`.
4. **Ревизия стека по всем 11 проектам** (P1-11). По `kvartly` / `palirent` уже уточнено: Supabase и Redis есть, но в `works.json` не записаны. Остальные девять почти наверняка занижены так же — пройдите список и скажите, что дописать. Это чистая семантика, которая сейчас теряется.

### Нужно от вас — доступы

5. **Хостинг / деплой:** где живёт `palisoft.ru` (Vercel, VPS, что-то ещё)? Нужно, чтобы прописать env-переменные `NEXT_PUBLIC_SITE_URL` и `ALLOW_INDEXING` и понимать, как проходит пересборка. По HTTP отсюда домен отвечает 404 через самоподписанный сертификат — похоже на перехват TLS средой, так что реального состояния деплоя я не знаю.
6. **Google-аккаунт** для Search Console и **аккаунт Bing** — понадобятся на Этапе 5 (после снятия флага). Верификационные коды вставляются в метаданные, то есть требуют деплоя.
7. **Решение по аналитике**: Plausible (платный, приватный) или GA4 (бесплатный) — от этого зависит, что встраивать.

### Нужно от вас — решения

8. **Q7 — статьи.** Это единственный пункт, который определяет, будет ли у сайта органический трафик вообще. Готовы к ритму «одна статья в 2 недели»? Если нет — скажите, и я перестрою план: уберу кластер B-en из приоритетов и переложу вес на портфолио и внешние площадки. Честно: без контента потолок сайта — брендовые запросы и прямые заходы.
9. **Q8 — судьба `/cv`** (две воронки на одном сайте) и **Q10 — FAQ на `/pricing`**. Оба не блокируют, у обоих есть разумный дефолт.

### Порядок, который я предлагаю

Начать с Этапа 1 сегодня — он механический, ни от чего не зависит и снимает три критические ошибки. Параллельно вы собираете список из пунктов 1–4. К моменту, когда дойдём до Этапа 2, данные будут на руках.

**Скажите «начинаем» — и я приступлю к Этапу 1.**
