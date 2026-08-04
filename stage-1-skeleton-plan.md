# Этап 1. Скелет сайта — детальный план реализации

Исполнитель: модель Fable. Читать целиком до начала работы.
Референс: https://www.agencidev.com/ · Роадмап: [agencidev-stack-roadmap.md](agencidev-stack-roadmap.md)

---

## 0. Контекст и принятые решения

| Решение | Значение | Почему |
|---|---|---|
| Структура | Отдельные роуты, не one-page | Как в референсе; своя metadata на раздел; на Этапе 2 3D-сцена вешается только на `/` |
| Языки | RU + EN, переключатель | Аудитория RU (цены в ₽, CV на русском), но референс-позиционирование англоязычное |
| Hero | CSS/SVG-заглушка с типографикой | Ноль веса, не блокирует этап; на Этапе 2 заменяется на R3F-сцену |
| CMS | Нет. Контент — JSON в `content/` | Явное требование |
| Рендеринг | Полный SSG (`generateStaticParams`) | Статика, ноль запросов в рантайме |

**Стек, который уже стоит и который НЕ трогаем:** Next.js `16.2.12`, React `19.2.4`, Tailwind CSS `4.3.3` (через `@tailwindcss/postcss`, конфиг-файла нет — тема живёт в CSS), TypeScript 5, ESLint 9 flat config, pnpm.

**Новых зависимостей на этом этапе не ставим.** Ни `gsap`, ни `lenis`, ни `three`, ни библиотек i18n. Всё делается штатным Next.js + Tailwind.

> ⚠️ Это Next.js 16, а не тот, что в твоих обучающих данных. Перед написанием кода прочитай нужный гайд в `node_modules/next/dist/docs/01-app/`. Ключевые ломающие изменения выписаны в разделе 5 — сверься с ним обязательно.

---

## 1. Целевая структура файлов

```
app/
├── globals.css                      # тема Tailwind v4 через @theme, шрифтовые переменные
├── favicon.ico                      # уже есть, оставляем
├── [lang]/
│   ├── layout.tsx                   # ★ ROOT LAYOUT: <html>/<body>, шрифты, боковое меню
│   ├── page.tsx                     # /ru · /en          — hero-заглушка
│   ├── not-found.tsx                # 404 внутри layout
│   ├── works/page.tsx               # /ru/works
│   ├── about/page.tsx               # /ru/about
│   ├── articles/page.tsx            # /ru/articles
│   ├── pricing/page.tsx             # /ru/pricing
│   ├── cv/page.tsx                  # /ru/cv
│   └── contacts/page.tsx            # /ru/contacts
├── sitemap.ts
└── robots.ts

proxy.ts                             # ★ НЕ middleware.ts — редирект / → /ru|/en

lib/
├── i18n.ts                          # LOCALES, DEFAULT_LOCALE, isLocale(), pickLocale()
└── content.ts                       # типизированный доступ к JSON

types/
└── content.ts                       # интерфейсы контента

content/
├── ru/{site,nav,works,about,articles,pricing,cv,contacts}.json
└── en/{site,nav,works,about,articles,pricing,cv,contacts}.json

components/
├── layout/
│   ├── SideNav.tsx                  # десктопный левый рельс (server)
│   ├── NavList.tsx                  # "use client" — ссылки + активный пункт
│   ├── MobileNav.tsx                # "use client" — бургер + выезжающая слева шторка
│   ├── LocaleSwitcher.tsx           # "use client"
│   └── Footer.tsx
├── hero/HeroPlaceholder.tsx
├── ui/{PageShell,PageHeader,Tag,Card,ExternalLink}.tsx
├── works/WorkCard.tsx
└── cv/{CvTimeline,CvStack,CvFacts}.tsx

public/
└── cv/yuri-palienko-fullstack-tl.pdf   # ★ переложить из корня, имя латиницей
```

**Удаляются:** `app/layout.tsx`, `app/page.tsx` (их содержимое заменяется), демо-SVG из `public/` (`next.svg`, `vercel.svg`, `globe.svg`, `window.svg`, `file.svg`).

---

## 2. Данные

### 2.1 Правила схемы

- Один JSON = один раздел = один экран. Ключи **идентичны** в `ru/` и `en/`.
- **Никаких строковых литеральных юнионов** в типах (`type: 'saas' | 'marketplace'` — нельзя). TS выводит из JSON просто `string`, и присваивание `const x: WorksContent = json` упадёт. Все такие поля — обычный `string`.
- Ссылки, даты, числа, слаги, названия технологий — **не переводятся**, лежат одинаковыми в обеих локалях. Дублирование осознанное: так проще, чем разносить «общее» и «переводимое».
- Порядок элементов в массиве = порядок на экране. Сортировки в рантайме нет.

### 2.2 `types/content.ts`

```ts
export interface SiteContent {
  name: string
  role: string
  tagline: string
  description: string      // для <meta name="description">
}

export interface NavItem {
  href: string             // '/works' — БЕЗ префикса локали
  label: string
  index: string            // '01' — порядковый номер для вертикального меню
}

export interface NavContent {
  items: NavItem[]
}

export interface WorkItem {
  slug: string
  title: string
  url: string | null
  role: string
  period: string
  company: string
  summary: string
  highlights: string[]
  stack: string[]
  featured: boolean
}

export interface WorksContent {
  title: string
  intro: string
  items: WorkItem[]
}

export interface AboutContent {
  title: string
  lead: string
  paragraphs: string[]
  facts: { label: string; value: string }[]
  links: { label: string; url: string }[]
}

export interface ArticleItem {
  title: string
  platform: string
  url: string
  summary: string
  lang: string             // 'en' | 'ru' — но тип именно string, см. правила
}

export interface ArticlesContent {
  title: string
  intro: string
  items: ArticleItem[]
}

export interface PricingTier {
  slug: string
  title: string
  price: string
  priceNote: string
  summary: string
  includes: string[]
  featured: boolean
}

export interface PricingContent {
  title: string
  intro: string
  tiers: PricingTier[]
  note: string
}

export interface CvJob {
  company: string
  companyNote: string
  role: string
  period: string
  duration: string
  summary: string
  bullets: string[]
  stack: string[]
  current: boolean
}

export interface CvContent {
  title: string
  intro: string
  pdfUrl: string
  pdfLabel: string
  profile: string
  facts: { label: string; value: string }[]
  jobs: CvJob[]
  stack: { group: string; items: string[] }[]
  education: { year: string; title: string; note: string }[]
}

export interface ContactsContent {
  title: string
  intro: string
  channels: { label: string; value: string; url: string; primary: boolean }[]
  location: string
  availability: string
}
```

