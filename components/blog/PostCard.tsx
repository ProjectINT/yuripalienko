import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { Post } from '@/types/content'
import PostMeta from './PostMeta'

/** Карточка своей статьи в ленте /articles */
export default function PostCard({
  post,
  lang,
  readingLabel,
  readLabel,
}: {
  post: Post
  lang: Locale
  readingLabel: string
  readLabel: string
}) {
  const href = `/${lang}/articles/${post.slug}`

  return (
    <article className="min-w-0 border-t border-line pt-8">
      <PostMeta post={post} lang={lang} readingLabel={readingLabel} />
      <h3 className="mt-3 break-words text-xl font-bold tracking-tight lg:text-2xl">
        <Link
          href={href}
          className="transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 max-w-prose leading-relaxed text-muted">{post.summary}</p>
      <Link
        href={href}
        className="mt-4 inline-block border-b border-line pb-1 font-mono text-sm uppercase tracking-widest text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {readLabel} →
      </Link>
    </article>
  )
}
