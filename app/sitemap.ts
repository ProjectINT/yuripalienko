import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n'
import { getPosts } from '@/lib/posts'
import { SITE_URL, X_DEFAULT_LOCALE, INDEXING_ENABLED } from '@/lib/seo'

const ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'monthly' as const },
  { path: '/works', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/cv', priority: 0.8, changeFrequency: 'monthly' as const },
  // 0.8 наравне с /cv: страница важнее /about, но ниже коммерческих /works и /pricing
  { path: '/palistor', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/articles', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/contacts', priority: 0.6, changeFrequency: 'yearly' as const },
]

// SSG: файл выполняется на сборке, поэтому new Date() здесь — время билда,
// а не время запроса.
const BUILD_TIME = new Date()

function entry(
  lang: string,
  path: string,
  priority: number,
  changeFrequency: 'weekly' | 'monthly' | 'yearly',
  lastModified: Date,
) {
  return {
    url: `${SITE_URL}/${lang}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])),
        'x-default': `${SITE_URL}/${X_DEFAULT_LOCALE}${path}`,
      },
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Q5: пока сайт под noindex, не публикуем живую карту закрытого сайта
  if (!INDEXING_ENABLED) return []

  return LOCALES.flatMap((lang) => [
    ...ROUTES.map(({ path, priority, changeFrequency }) =>
      entry(lang, path, priority, changeFrequency, BUILD_TIME),
    ),
    // Статьи публикуются только полными парами, поэтому набор слагов в обеих
    // локалях одинаков и alternates честные. Дата — настоящая дата правки
    // статьи, а не время сборки.
    ...getPosts(lang).map((post) =>
      entry(
        lang,
        `/articles/${post.slug}`,
        0.7,
        'monthly',
        new Date(post.updated ?? post.date),
      ),
    ),
  ])
}