### 2.3 Готовый контент RU (взят из CV, вставлять как есть)

> Всё ниже — реальные данные из `Палиенко_Юрий_Алексеевич_CV_Fullstack_TL.pdf` и из роадмапа. Ничего не выдумывать сверх этого. Места, требующие подтверждения владельца, помечены `TODO_CONFIRM` — оставить эту строку в JSON как есть, чтобы её было видно на странице и легко найти грепом.

**`content/ru/site.json`**
```json
{
  "name": "Юрий Палиенко",
  "role": "Full-Stack Architect & Team Lead",
  "tagline": "Проектирую и довожу до продакшена SaaS-платформы и маркетплейсы — от архитектуры до сотен B2B-клиентов",
  "description": "Full-Stack JavaScript архитектор и Team Lead. Node.js / NestJS / React. SaaS-платформы и маркетплейсы с нуля до продакшена."
}
```

**`content/ru/nav.json`**
```json
{
  "items": [
    { "index": "01", "href": "/works",    "label": "Работы" },
    { "index": "02", "href": "/about",    "label": "О нас" },
    { "index": "03", "href": "/articles", "label": "Статьи" },
    { "index": "04", "href": "/pricing",  "label": "Цены" },
    { "index": "05", "href": "/cv",       "label": "Резюме" },
    { "index": "06", "href": "/contacts", "label": "Контакты" }
  ]
}
```

**`content/ru/works.json`** — 11 карточек. Порядок = порядок вывода.

```json
{
  "title": "Работы",
  "intro": "10+ лет: SaaS-платформы, маркетплейсы, BI-системы и собственные продукты.",
  "items": [
    {
      "slug": "toprentapp",
      "title": "toprentapp.com",
      "url": "https://toprentapp.com",
      "role": "Team Lead",
      "period": "2020 — 2025",
      "company": "Laflei ltd, Рим",
      "summary": "SaaS для управления автопарками и арендными компаниями. Построена с нуля, выросла до 500+ корпоративных клиентов с ростом 20% в год.",
      "highlights": [
        "Платформа с нуля до 500+ корпоративных клиентов",
        "Устойчивый рост 20% в год",
        "Кастомная UI-библиотека с динамической темой",
        "Stripe, Firebase (auth и нотификации), Cloudinary"
      ],
      "stack": ["React", "Next.js", "Relay", "Redux", "Zustand", "Node.js", "NestJS", "PostgreSQL", "Kafka", "GraphQL", "Firebase", "Stripe", "Vercel"],
      "featured": true
    },
    {
      "slug": "billionrent",
      "title": "billionrent.com",
      "url": "https://billionrent.com",
      "role": "Team Lead",
      "period": "2020 — 2025",
      "company": "Laflei ltd, Рим",
      "summary": "B2C-маркетплейс аренды автомобилей с интеграцией внешних автопарков через API.",
      "highlights": [
        "Интеграция внешних автопарков через API",
        "Адаптивные embed-виджеты бронирования для партнёрских сайтов",
        "Модуль «Сайт в один клик» — автогенерация лендингов для арендных компаний"
      ],
      "stack": ["Next.js", "React", "GraphQL", "Node.js", "PostgreSQL", "FaunaDB", "Nginx"],
      "featured": true
    },
    {
      "slug": "bi-platform",
      "title": "BI-система уровня Power BI",
      "url": null,
      "role": "Full-Stack Developer",
      "period": "2026",
      "company": "Colvir Software Solutions",
      "summary": "Система бизнес-аналитики уровня Microsoft Power BI. Пересобрал ядро: разделил клиентскую и серверную части, что дало ощутимый прирост производительности.",
      "highlights": [
        "AI-агент для управления приложением и данными — harness с инструментами, субагентами и системой памяти",
        "DuckDB на клиенте — аналитика прямо в браузере",
        "ClickHouse на бэкенде для больших объёмов данных",
        "Редактор формул на основе токенизации"
      ],
      "stack": ["NestJS", "TypeScript", "Prisma", "ClickHouse", "DuckDB", "React", "AI Agents"],
      "featured": true
    },
    {
      "slug": "egesto",
      "title": "egesto.ru",
      "url": "https://egesto.ru",
      "role": "Founder & Developer",
      "period": "2025 — наст. время",
      "company": "ИП Палиенко",
      "summary": "AI-платформа для подготовки к ЕГЭ по английскому языку.",
      "highlights": [],
      "stack": ["Next.js", "NestJS", "TypeScript", "OpenAI", "PostgreSQL"],
      "featured": true
    },
    {
      "slug": "kvartly",
      "title": "kvartly.com",
      "url": "https://kvartly.com",
      "role": "Founder & Developer",
      "period": "2025 — наст. время",
      "company": "ИП Палиенко",
      "summary": "Маркетплейс недвижимости в Грузии, модель лидогенерации.",
      "highlights": [],
      "stack": ["Next.js", "NestJS", "TypeScript", "PostgreSQL"],
      "featured": true
    },
    {
      "slug": "palirent",
      "title": "pali.rent",
      "url": "https://pali.rent",
      "role": "Founder & Developer",
      "period": "2025 — наст. время",
      "company": "ИП Палиенко",
      "summary": "SaaS-платформа для арендных компаний.",
      "highlights": [],
      "stack": ["Next.js", "NestJS", "TypeScript", "PostgreSQL"],
      "featured": false
    },
    {
      "slug": "palistor",
      "title": "palistor",
      "url": "https://github.com/ProjectINT",
      "role": "Автор",
      "period": "2025 — наст. время",
      "company": "Open source",
      "summary": "Собственный React-фреймворк: декларативный MVVM, спроектированный так, чтобы с ним было удобно работать AI-агентам.",
      "highlights": [],
      "stack": ["TypeScript", "React"],
      "featured": true
    },
    {
      "slug": "paliproxy",
      "title": "paliproxy",
      "url": "https://github.com/ProjectINT",
      "role": "Автор",
      "period": "2025 — наст. время",
      "company": "Open source",
      "summary": "Прокси-инструмент для разработки.",
      "highlights": [],
      "stack": ["Node.js", "TypeScript"],
      "featured": false
    },
    {
      "slug": "elit-taxi",
      "title": "CRM для службы такси",
      "url": null,
      "role": "React Middle Developer",
      "period": "2019 — 2020",
      "company": "Элит такси",
      "summary": "CRM-система для службы такси: диспетчеризация, карты, отчётность.",
      "highlights": [],
      "stack": ["React", "Redux", "Redux-Saga", "Ant Design", "OpenStreetMap"],
      "featured": false
    },
    {
      "slug": "topjsurfing",
      "title": "Topjsurfing",
      "url": null,
      "role": "Developer",
      "period": "2018 — 2019",
      "company": "Topjsurfing",
      "summary": "Перенёс фронтенд интернет-магазина с jQuery на Next.js. Магазин вышел в лидеры ниши за счёт скорости, валидности и SEO.",
      "highlights": [
        "Отзывы, интеграции с CRM, PDF-счета, email-уведомления"
      ],
      "stack": ["Next.js", "Keystone.js"],
      "featured": false
    },
    {
      "slug": "freelance",
      "title": "Фриланс: сайты для автопроката, недвижимости и туризма",
      "url": null,
      "role": "Программист, вебмастер",
      "period": "2015 — 2018",
      "company": "Фриланс",
      "summary": "zapstroy.ru (Nuxt.js), estiacard.com (Next.js), somnium.su (Vue SSR), barcelonasupercars.com, monacosupercar.com, taketesla.com.",
      "highlights": [],
      "stack": ["JavaScript", "Vue/Nuxt", "Next.js", "jQuery", "WordPress", "Gulp", "Pug", "Stylus"],
      "featured": false
    }
  ]
}
```

