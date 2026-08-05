import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCALES, pickLocale } from '@/lib/i18n'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  if (hasLocale) return

  const locale = pickLocale(request.headers.get('accept-language'))
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Пропускаем внутренние роуты Next и всё, в чём есть точка, — то есть любой файл.
  // Ассеты из public (/cv/*.pdf, /hdri/*.hdr, /logo/*.svg) редиректить на локаль
  // нельзя: three.js грузит их fetch-ем и получает 404 после 307 на /ru/....
  // robots.txt, sitemap.xml и favicon.ico подпадают под то же правило.
  matcher: ['/((?!_next|.*\\.).*)'],
}
