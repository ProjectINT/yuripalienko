import { LOCALES, isLocale } from '@/lib/i18n'
import { feedResponse } from '@/lib/feed'

// Статическая генерация на сборке: ленты обеих локалей — обычные файлы.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function GET(_request: Request, { params }: RouteContext<'/[lang]/feed.xml'>) {
  const { lang } = await params
  if (!isLocale(lang)) return new Response('Not found', { status: 404 })
  return feedResponse(lang)
}
