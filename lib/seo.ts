import type { Metadata } from 'next'
import type { Locale } from './i18n'
import { LOCALES } from './i18n'
import { getSite } from './content'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palisoft.ru'

/** Q9: название студии — в og:site_name, JSON-LD Organization и PWA-манифест */
export const SITE_NAME = 'Palisoft'

/**
 * Публичные профили владельца. Один источник для twitter:site/creator,
 * sameAs в JSON-LD и ссылок в контенте — чтобы хэндл не разъезжался по файлам.
 */
export const TWITTER_HANDLE = '@PalienkoYuri'
export const SOCIAL_LINKS = {
  x: 'https://x.com/PalienkoYuri',
  linkedin: 'https://www.linkedin.com/in/yuripalienko/',
  github: 'https://github.com/ProjectINT',
  telegram: 'https://t.me/yurapalienko',
  devto: 'https://dev.to/yuri_palienko',
  vcru: 'https://vc.ru/id6038291',
  habr: 'https://habr.com/ru/users/YuriPalienko/',
} as const

/**
 * Запасная OG-картинка (1200×630, скриншот hero-сцены) для страниц без
 * собственного opengraph-image.tsx. Статический файл — его URL стабилен,
 * поэтому он же годится как `image` в BlogPosting без обложки.
 */
export const DEFAULT_OG_IMAGE = {
  url: '/og/default.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
} as const

/**
 * Q5: единственный рубильник индексации — открыто/закрыто для всех сразу.
 * Впекается на этапе сборки (SSG), поэтому смена значения требует пересборки
 * и передеплоя, а не рестарта.
 */
export const INDEXING_ENABLED = process.env.ALLOW_INDEXING === 'true'

/** Q3: рынок — весь мир, поэтому «безъязыкий» краулер должен попадать на английскую версию */
export const X_DEFAULT_LOCALE: Locale = 'en'

export const OG_LOCALE: Record<Locale, string> = { ru: 'ru_RU', en: 'en_US' }

/** Абсолютный URL страницы в конкретной локали */
export const urlFor = (lang: Locale, path = '') => `${SITE_URL}/${lang}${path}`

/** RSS-лента локали: app/[lang]/feed.xml/route.ts */
export const feedPath = (lang: Locale) => `/${lang}/feed.xml`

/**
 * Полный набор alternates: self-canonical + все локали + x-default + RSS.
 *
 * paths — путь страницы в каждой локали, когда они различаются (статьи
 * с локализованными слагами). Без него путь один на все локали.
 */
export function alternatesFor(
  lang: Locale,
  path = '',
  paths?: Partial<Record<Locale, string>>,
): NonNullable<Metadata['alternates']> {
  const pathIn = (l: Locale) => paths?.[l] ?? path
  return {
    canonical: `/${lang}${pathIn(lang)}`,
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${pathIn(l)}`])),
      'x-default': `/${X_DEFAULT_LOCALE}${pathIn(X_DEFAULT_LOCALE)}`,
    },
    types: { 'application/rss+xml': feedPath(lang) },
  }
}

/** Q5: пока флаг не поднят — запрещаем индексацию на уровне каждой страницы */
export const robotsMeta = INDEXING_ENABLED
  ? undefined
  : { index: false, follow: false, nocache: true }

export interface MetaOptions {
  /**
   * Только для страниц статей: `og:type=article`, даты в ISO 8601,
   * `article:author/section/tag` и `<meta name="author">`.
   */
  article?: {
    publishedTime: string
    modifiedTime?: string
    section?: string
    tags?: string[]
  }
  /**
   * Запасная OG-картинка для сегментов без opengraph-image.tsx. alt —
   * локализованный, из JSON страницы. Без этого поля картинку даёт файл
   * сегмента (file-based metadata имеет приоритет над этим объектом).
   */
  image?: { alt: string }
  /** Путь страницы в каждой локали, если он различается (см. alternatesFor) */
  paths?: Partial<Record<Locale, string>>
}

/**
 * Общие метаданные страницы: title — абсолютный (без шаблона layout), чтобы
 * держать длину 50–60 символов под выдачу, а не под красоту навигации.
 */
export function metaFor(
  lang: Locale,
  path: string,
  title: string,
  description: string,
  options: MetaOptions = {},
): Metadata {
  const { article, image, paths } = options
  const site = getSite(lang)
  const images = image ? [{ ...DEFAULT_OG_IMAGE, alt: image.alt }] : undefined

  const og = {
    url: urlFor(lang, path),
    title,
    description,
    siteName: SITE_NAME,
    locale: OG_LOCALE[lang],
    alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    ...(images ? { images } : {}),
  }

  return {
    title: { absolute: title },
    description,
    robots: robotsMeta,
    alternates: alternatesFor(lang, path, paths),
    ...(article ? { authors: [{ name: site.name, url: urlFor(lang, '/cv') }] } : {}),
    openGraph: article
      ? {
          ...og,
          type: 'article',
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime,
          authors: [urlFor(lang, '/cv')],
          section: article.section,
          tags: article.tags,
        }
      : { ...og, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      ...(images ? { images } : {}),
    },
  }
}
