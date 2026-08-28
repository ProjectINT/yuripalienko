import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getArticles } from '@/lib/content'
import { getPost, getPosts } from '@/lib/posts'
import { metaFor } from '@/lib/seo'
import { blogPosting, breadcrumbs } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import PostBody from '@/components/blog/PostBody'
import PostMeta from '@/components/blog/PostMeta'

/**
 * Страница своей статьи. Посты существуют только парами ru+en, но слаг у
 * каждой локали свой (lib/posts.ts), поэтому generateStaticParams берёт lang
 * из родительского сегмента и отдаёт слаги именно этой локали.
 * dynamicParams = false: неизвестный слаг отдаёт 404 сразу; чужой слаг
 * (из другой локали) перехватывает proxy.ts и редиректит на свой.
 */
export const dynamicParams = false

export function generateStaticParams({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) return []
  return getPosts(params.lang).map((post) => ({ slug: post.slug }))
}

/** `2026-08-16` → ISO 8601 для article:published_time */
const toIso = (date: string) => new Date(date).toISOString()

export async function generateMetadata({ params }: PageProps<'/[lang]/articles/[slug]'>) {
  const { lang, slug } = await params
  if (!isLocale(lang)) return {}
  const post = getPost(lang, slug)
  if (!post) return {}

  return metaFor(lang, `/articles/${slug}`, post.seoTitle, post.seoDescription, {
    article: {
      publishedTime: toIso(post.date),
      modifiedTime: post.updated ? toIso(post.updated) : undefined,
      section: getArticles(lang).title,
      tags: post.tags,
    },
    // hreflang на перевод — по его собственному слагу
    paths: Object.fromEntries(
      Object.entries(post.alternates).map(([l, s]) => [l, `/articles/${s}`]),
    ),
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
