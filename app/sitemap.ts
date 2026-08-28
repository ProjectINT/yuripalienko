import type { MetadataRoute } from 'next'
import type { Locale } from '@/lib/i18n'
import { LOCALES } from '@/lib/i18n'
import { getPosts } from '@/lib/posts'
import {
  getAbout,
  getArticles,
  getContacts,
  getCv,
  getPalistor,
  getPricing,
  getSite,
  getWorks,
} from '@/lib/content'
import { SITE_URL, X_DEFAULT_LOCALE, INDEXING_ENABLED } from '@/lib/seo'

type Frequency = 'weekly' | 'monthly' | 'yearly'

/**
 * lastmod берётся из поля `updated` в JSON страницы, а не из времени сборки:
 * деплой с правкой футера не должен объявлять поисковику, что обновились все
 * 16 страниц разом — Google быстро перестаёт верить такому lastmod целиком.
 */
const ROUTES: {
  path: string
  priority: number
  changeFrequency: Frequency
  updated: (lang: Locale) => string
}[] = [
  { path: '', priority: 1.0, changeFrequency: 'monthly', updated: (l) => getSite(l).updated },
  { path: '/works', priority: 0.9, changeFrequency: 'monthly', updated: (l) => getWorks(l).updated },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly', updated: (l) => getPricing(l).updated },
  { path: '/cv', priority: 0.8, changeFrequency: 'monthly', updated: (l) => getCv(l).updated },
  // 0.8 наравне с /cv: страница важнее /about, но ниже коммерческих /works и /pricing
  { path: '/palistor', priority: 0.8, changeFrequency: 'monthly', updated: (l) => getPalistor(l).updated },
  { path: '/about', priority: 0.7, changeFrequency: 'yearly', updated: (l) => getAbout(l).updated },
  {
    path: '/articles',
    priority: 0.7,
    changeFrequency: 'weekly',
    // Индекс статей меняется с каждой публикацией — берём самую позднюю дату
    updated: (l) =>
      [getArticles(l).updated, ...getPosts(l).map((post) => post.updated ?? post.date)]
        .sort()
        .at(-1)!,
  },
  { path: '/contacts', priority: 0.6, changeFrequency: 'yearly', updated: (l) => getContacts(l).updated },
]

function entry(
  lang: Locale,
  path: string,
  priority: number,
  changeFrequency: Frequency,
  lastModified: string,
  paths?: Partial<Record<Locale, string>>,
): MetadataRoute.Sitemap[number] {
  const pathIn = (l: Locale) => paths?.[l] ?? path
  return {
    url: `${SITE_URL}/${lang}${pathIn(lang)}`,
    lastModified: new Date(lastModified),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${pathIn(l)}`])),
        'x-default': `${SITE_URL}/${X_DEFAULT_LOCALE}${pathIn(X_DEFAULT_LOCALE)}`,
      },
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Q5: пока сайт под noindex, не публикуем живую карту закрытого сайта
  if (!INDEXING_ENABLED) return []

  return LOCALES.flatMap((lang) => [
    ...ROUTES.map(({ path, priority, changeFrequency, updated }) =>
      entry(lang, path, priority, changeFrequency, updated(lang)),
    ),
    // Кейсы со своей страницей (page = /works/<slug>); palistor живёт на /palistor
    ...getWorks(lang)
      .items.filter((item) => item.page?.startsWith('/works/'))
      .map((item) =>
        entry(lang, item.page!, 0.8, 'monthly', item.updated ?? getWorks(lang).updated),
      ),
    // Статьи публикуются только полными парами, но слаги локализованы —
    // alternates берут путь каждой локали из post.alternates.
    ...getPosts(lang).map((post) =>
      entry(
        lang,
        `/articles/${post.slug}`,
        0.7,
        'monthly',
        post.updated ?? post.date,
        Object.fromEntries(
          Object.entries(post.alternates).map(([l, slug]) => [l, `/articles/${slug}`]),
        ),
      ),
    ),
  ])
}
