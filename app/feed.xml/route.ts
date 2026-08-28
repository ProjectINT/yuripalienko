import { X_DEFAULT_LOCALE } from '@/lib/seo'
import { feedResponse } from '@/lib/feed'

// /feed.xml — адрес, который читалки и агрегаторы пробуют по умолчанию.
// proxy.ts пути с точкой не редиректит на локаль, поэтому лента x-default
// отдаётся здесь напрямую; локализованные — на /{lang}/feed.xml.
export const dynamic = 'force-static'

export function GET() {
  return feedResponse(X_DEFAULT_LOCALE)
}