**`content/ru/about.json`**
```json
{
  "title": "О нас",
  "lead": "Full-Stack JavaScript архитектор и Team Lead. Специализируюсь на проектировании и доставке SaaS-платформ и маркетплейсов с нуля до продакшена.",
  "paragraphs": [
    "10+ лет в разработке, 4+ года Team Lead. Глубокая экспертиза в backend-архитектуре на Node.js и NestJS, event-driven системах и высоконагруженных решениях.",
    "Четыре года вёл распределённую команду в Риме: архитектурные решения, код-ревью, менторство. Удержал стабильность платформы под растущую нагрузку — она выросла до 500+ корпоративных клиентов.",
    "Сейчас — собственные продукты в EdTech, PropTech и SaaS, плюс open source: palistor (декларативный MVVM-фреймворк для React) и paliproxy.",
    "Отдельное направление — AI-агенты в продакшене: harness с инструментами, субагентами и системой памяти для управления приложением и данными."
  ],
  "facts": [
    { "label": "Опыт", "value": "10+ лет · 4+ года Team Lead" },
    { "label": "Формат", "value": "Удалённо, готов к командировкам" },
    { "label": "Языки", "value": "Русский — родной · Английский — B2" },
    { "label": "База", "value": "Сочи, РФ" }
  ],
  "links": [
    { "label": "GitHub — ProjectINT", "url": "https://github.com/ProjectINT" }
  ]
}
```

**`content/ru/articles.json`**
```json
{
  "title": "Статьи",
  "intro": "О palistor — декларативном MVVM-фреймворке для React.",
  "items": [
    {
      "title": "Palistor is here: the AI-friendly MVVM framework for React",
      "platform": "dev.to",
      "url": "https://dev.to/yuri_palienko/palistor-is-here-the-ai-friendly-mvvm-framework-for-react-experimental-5162",
      "summary": "Зачем React нужен MVVM-слой и почему такая архитектура удобна для AI-агентов.",
      "lang": "en"
    },
    {
      "title": "Palistor — декларативный MVVM-фреймворк для React",
      "platform": "vc.ru",
      "url": "https://vc.ru/id6038291/3021320-palistor-deklarativnyj-mvvm-frejmvork-dlya-react",
      "summary": "Разбор идеи фреймворка на русском.",
      "lang": "ru"
    },
    {
      "title": "Palistor: декларативный MVVM для React",
      "platform": "Хабр",
      "url": "https://habr.com/ru/sandbox/294410/",
      "summary": "Техническая версия статьи.",
      "lang": "ru"
    }
  ]
}
```

