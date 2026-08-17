import type { Locale } from '@/lib/i18n'
import type { Post } from '@/types/content'
import Tag from '@/components/ui/Tag'

/**
 * «16 августа 2026» / «August 16, 2026». timeZone: 'UTC' обязателен: строка
 * `2026-08-16` разбирается как полночь UTC, и в поясе западнее Гринвича без
 * него получилось бы 15 августа.
 */
export function formatDate(lang: Locale, date: string) {
  return new Intl.DateTimeFormat(lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}

export default function PostMeta({
  post,
  lang,
  readingLabel,
  updatedLabel,
}: {
  post: Post
  lang: Locale
  readingLabel: string
  /** передаётся только на странице статьи; в карточке дата правки не нужна */
  updatedLabel?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted">
      <time dateTime={post.date}>{formatDate(lang, post.date)}</time>
      <span>
        {post.readingMinutes} {readingLabel}
      </span>
      {updatedLabel && post.updated ? (
        <span>
          {updatedLabel} <time dateTime={post.updated}>{formatDate(lang, post.updated)}</time>
        </span>
      ) : null}
      {post.tags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </div>
  )
}
