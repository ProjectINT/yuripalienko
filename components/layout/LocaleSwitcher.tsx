'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, type Locale } from '@/lib/i18n'

export default function LocaleSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname()
  const rest = pathname.replace(/^\/(ru|en)/, '') || ''

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