**`content/ru/pricing.json`** — ⚠️ подтверждена владельцем только цифра «сложное приложение от 500 000 ₽». Остальные два тарифа помечены `TODO_CONFIRM`, цифры **не выдумывать**.
```json
{
  "title": "Цены",
  "intro": "Работаю проектом или в формате выделенной команды. Оценка после первого созвона.",
  "tiers": [
    {
      "slug": "landing",
      "title": "Лендинг / промо-сайт",
      "price": "TODO_CONFIRM",
      "priceNote": "",
      "summary": "Next.js, адаптив, SEO, деплой.",
      "includes": ["Дизайн и вёрстка", "SEO и OG-разметка", "Деплой на Vercel"],
      "featured": false
    },
    {
      "slug": "mvp",
      "title": "MVP",
      "price": "TODO_CONFIRM",
      "priceNote": "",
      "summary": "Рабочий продукт с бэкендом, авторизацией и оплатой.",
      "includes": ["Архитектура и схема данных", "Бэкенд на NestJS", "Авторизация и платежи", "Админка"],
      "featured": false
    },
    {
      "slug": "complex",
      "title": "Сложное приложение",
      "price": "от 500 000 ₽",
      "priceNote": "SaaS-платформа, маркетплейс, BI-система",
      "summary": "Полный цикл: архитектура, бэкенд, фронтенд, интеграции, вывод в продакшен.",
      "includes": [
        "Проектирование архитектуры под нагрузку",
        "Event-driven бэкенд (Node.js / NestJS / Kafka)",
        "Мультитенантность и биллинг",
        "Интеграции по API, вебхуки, виджеты",
        "AI-агенты и аналитика",
        "Сопровождение после запуска"
      ],
      "featured": true
    }
  ],
  "note": "Точная оценка — после обсуждения задачи. Возможна работа part-time или в формате выделенного тимлида."
}
```

**`content/ru/cv.json`** — полный перенос резюме.
```json
{
  "title": "Резюме",
  "intro": "Senior / Lead Full-Stack JavaScript Engineer",
  "pdfUrl": "/cv/yuri-palienko-fullstack-tl.pdf",
  "pdfLabel": "Скачать PDF",
  "profile": "Full-Stack JavaScript Architect и Team Lead. Специализируюсь на проектировании и доставке SaaS-платформ и маркетплейсов с нуля до продакшена. Глубокая экспертиза в backend-архитектуре на Node.js/NestJS, event-driven системах и высоконагруженных решениях. Выстраивал инженерные процессы в распределённых командах.",
  "facts": [
    { "label": "Опыт", "value": "10+ лет · 4+ года Team Lead" },
    { "label": "Формат", "value": "Удалённо, готов к командировкам" },
    { "label": "Занятость", "value": "Full-time · part-time · проект" },
    { "label": "Ожидания", "value": "от 250 000 ₽ net" },
    { "label": "Готовность к выходу", "value": "2–4 недели" },
    { "label": "Английский", "value": "B2 · 4 года в команде в Риме" }
  ],
  "jobs": [
    {
      "company": "Colvir Software Solutions",
      "companyNote": "системная интеграция",
      "role": "Full-Stack Developer",
      "period": "Фев 2026 — Июл 2026",
      "duration": "6 месяцев",
      "summary": "Система бизнес-аналитики уровня Microsoft Power BI.",
      "bullets": [
        "Пересобрал ядро системы: разделил клиентскую и серверную части, что дало ощутимый прирост производительности.",
        "Разработал AI-агента для управления приложением и данными — harness с инструментами, субагентами и системой памяти.",
        "Внедрил DuckDB на клиенте (аналитика прямо в браузере) и ClickHouse на бэкенде для больших объёмов данных.",
        "Собрал сервис на NestJS с Prisma; спроектировал редактор формул на основе токенизации."
      ],
      "stack": ["NestJS", "TypeScript", "Prisma", "ClickHouse", "DuckDB", "React", "AI Agents"],
      "current": false
    },
    {
      "company": "ИП Палиенко",
      "companyNote": "собственные продукты",
      "role": "Founder & Developer",
      "period": "Июл 2025 — наст. время",
      "duration": "",
      "summary": "Запуск собственных продуктов в EdTech, PropTech и SaaS + open source.",
      "bullets": [
        "egesto.ru — AI-платформа для подготовки к ЕГЭ по английскому языку.",
        "kvartly.com — маркетплейс недвижимости в Грузии, модель лидогенерации.",
        "pali.rent — SaaS-платформа для арендных компаний.",
        "Open source: palistor — собственный React-фреймворк; paliproxy — прокси-инструмент для разработки."
      ],
      "stack": ["Next.js", "NestJS", "TypeScript", "OpenAI", "PostgreSQL"],
      "current": true
    },
    {
      "company": "Laflei ltd",
      "companyNote": "Рим, Италия",
      "role": "Team Lead",
      "period": "Ноя 2020 — Июн 2025",
      "duration": "4 года 8 мес",
      "summary": "Продукты: toprentapp.com — SaaS для управления автопарками и арендными компаниями; billionrent.com — B2C-маркетплейс аренды автомобилей.",
      "bullets": [
        "Построил SaaS-платформу с нуля — выросла до 500+ корпоративных клиентов с устойчивым ростом 20% в год.",
        "Запустил маркетплейс billionrent.com с интеграцией внешних автопарков через API.",
        "Реализовал адаптивные embed-виджеты бронирования для партнёрских сайтов и модуль «Сайт в один клик» — автогенерация лендингов для арендных компаний.",
        "Разработал кастомную UI-библиотеку с динамической темой; подключил Stripe, Firebase (auth и нотификации), Cloudinary, FaunaDB.",
        "Лидерство: руководил распределённой командой — архитектурные решения, код-ревью, менторство; удержал стабильность платформы под растущую нагрузку."
      ],
      "stack": ["React", "Next.js", "Relay", "Redux", "Zustand", "Node.js", "NestJS", "PostgreSQL", "Kafka", "GraphQL", "Firebase", "FaunaDB", "Stripe", "Cloudinary", "Vercel", "Nginx"],
      "current": false
    },
    {
      "company": "Элит такси",
      "companyNote": "",
      "role": "React Middle Developer",
      "period": "Сен 2019 — Июл 2020",
      "duration": "",
      "summary": "CRM-система для службы такси: диспетчеризация, карты, отчётность.",
      "bullets": [],
      "stack": ["React", "Redux", "Redux-Saga", "Ant Design", "OpenStreetMap"],
      "current": false
    },
    {
      "company": "Topjsurfing",
      "companyNote": "",
      "role": "Developer",
      "period": "Ноя 2018 — Май 2019",
      "duration": "",
      "summary": "Перенёс фронтенд с jQuery на Next.js: интернет-магазин, отзывы, интеграции с CRM, PDF-счета, email-уведомления. Магазин вышел в лидеры ниши за счёт скорости, валидности и SEO.",
      "bullets": [],
      "stack": ["Next.js", "Keystone.js"],
      "current": false
    },
    {
      "company": "Фриланс",
      "companyNote": "",
      "role": "Программист, вебмастер",
      "period": "Ноя 2015 — Ноя 2018",
      "duration": "",
      "summary": "Сайты для автопроката, недвижимости и туризма: zapstroy.ru (Nuxt.js), estiacard.com (Next.js), somnium.su (Vue SSR), barcelonasupercars.com, monacosupercar.com, taketesla.com.",
      "bullets": [],
      "stack": ["JavaScript", "Vue/Nuxt", "jQuery", "WordPress", "Gulp", "Pug", "Stylus"],
      "current": false
    }
  ],
  "stack": [
    { "group": "Backend",        "items": ["Node.js", "NestJS", "TypeScript", "Kafka", "GraphQL", "REST API", "Prisma"] },
    { "group": "Frontend",       "items": ["React", "Next.js", "Relay", "Redux", "Zustand", "Material UI"] },
    { "group": "Базы данных",    "items": ["PostgreSQL", "ClickHouse", "MongoDB", "Redis", "DuckDB", "FaunaDB"] },
    { "group": "Cloud / DevOps", "items": ["Docker", "Vercel", "Firebase", "Cloudinary", "GitLab CI", "GitHub", "Nginx"] },
    { "group": "AI и интеграции","items": ["OpenAI / AI Agents", "Stripe", "REST", "GraphQL"] },
    { "group": "Архитектура",    "items": ["Микросервисы", "Event-driven", "SaaS multi-tenancy", "API-first", "Serverless"] }
  ],
  "education": [
    { "year": "2012", "title": "Европейский Университет, Киев", "note": "Экономика предприятий, высшее" },
    { "year": "2024", "title": "Курсы: Node.js и JavaScript Async", "note": "Тимур Шемсединов" }
  ]
}
```

