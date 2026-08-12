import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import ExternalLink from './ExternalLink'

/**
 * Одна развилка на две страницы (главная и /about): ссылки там приходят из
 * контента и могут быть как внешними, так и внутренними.
 *
 * Свои страницы («/palistor») — в той же вкладке через next/link: префетч,
 * без target="_blank" и без внешнего rel. Всё остальное — как раньше.
 */
export default function SmartLink({
  href,
  lang,
  children,
  className,
  arrow = false,
}: {
  href: string
  lang: Locale
  children: React.ReactNode
  className?: string
  /** дописать стрелку: ↗ для внешней ссылки, → для внутренней */
  arrow?: boolean
}) {
  const isInternal = href.startsWith('/')
  const content = arrow ? (
    <>
      {children} <span aria-hidden>{isInternal ? '→' : '↗'}</span>
    </>
  ) : (
    children
  )

  if (isInternal) {
    return (
      <Link
        href={`/${lang}${href}`}
        className={
          className ??
          'underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2'
        }
      >
        {content}
      </Link>
    )
  }

  return (
    <ExternalLink href={href} className={className}>
      {content}
    </ExternalLink>
  )
}
