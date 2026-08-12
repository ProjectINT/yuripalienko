import Image from 'next/image'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { WorkItem } from '@/types/content'
import Tag from '@/components/ui/Tag'
import ExternalLink from '@/components/ui/ExternalLink'
import PeriodText from '@/components/ui/PeriodText'

export default function WorkCard({
  item,
  lang,
  priority = false,
}: {
  item: WorkItem
  lang: Locale
  priority?: boolean
}) {
  const cover = item.images?.[0]

  return (
    <article
      className={`min-w-0 border-t border-line pt-8 ${
        item.featured ? 'lg:col-span-2' : ''
      }`}
    >
      {cover && (
        <Image
          src={cover.src}
          alt={
            lang === 'ru'
              ? `Скриншот интерфейса: ${item.title} — ${item.role}`
              : `Interface screenshot: ${item.title} — ${item.role}`
          }
          width={1600}
          height={900}
          sizes={item.featured ? '(max-width: 1024px) 100vw, 70vw' : '(max-width: 1024px) 100vw, 35vw'}
          // Первая карточка — вероятный LCP-элемент страницы /works
          priority={priority}
          className="mb-6 h-auto w-full border border-line"
        />
      )}
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        <PeriodText value={item.period} />
      </p>
      <h2 className="mt-3 break-words text-2xl font-bold tracking-tight lg:text-3xl">
        {item.url ? (
          <ExternalLink
            href={item.url}
            className="transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {item.title} <span aria-hidden>↗</span>
          </ExternalLink>
        ) : (
          item.title
        )}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {item.company} · {item.role}
      </p>
      <p className="mt-4 max-w-prose leading-relaxed">{item.summary}</p>
      {item.highlights.length > 0 && (
        <ul className="mt-4 max-w-prose space-y-1.5 text-sm leading-relaxed text-muted">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span aria-hidden>—</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {item.stack.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>
      {/* Точка расширения под P1-3: когда появятся страницы остальных проектов,
          достаточно проставить им page в works.json */}
      {item.page && (
        <Link
          href={`/${lang}${item.page}`}
          className="mt-5 inline-block border-b border-fg pb-1 font-mono text-xs uppercase tracking-widest transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {lang === 'ru' ? 'Подробнее' : 'Read more'} →
        </Link>
      )}
    </article>
  )
}