**`content/ru/contacts.json`**
```json
{
  "title": "Контакты",
  "intro": "Пишите — обсудим задачу и сроки.",
  "channels": [
    { "label": "Email",    "value": "yuripalienko@gmail.com",       "url": "mailto:yuripalienko@gmail.com",  "primary": true },
    { "label": "Telegram", "value": "@yurapalienko",                "url": "https://t.me/yurapalienko",      "primary": true },
    { "label": "GitHub",   "value": "github.com/ProjectINT",        "url": "https://github.com/ProjectINT",  "primary": false }
  ],
  "location": "Сочи, РФ",
  "availability": "Удалённо, готов к командировкам. РФ · разрешение на работу в Грузии."
}
```

### 2.4 Контент EN

Создать `content/en/*.json` с **теми же ключами**. Правила перевода:

- `site.json`, `nav.json`, заголовки и intro — перевести полностью. Nav: Work / About / Writing / Pricing / CV / Contact.
- `works.json`, `cv.json` — перевести `summary`, `highlights`, `bullets`, `role`, `period` (месяцы: `Feb 2026 — Jul 2026`), `companyNote`. **Не переводить**: `slug`, `url`, `title` компаний и продуктов, `stack`.
- `pricing.json` — цену оставить в рублях: `"from ₽500,000"`, `priceNote` перевести. `TODO_CONFIRM` оставить как есть.
- `contacts.json` — `value` и `url` не трогать, перевести только `label`, `intro`, `location` («Sochi, Russia»), `availability`.
- Английский деловой, без канцелярита. Не приукрашивать и не добавлять фактов, которых нет в русской версии.

---

## 3. Шаги реализации

Выполнять строго по порядку. После каждого шага — прогнать проверку из блока «Готово когда».

### Шаг 1. Уборка и подготовка

1. `git checkout -b stage-1-skeleton`
2. Переложить PDF: `git mv "Палиенко_Юрий_Алексеевич_CV_Fullstack_TL.pdf" public/cv/yuri-palienko-fullstack-tl.pdf` (создать директорию).
3. Удалить `public/next.svg`, `public/vercel.svg`, `public/globe.svg`, `public/window.svg`, `public/file.svg`.
4. Удалить `app/page.tsx`.

**Готово когда:** `pnpm dev` падает с ошибкой отсутствия страницы — это ожидаемо, идём дальше.

---

### Шаг 2. Шрифты и тема

⚠️ **Проверить в первую очередь:** сейчас в `app/layout.tsx` подключены `Geist` и `Geist_Mono` с `subsets: ["latin"]`. Сайт русскоязычный. **Убедиться, что выбранный шрифт поддерживает кириллицу** — иначе весь русский текст поедет на системный фолбэк.

Порядок действий:
1. Попробовать `subsets: ['latin', 'cyrillic']` для `Geist`/`Geist_Mono`. Если `next/font` падает на этапе сборки с ошибкой про неподдерживаемый subset — значит кириллицы нет.
2. При отсутствии кириллицы — заменить на пару, где она точно есть: **`Inter`** (sans) + **`JetBrains_Mono`** (mono), оба с `subsets: ['latin', 'cyrillic']`.

Моноширинный нужен по-настоящему: в дизайне резюме им набраны все служебные подписи (`ОПЫТ`, `ПРОФИЛЬ`, `01`, периоды) — тот же приём переносим на сайт.

`app/globals.css` — переписать. Tailwind v4, конфиг-файла нет, тема объявляется в CSS:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0a;
  --color-fg: #f5f5f5;
  --color-muted: #8a8a8a;
  --color-line: #262626;
  --color-accent: #f5f5f5;

  --font-sans: var(--font-app-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-app-mono), ui-monospace, monospace;
}

html { color-scheme: dark; }

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

Палитра монохромная и **тёмная по умолчанию** — как в референсе. `prefers-color-scheme` из стартового шаблона убрать: светлой темы на этом этапе нет, две темы = двойная работа над вёрсткой впустую.

