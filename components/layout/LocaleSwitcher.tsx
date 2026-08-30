'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, type Locale } from '@/lib/i18n'

export default function LocaleSwitcher({
  lang,
  variant = 'inline',
}: {
  lang: Locale
  /** inline — «ru / en» текстом (футер, drawer); switch — тёмный пилл-свич для шапки */
  variant?: 'inline' | 'switch'
}) {
  const pathname = usePathname()
  const rest = pathname.replace(/^\/(ru|en)/, '') || ''

  if (variant === 'switch') {
    return (
      <div className="flex items-center rounded-full border border-line bg-fg/5 p-0.5 font-mono text-[10px] uppercase tracking-widest">
        {LOCALES.map((locale) =>
          locale === lang ? (
            <span
              key={locale}
              aria-current="true"
              className="rounded-full bg-fg/10 px-2 py-1 leading-none text-fg"
            >
              {locale}
            </span>
          ) : (
            <Link
              key={locale}
              href={`/${locale}${rest}`}
              className="rounded-full px-2 py-1 leading-none text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {locale}
            </Link>
          ),
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center gap-2">
          {i > 0 && <span className="text-line">/</span>}
          {locale === lang ? (
            <span className="text-fg" aria-current="true">
              {locale}
            </span>
          ) : (
            <Link
              href={`/${locale}${rest}`}
              className="text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {locale}
            </Link>
          )}
        </span>
      ))}
    </div>
  )
}
