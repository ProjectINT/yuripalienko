import type { Metadata } from 'next'
import type { Locale } from './i18n'
import { LOCALES } from './i18n'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palisoft.ru'

/** Q9: название студии — в og:site_name, JSON-LD Organization и PWA-манифест */
export const SITE_NAME = 'Palisoft'

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

/**
 * Общие метаданные страницы: title — абсолютный (без шаблона layout), чтобы
 * держать длину 50–60 символов под выдачу, а не под красоту навигации.
 */
export function metaFor(
  lang: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  return {
    title: { absolute: title },
    description,
    robots: robotsMeta,
    alternates: alternatesFor(lang, path),
    openGraph: {
      type: 'website',
      url: urlFor(lang, path),
      title,
      description,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