**Готово когда:** русский текст в браузере отрисован выбранным шрифтом, а не Times/Arial. Проверить в DevTools → Computed → font-family, и визуально сравнить букву «Д» с латинской «D».

---

### Шаг 3. i18n-инфраструктура

**`lib/i18n.ts`**
```ts
export const LOCALES = ['ru', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ru'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

// Разбор Accept-Language без внешних зависимостей.
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((p) => p.trim().startsWith('q='))
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split('=')[1]) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const base = tag.split('-')[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
```

**`proxy.ts` в корне проекта** — ⚠️ файл называется именно `proxy.ts`, НЕ `middleware.ts`. В Next.js 16 `middleware` объявлен устаревшим и переименован в `proxy`; экспортируемая функция тоже должна называться `proxy`. Рантайм — только `nodejs`, `edge` не поддерживается и настраивать его не нужно.

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCALES, pickLocale } from '@/lib/i18n'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  if (hasLocale) return

  const locale = pickLocale(request.headers.get('accept-language'))
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml|cv/).*)'],
}
```

**`lib/content.ts`** — статические импорты, а не динамические. Это server-only код, в клиентский бандл он не попадает, зато TS проверяет соответствие JSON типам на этапе компиляции:

```ts
import type { Locale } from './i18n'
import type { SiteContent, NavContent, WorksContent /* ... */ } from '@/types/content'

import ruSite from '@/content/ru/site.json'
import enSite from '@/content/en/site.json'
// ...остальные

const site: Record<Locale, SiteContent> = { ru: ruSite, en: enSite }
const nav: Record<Locale, NavContent> = { ru: ruNav, en: enNav }
// ...

export const getSite = (lang: Locale) => site[lang]
export const getNav = (lang: Locale) => nav[lang]
// ...
```

Именно из-за такого присваивания в разделе 2.1 запрещены литеральные юнионы: TS выводит из JSON `string`, и присваивание в поле типа `'a' | 'b'` не пройдёт.

**Готово когда:** `pnpm exec tsc --noEmit` проходит; заход на `/` в браузере с русской локалью редиректит на `/ru`, с английской — на `/en`.

---

### Шаг 4. Root layout и статическая генерация

`app/[lang]/layout.tsx` — это **и есть** root layout, здесь `<html>` и `<body>`. Старый `app/layout.tsx` удалить.

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LOCALES, isLocale } from '@/lib/i18n'
import { getSite, getNav } from '@/lib/content'
import '../globals.css'

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const site = getSite(lang)
  return {
    metadataBase: new URL('https://yuripalienko.com'), // TODO_CONFIRM домен
    title: { default: `${site.name} — ${site.role}`, template: `%s · ${site.name}` },
    description: site.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { ru: '/ru', en: '/en' },
    },
  }
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  // ...
}
```

Ключевые моменты:
- `params` — **Promise**, обязательно `await`. Синхронный доступ в Next.js 16 удалён полностью.
- `LayoutProps<'/[lang]'>` и `PageProps<'/...'>` — глобальные типы, генерируются командой `pnpm exec next typegen`. Прогнать её один раз после создания роутов.
- `<html lang={lang}>` — брать из params.
- Если будешь использовать `scroll-behavior: smooth` в CSS — добавь на `<html>` атрибут `data-scroll-behavior="smooth"`, иначе Next.js 16 не будет глушить плавный скролл при навигации и переходы между страницами станут «уползающими».

Раскладка layout: слева фиксированный рельс меню (десктоп), справа — контент.

```tsx
<html lang={lang} className={`${sans.variable} ${mono.variable}`}>
  <body className="min-h-dvh bg-bg text-fg">
    <MobileNav lang={lang} items={nav.items} site={site} />   {/* только < lg */}
    <SideNav   lang={lang} items={nav.items} site={site} />   {/* только >= lg */}
    <div className="lg:pl-64">
      <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 pt-24 pb-24 lg:px-12 lg:pt-16">
        {children}
      </main>
      <Footer lang={lang} />
    </div>
  </body>
</html>
```

**Готово когда:** `pnpm build` собирает 14 статических страниц (7 роутов × 2 локали), в выводе сборки они помечены как статические (`○`), а не динамические (`ƒ`).

---

### Шаг 5. Навигация — главное отличие от референса

В референсе меню горизонтальное. **У нас вертикальное.**

**Десктоп (`lg:` и выше) — `components/layout/SideNav.tsx`:**
- `position: fixed`, левый край, ширина `16rem` (`w-64`), высота `100dvh`, тонкая правая граница `border-r border-line`.
- Сверху — имя/логотип «YP» (ссылка на `/{lang}`).
- Дальше вертикальный список: номер моноширинным приглушённым (`01`, `02`, …) + название. Крупно, с большим межстрочным интервалом — это композиционный элемент, а не служебная полоска.
- Активный пункт: цвет `fg` + короткая горизонтальная черта слева; неактивные — `muted`. Hover: сдвиг на несколько пикселей вправо через `transition-transform`, без резкости.
- Внизу рельса — `LocaleSwitcher` и год/копирайт.

**Мобильная (< `lg`) — `components/layout/MobileNav.tsx`, `"use client"`:**
- Фиксированная верхняя полоса: слева «YP», справа кнопка-бургер.
- Шторка **выезжает слева** (явное требование): панель `fixed inset-y-0 left-0 w-[85%] max-w-sm`, закрытое состояние `-translate-x-full`, открытое `translate-x-0`, `transition-transform duration-300 ease-out`.
- Затемняющий оверлей, закрытие по клику по нему, по `Escape` и при смене маршрута (`useEffect` на `usePathname()`).
- Пока открыто — `document.body.style.overflow = 'hidden'`, обязательно снимать в cleanup.
- Доступность: у кнопки `aria-expanded`, `aria-controls`, `aria-label`; у панели `role="dialog"` и `aria-modal="true"`; фокус переводить на панель при открытии.

