/** Текстовый блок под hero на главной: услуги + ключевые проекты + CTA */
export interface HomeContent {
  heading: string
  paragraphs: string[]
  highlightsTitle: string
  /** link: null — проект без публичной ссылки, выводится обычным текстом */
  highlights: { title: string; note: string; link: string | null }[]
  worksLink: string
  pricingLink: string
}

export interface SiteContent {
  name: string
  role: string
  tagline: string
  description: string
  /** Полный title под выдачу (50–60 симв.), выводится без шаблона layout */
  seoTitle: string
  /** Description под выдачу (140–160 симв.) */
  seoDescription: string
  home: HomeContent
}

export interface NavItem {
  href: string
  label: string
  index: string
}

export interface NavContent {
  items: NavItem[]
}

export interface WorkImage {
  /** имя файла без расширения, оно же ключ в content/works-media.json */
  name: string
  /** 1600×900 — для страницы /works */
  src: string
  /** 800×450 — текстура карточки в hero-сцене */
  card: string
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
  /**
   * Внутренняя страница проекта («/palistor»), если она есть. Опционально:
   * сейчас такая страница одна, остальные 10 проектов поля не имеют.
   */
  page?: string | null
  /** подмешивается в lib/content.ts из works-media.json, в локализованных JSON его нет */
  images?: WorkImage[]
}

/** Плоский список всех скриншотов — по одному на карточку в hero-сцене */
export interface HeroCard {
  slug: string
  title: string
  /** 800×450 — текстура карточки в сцене */
  src: string
  /** 1600×900 — полноразмерный скриншот для лайтбокса */
  full: string
}

export interface WorksContent {
  title: string
  intro: string
  seoTitle: string
  seoDescription: string
  items: WorkItem[]
}

export interface AboutContent {
  title: string
  lead: string
  seoTitle: string
  seoDescription: string
  paragraphs: string[]
  facts: { label: string; value: string }[]
  links: { label: string; url: string }[]
}

export interface ArticleItem {
  title: string
  platform: string
  url: string
  summary: string
  lang: string
}

export interface ArticlesContent {
  title: string
  intro: string
  seoTitle: string
  seoDescription: string
  items: ArticleItem[]
}

export interface PricingTier {
  slug: string
  title: string
  /** Цена «от», в валюте currency; null — «по запросу». Число нужно для Offer JSON-LD */
  price: number | null
  /** ISO 4217, сейчас везде USD (Q4). Не литерал: JSON-импорт расширяет до string */
  currency: string
  priceNote: string
  summary: string
  includes: string[]
  featured: boolean
}

export interface PricingContent {
  title: string
  intro: string
  seoTitle: string
  seoDescription: string
  tiers: PricingTier[]
  stackTitle: string
  stack: { group: string; items: string[] }[]
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
  seoTitle: string
  seoDescription: string
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
  seoTitle: string
  seoDescription: string
  channels: { label: string; value: string; url: string; primary: boolean }[]
  location: string
  availability: string
}

export interface PalistorLink {
  label: string
  url: string
  /** primary — выводится в верхнем ряду ссылок крупно, рамкой */
  primary: boolean
}

export interface PalistorCode {
  /** ключ для подсветки: 'ts' | 'tsx' | 'bash' — других грамматик в lib/highlight.ts нет */
  lang: string
  /** подпись над блоком: «Декларация ViewModel по MVVM» */
  caption: string
  /**
   * Код целиком, включая комментарии. Локализуется вместе с остальным JSON:
   * в README.md — «// getPhone is already the data layer»,
   * в README.ru.md — «// getPhone это уже слой данных».
   * Расходиться между локалями могут только комментарии и строки, которые
   * видит пользователь примера (label, placeholder, тексты ошибок); сам код —
   * идентификаторы, структура, логика — обязан совпадать.
   */
  code: string
}

export interface PalistorLayer {
  /** «01» / «02» / «03» — мононумерация в стиле nav */
  index: string
  title: string
  text: string
  /** у слоя Model примера нет — только текст */
  code: PalistorCode | null
}

export interface PalistorStep {
  index: string
  title: string
  text: string
  code: PalistorCode
}

export interface PalistorContent {
  title: string
  intro: string
  seoTitle: string
  seoDescription: string
  /** alt для og:image — не берётся из intro, там своя длина и смысл */
  ogAlt: string
  /** «MIT · React 19 · TypeScript» — мета-строка под заголовком */
  meta: string[]
  links: PalistorLink[]
  screenshotAlt: string

  /** «В продакшене: pali.rent, kvartly.com» — плашка доверия под ссылками */
  usedInTitle: string
  usedIn: { title: string; url: string; note: string }[]

  /** подписи кнопки копирования — иначе единственные хардкод-строки на странице */
  copyLabel: string
  copiedLabel: string

  layersTitle: string
  layersLead: string
  layers: PalistorLayer[]

  startTitle: string
  install: PalistorCode
  steps: PalistorStep[]

  featuresTitle: string
  features: { term: string; text: string }[]

  fitTitle: string
  fit: string[]
  unfitTitle: string
  unfit: string[]

  demoTitle: string
  demoLead: string
  demo: { label: string; url: string; note: string }[]

  faqTitle: string
  /** идут в FAQPage JSON-LD как есть, поэтому без разметки и без ссылок */
  faq: { q: string; a: string }[]

  ctaText: string
  ctaLabel: string /** → /{lang}/contacts */
  worksLabel: string /** → /{lang}/works */
  docsLabel: string /** → README на GitHub */
}
