import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getArticles } from '@/lib/content'
import { getPosts } from '@/lib/posts'
import { metaFor } from '@/lib/seo'
import { breadcrumbs } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import ExternalLink from '@/components/ui/ExternalLink'
import Tag from '@/components/ui/Tag'
import PostCard from '@/components/blog/PostCard'

export async function generateMetadata({ params }: PageProps<'/[lang]/articles'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const articles = getArticles(lang)
  return metaFor(lang, '/articles', articles.seoTitle, articles.seoDescription)
}

export default async function ArticlesPage({ params }: PageProps<'/[lang]/articles'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const articles = getArticles(lang)
  // Свои статьи из content/posts/, свежие сверху; внешние публикации — ниже
  const posts = getPosts(lang)

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/articles', articles.title)} />
      <PageHeader title={articles.title} intro={articles.intro} />

      {posts.length > 0 ? (
        <section id="posts" className="space-y-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            {articles.postsTitle}
          </h2>
          <div className="space-y-10">
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                lang={lang}
                readingLabel={articles.readingLabel}
                readLabel={articles.readLabel}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section id="external" className="space-y-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {articles.externalTitle}
        </h2>
        <div className="space-y-10">
          {articles.items.map((item) => (
            <article key={item.url} className="min-w-0 border-t border-line pt-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  {item.platform}
                </span>
                <Tag>{item.lang}</Tag>
              </div>
              <h3 className="mt-3 break-words text-xl font-bold tracking-tight lg:text-2xl">
                <ExternalLink
                  href={item.url}
                  className="transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {item.title} <span aria-hidden>↗</span>
                </ExternalLink>
              </h3>
              <p className="mt-3 max-w-prose leading-relaxed text-muted">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
