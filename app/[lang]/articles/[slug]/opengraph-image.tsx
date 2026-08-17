import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getArticles } from '@/lib/content'
import { getPost } from '@/lib/posts'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/**
 * OG-картинка статьи не берётся из cover: рендерится тем же lib/og.tsx из
 * title + summary, что и остальные страницы — единый визуал ленты в
 * мессенджерах и ноль дополнительной работы при публикации.
 *
 * Роут динамический (как и остальные opengraph-image), поэтому lib/posts.ts
 * читает content/posts/ в рантайме — Dockerfile копирует content/ в образ.
 */
export function generateImageMetadata({ params }: { params: { lang: string; slug: string } }) {
  const lang = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE
  const post = getPost(lang, params.slug)
  // id обязателен; при одной картинке достаточно постоянного значения
  return [
    {
      id: 'og',
      alt: post?.ogAlt ?? getArticles(lang).title,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ]
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const post = getPost(locale, slug)
  // Пост не найден — отдаём картинку раздела вместо падения рантайм-роута
  const articles = getArticles(locale)
  return ogImage(post?.title ?? articles.title, post?.summary ?? articles.intro)
}