**Общий `components/layout/NavList.tsx`, `"use client"`** — используется и рельсом, и шторкой. Принимает `items`, `lang`, вариант отображения. Активный пункт определяет через `usePathname()`:

```tsx
const pathname = usePathname()
const isActive = pathname === `/${lang}${item.href}`
```

Все ссылки строятся как `` `/${lang}${item.href}` `` через `next/link`. Голых `<a>` для внутренней навигации быть не должно.

**`LocaleSwitcher.tsx`, `"use client"`** — меняет первый сегмент пути, сохраняя остальное:

```tsx
const pathname = usePathname()
const rest = pathname.replace(/^\/(ru|en)/, '') || ''
// ссылка на другую локаль: `/${other}${rest}`
```

**Готово когда:** на десктопе меню зафиксировано слева и не скроллится с контентом; на мобильном шторка выезжает именно слева; активный пункт подсвечен на всех семи роутах; переключатель языка с `/ru/works` ведёт на `/en/works`, а не на `/en`.

---

### Шаг 6. Hero-заглушка

`app/[lang]/page.tsx` + `components/hero/HeroPlaceholder.tsx`.

Задача — **заполнить место будущей 3D-сцены так, чтобы уже сейчас читалась композиция**, и чтобы на Этапе 2 замена свелась к подстановке одного компонента.

- Секция на `min-h-[calc(100dvh-...)]`, контент по центру.
- В центре — крупные буквы `YP`: `clamp(8rem, 22vw, 20rem)`, жирное начертание, плотный `tracking-tighter`. Заливка — вертикальный градиент от `#fff` к `#555` через `bg-clip-text text-transparent`: даёт намёк на металл без единого килобайта ассетов.
- Под ними — имя, роль и `tagline` из `site.json`.
- Фон: радиальный градиент от центра + очень слабая SVG-шумовая текстура (`feTurbulence` инлайном, `opacity` порядка `0.03`). Это то, что отделяет «чёрный фон» от «дорогого чёрного фона».
- Медленная CSS-анимация (пульсация свечения, 8–12 с, `ease-in-out`), обязательно обёрнутая в `@media (prefers-reduced-motion: reduce)` с отключением.
- Внизу — две ссылки-CTA: на `/works` и на `/contacts`.

Никакого JS. Компонент серверный.

**Границу вырезаемого куска пометить комментарием:**
```tsx
{/* STAGE-2: заменить целиком на <HeroScene /> (React Three Fiber) */}
```

**Готово когда:** hero занимает первый экран, ничего не дёргается при загрузке, в клиентском бандле страницы `/` нет JS сверх рантайма Next.js.

---

### Шаг 7. Страницы разделов

Все шесть — серверные компоненты по одному шаблону:

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getWorks } from '@/lib/content'

export async function generateMetadata({ params }: PageProps<'/[lang]/works'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const works = getWorks(lang)
  return { title: works.title, description: works.intro }
}

export default async function WorksPage({ params }: PageProps<'/[lang]/works'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const works = getWorks(lang)
  // ...
}
```

Вёрстка по разделам:

| Роут | Что рисуем |
|---|---|
| `/works` | Список `WorkCard`. Карточка: `period` моноширинным приглушённым → `title` крупно (ссылка, если есть `url`) → `company · role` → `summary` → буллиты `highlights` → строка тегов `stack`. `featured` — во всю ширину, остальные в две колонки на `lg`. Разделители — `border-t border-line`, не «коробочки». |
| `/about` | `lead` крупным кеглем (`text-2xl`/`text-3xl`), затем `paragraphs` в колонку с `max-w-prose`, справа/снизу — сетка `facts` (label моно, value обычным) и `links`. |
| `/articles` | Список: `platform` + `lang` бейджем, `title` ссылкой (`target="_blank" rel="noreferrer noopener"`), `summary`. Стрелка «↗» у внешних ссылок. |
| `/pricing` | Три `tier` в ряд на `lg`, в колонку на мобильном. `featured` выделен рамкой `border-fg` и более плотным фоном. `price` крупно, `includes` списком с `—` вместо буллитов. Внизу `note` и CTA на `/contacts`. |
| `/cv` | Кнопка «Скачать PDF» (`<a href={pdfUrl} download>`) сверху. `profile`, сетка `facts`, затем `CvTimeline` по `jobs` (левая колонка — `period`/`duration` моно, правая — `company`, `role`, `summary`, `bullets`, `stack`; у `current: true` — метка «Сейчас»). Затем `CvStack` по группам и `education`. Верстать по мотивам PDF-макета: узкая левая колонка подписей + широкая правая. |
| `/contacts` | Крупные ссылки на `primary`-каналы (email, telegram) — очень большим кеглем, это главный CTA страницы. Ниже `location`, `availability`, непервичные каналы. |

Общее:
- `components/ui/PageHeader.tsx` — заголовок раздела + intro, одинаковый отступ на всех страницах.
- `components/ui/Tag.tsx` — элемент стека: моно, `text-xs`, `border border-line rounded-full px-2 py-0.5`.
- `components/ui/ExternalLink.tsx` — всегда с `rel="noreferrer noopener"`.
- Ключи в списках — `slug` / `url`, а не индекс массива.
- Значение `TODO_CONFIRM` в поле `price` рендерить как «по запросу» — но саму строку в JSON оставить, чтобы её было видно грепом.

**Готово когда:** все 12 страниц (6 разделов × 2 локали) открываются, весь контент из JSON виден, битых ссылок нет, `pnpm lint` чистый.

---

### Шаг 8. Адаптив и типографика

- Точки контроля: 375, 768, 1024, 1440, 1920.
- Горизонтального скролла быть не должно нигде. Длинные строки (`toprentapp.com`, названия стека) — `break-words` / `min-w-0` на флекс-детях.
- Отступ контента под фиксированное меню: `lg:pl-64` — только с `lg`, ниже — верхний отступ под мобильную полосу.
- Ритм заголовков задать один раз и переиспользовать: h1 `clamp(2.5rem, 6vw, 5rem)`, h2 `clamp(1.75rem, 3vw, 2.5rem)`, body `text-base`/`lg:text-lg`, `leading-relaxed`.
- Служебные подписи (label в `facts`, `period`, номера меню) — моно, `uppercase`, `tracking-widest`, `text-xs`, цвет `muted`.
- Фокус для клавиатуры виден везде: `focus-visible:outline-2 focus-visible:outline-offset-2`. Не убирать outline глобально.

**Готово когда:** на 375px ни один блок не выходит за экран, по сайту можно пройти одним Tab'ом и всегда видно, где фокус.

---

### Шаг 9. SEO-минимум

Только базовое — OG-картинки и аналитика по роадмапу относятся к Этапу 5, сюда не тянем.

**`app/sitemap.ts`**
```ts
import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n'

