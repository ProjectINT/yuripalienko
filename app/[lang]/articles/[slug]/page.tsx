import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getArticles } from '@/lib/content'
import { getPost, getPostSlugs } from '@/lib/posts'
import { metaFor } from '@/lib/seo'
import { blogPosting, breadcrumbs } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import PostBody from '@/components/blog/PostBody'
import PostMeta from '@/components/blog/PostMeta'

/**
 * Страница своей статьи. Слаги приходят из lib/posts.ts и существуют только
 * парами ru+en, поэтому dynamicParams = false: неизвестный слаг отдаёт 404
 * сразу, а не пытается собраться в рантайме из отсутствующего файла.
 */
export const dynamicParams = false

export function generateStaticParams() {
  // lang добирает generateStaticParams родительского layout: слаг в паре один
  return getPostSlugs().map((slug) => ({ slug }))
}

/** `2026-08-16` → ISO 8601 для article:published_time */
const toIso = (date: string) => new Date(date).toISOString()

export async function generateMetadata({ params }: PageProps<'/[lang]/articles/[slug]'>) {
  const { lang, slug } = await params
  if (!isLocale(lang)) return {}
  const post = getPost(lang, slug)
  if (!post) return {}

  return metaFor(lang, `/articles/${slug}`, post.seoTitle, post.seoDescription, {
    publishedTime: toIso(post.date),
    modifiedTime: post.updated ? toIso(post.updated) : undefined,
  })
}

export default async function PostPage({ params }: PageProps<'/[lang]/articles/[slug]'>) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const post = getPost(lang, slug)
  if (!post) notFound()
  const articles = getArticles(lang)

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbs(lang, `/articles/${slug}`, post.title, {
          path: '/articles',
          name: articles.title,
        })}
      />
      <JsonLd data={blogPosting(lang, post)} />

      <div className="space-y-6">
        {/* H1 — только здесь: в blocks заголовков level 1 нет по типу */}
        <PageHeader title={post.title} intro={post.summary} />
        <PostMeta
          post={post}
          lang={lang}
          readingLabel={articles.readingLabel}
          updatedLabel={articles.updatedLabel}
        />
      </div>

      {post.cover ? (
        <Image
          src={post.cover.src}
          alt={post.cover.alt}
          width={post.cover.width}
          height={post.cover.height}
          sizes="(max-width: 1024px) 100vw, 65vw"
          // Вероятный LCP-элемент страницы
          priority
          className="h-auto w-full border border-line"
        />
      ) : null}

      <PostBody
        blocks={post.blocks}
        lang={lang}
        copyLabel={articles.copyLabel}
        copiedLabel={articles.copiedLabel}
      />

      <div className="border-t border-line pt-8">
        <Link
          href={`/${lang}/articles`}
          className="border-b border-line pb-1 font-mono text-sm uppercase tracking-widest text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ← {articles.backLabel}
        </Link>
      </div>
    </PageShell>
  )
}
