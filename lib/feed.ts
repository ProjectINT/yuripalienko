import type { Locale } from './i18n'
import { getArticles, getSite } from './content'
import { getPosts } from './posts'
import { SITE_NAME, SITE_URL, feedPath, urlFor } from './seo'

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * RSS 2.0 своих статей локали. Канал дистрибуции для агрегаторов и читалок —
 * один из немногих способов получить первые внешние ссылки без аутрича.
 * Строится из getPosts(): новые посты попадают в ленту без правок здесь.
 */
export function buildFeed(lang: Locale): string {
  const site = getSite(lang)
  const articles = getArticles(lang)
  const posts = getPosts(lang)
  const self = `${SITE_URL}${feedPath(lang)}`
  const latest = posts[0] ? new Date(posts[0].updated ?? posts[0].date) : new Date(site.updated)

  const items = posts
    .map((post) => {
      const url = urlFor(lang, `/articles/${post.slug}`)
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator>${escape(site.name)}</dc:creator>
      <description>${escape(post.summary)}</description>
${post.tags.map((tag) => `      <category>${escape(tag)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(`${SITE_NAME} — ${articles.title}`)}</title>
    <link>${urlFor(lang, '/articles')}</link>
    <atom:link href="${self}" rel="self" type="application/rss+xml"/>
    <description>${escape(articles.seoDescription)}</description>
    <language>${lang}</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
    <image>
      <url>${SITE_URL}/favicon/icon-192.png</url>
      <title>${escape(SITE_NAME)}</title>
      <link>${urlFor(lang)}</link>
    </image>
${items}
  </channel>
</rss>
`
}

export const feedResponse = (lang: Locale) =>
  new Response(buildFeed(lang), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
