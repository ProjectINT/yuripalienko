import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getArticles } from '@/lib/content'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import ExternalLink from '@/components/ui/ExternalLink'
import Tag from '@/components/ui/Tag'

export async function generateMetadata({ params }: PageProps<'/[lang]/articles'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const articles = getArticles(lang)
  return { title: articles.title, description: articles.intro }
}

export default async function ArticlesPage({ params }: PageProps<'/[lang]/articles'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const articles = getArticles(lang)

  return (
    <PageShell>
      <PageHeader title={articles.title} intro={articles.intro} />
      <div className="space-y-10">
        {articles.items.map((item) => (
          <article key={item.url} className="min-w-0 border-t border-line pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                {item.platform}
              </span>
              <Tag>{item.lang}</Tag>
            </div>
            <h2 className="mt-3 break-words text-xl font-bold tracking-tight lg:text-2xl">
              <ExternalLink
                href={item.url}
                className="transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {item.title} <span aria-hidden>↗</span>
              </ExternalLink>
            </h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{item.summary}</p>
          </article>
        ))}
      </div>
    </PageShell>
  )
}
