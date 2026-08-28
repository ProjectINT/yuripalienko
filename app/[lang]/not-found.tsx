'use client'

// Клиентский компонент осознанно: not-found не получает params, а серверные
// request-API (headers) здесь делают динамическими ВСЕ роуты сегмента [lang],
// ломая SSG. usePathname решает то же без потери статики.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'

const COPY: Record<Locale, { title: string; text: string; home: string }> = {
  ru: {
    title: 'Страница не найдена',
    text: 'Такой страницы нет. Возможно, ссылка устарела или в адресе опечатка.',
    home: '← На главную',
  },
  en: {
    title: 'Page not found',
    text: 'This page does not exist. The link may be outdated or the address mistyped.',
    home: '← Home',
  },
}

export default function NotFound() {
  const first = (usePathname() ?? '').split('/')[1]
  const lang: Locale = isLocale(first) ? first : DEFAULT_LOCALE
  const copy = COPY[lang]

  return (
    <section className="flex min-h-[50dvh] flex-col items-start justify-center gap-6">
      {/* React 19 поднимает meta в <head>. <title> здесь не работает — его
          перебивает Metadata API, поэтому заголовок 404 задан как
          title.default в layout.tsx. Страницы 404 не индексируем. */}
      <meta name="robots" content="noindex" />
      <p className="font-mono text-xs uppercase tracking-widest text-muted">404</p>
      <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-none tracking-tighter">
        {copy.title}
      </h1>
      <p className="max-w-prose leading-relaxed text-muted">{copy.text}</p>
      <Link
        href={`/${lang}`}
        className="border-b border-fg pb-1 font-mono text-sm uppercase tracking-widest transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {copy.home}
      </Link>
    </section>
  )
}