const ROUTES = ['', '/works', '/about', '/articles', '/pricing', '/cv', '/contacts']
const BASE = 'https://yuripalienko.com' // TODO_CONFIRM домен

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((lang) =>
    ROUTES.map((route) => ({ url: `${BASE}/${lang}${route}` }))
  )
}
```

**`app/robots.ts`** — `allow: '/'` + ссылка на sitemap.

Плюс `alternates.languages` в metadata корневого layout (см. Шаг 4) — чтобы поисковик знал про RU/EN-пары.

**Готово когда:** `/sitemap.xml` отдаёт 14 URL, `/robots.txt` открывается.

---

### Шаг 10. Приёмка

```bash
pnpm exec next typegen     # обновить PageProps/LayoutProps
pnpm exec tsc --noEmit     # ноль ошибок
pnpm lint                  # ноль ошибок
pnpm build                 # успешно, все страницы статические
pnpm start                 # руками пройти все роуты в обеих локалях
```

Отдельно проверить руками:
- `/` редиректит на `/ru` или `/en` по языку браузера;
- `/works` (без локали) редиректит на `/ru/works`;
- `/ru/несуществующее` показывает 404 **внутри** layout, с меню;
- PDF по `/cv/yuri-palienko-fullstack-tl.pdf` скачивается;
- `grep -rn "TODO_CONFIRM" content/` показывает ровно те места, что перечислены в разделе 7.

---

## 4. Чеклист Next.js 16 (сверяться при написании кода)

Версия в проекте — 16.2.12. То, что отличается от привычного:

- [ ] **`params` — Promise.** Синхронный доступ удалён. Всегда `const { lang } = await params`. То же для `searchParams`, `cookies()`, `headers()`.
- [ ] **`middleware.ts` → `proxy.ts`.** Функция называется `proxy`. Рантайм `nodejs`, `edge` не поддерживается.
- [ ] **Turbopack по умолчанию** и для `dev`, и для `build`. Флаг `--turbopack` в скриптах не нужен. Кастомный `webpack`-конфиг не добавлять — сборка упадёт.
- [ ] **`PageProps<'/route'>` / `LayoutProps<'/route'>`** — глобальные типы, генерируются `next typegen`. Свои `type Props = { params: Promise<...> }` писать не нужно.
- [ ] **`scroll-behavior`** больше не глушится автоматически при навигации. Нужен старый режим — вешай `data-scroll-behavior="smooth"` на `<html>`.
- [ ] **ESLint flat config**, `next lint` удалён. Линт запускается через `pnpm lint` → `eslint`.
- [ ] **Tailwind v4**: нет `tailwind.config.js`. Тема — директива `@theme` в `globals.css`. Не создавать конфиг-файл.
- [ ] **`next/image`**: `images.domains` устарел, использовать `remotePatterns`. На этом этапе внешних картинок нет — просто не подключать.
- [ ] Единственный root layout — `app/[lang]/layout.tsx`, в нём `<html>`/`<body>`. Второго layout в `app/` быть не должно.

---

## 5. Definition of Done

- [ ] 7 роутов × 2 локали = 14 страниц, все собираются статически
- [ ] Весь текст приходит из `content/**.json`, в `.tsx` нет захардкоженных строк контента
- [ ] Вертикальное меню слева на десктопе; на мобильном шторка выезжает слева
- [ ] Переключатель RU/EN сохраняет текущий раздел
- [ ] Hero-заглушка на весь первый экран, с явной пометкой `STAGE-2`
- [ ] `tsc --noEmit`, `pnpm lint`, `pnpm build` — чисто
- [ ] Кириллица отрисована выбранным шрифтом, не фолбэком
- [ ] Нет горизонтального скролла на 375px
- [ ] Новых npm-зависимостей не добавлено
- [ ] `sitemap.xml` и `robots.txt` отдаются

## 6. Чего на этом этапе НЕ делаем

Three.js / R3F, GSAP, Lenis, инерционный скролл, постобработка (Этапы 2–3) · OG-картинки, аналитика, cal.com, форма заявок (Этап 5) · светлая тема · скриншоты работ (по роадмапу их ещё нужно собрать — Этап 0) · страницы отдельных кейсов (`/works/[slug]`) · CMS.

## 7. Открытые вопросы к владельцу

1. **Домен** — в metadata и sitemap проставлен `yuripalienko.com` как заглушка. Подтвердить или заменить.
2. **Цены на два младших тарифа** — подтверждена только цифра «сложное приложение от 500 000 ₽». В JSON стоит `TODO_CONFIRM` (2 места).
3. **«О нас» или «Обо мне»** — в роадмапе раздел назван «О нас», но контент резюме от первого лица единственного числа. Сейчас в тексте `about.json` смешанный тон. Определиться: агентство (мы) или личный бренд (я) — это влияет и на hero, и на страницу цен.
4. **Telegram** — в CV указан `@yurapalienko`, ссылка собрана как `https://t.me/yurapalienko`. Проверить, что она рабочая.
5. **Скриншоты работ** — Этап 0 не закрыт. Пока карточки текстовые; как появятся 8–12 изображений в едином формате, в `WorkItem` добавится поле `image`.
