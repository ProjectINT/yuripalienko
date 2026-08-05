import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n'
import { SITE_URL, X_DEFAULT_LOCALE, INDEXING_ENABLED } from '@/lib/seo'

const ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'monthly' as const },
  { path: '/works', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/cv', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/articles', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/contacts', priority: 0.6, changeFrequency: 'yearly' as const },
]

// SSG: файл выполняется на сборке, поэтому new Date() здесь — время билда,
// а не время запроса.
const BUILD_TIME = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  // Q5: пока сайт под noindex, не публикуем живую карту закрытого сайта
  if (!INDEXING_ENABLED) return []

  return LOCALES.flatMap((lang) =>
    ROUTES.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: BUILD_TIME,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])),
          'x-default': `${SITE_URL}/${X_DEFAULT_LOCALE}${path}`,
        },
      },
    })),
  )
}
