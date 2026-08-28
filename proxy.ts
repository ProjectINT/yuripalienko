import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCALES, isLocale, pickLocale } from '@/lib/i18n'
import { findPostSlug } from '@/lib/posts'

const ARTICLE = /^\/(ru|en)\/articles\/([^/]+)$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (hasLocale) {
    // Слаги статей локализованы: /ru/articles/<en-slug> (переключатель языка
    // подставляет текущий путь под другую локаль; старая ссылка) → 308 на
    // слаг этой локали. Неизвестный слаг проходит дальше и получает 404.
    const match = pathname.match(ARTICLE)
    if (match && isLocale(match[1])) {
      const slug = findPostSlug(match[1], match[2])
      if (slug && slug !== match[2]) {
        request.nextUrl.pathname = `/${match[1]}/articles/${slug}`
        return NextResponse.redirect(request.nextUrl, 308)
      }
    }
    return
  }

  const locale = pickLocale(request.headers.get('accept-language'))
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Пропускаем внутренние роуты Next и всё, в чём есть точка, — то есть любой файл.
  // Ассеты из public (/cv/*.pdf, /hdri/*.hdr, /logo/*.svg) редиректить на локаль
  // нельзя: three.js грузит их fetch-ем и получает 404 после 307 на /ru/....
  // robots.txt, sitemap.xml, feed.xml и favicon.ico подпадают под то же правило.
  matcher: ['/((?!_next|.*\\.).*)'],
}
