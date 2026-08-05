import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getCv } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const alt = 'Yuri Palienko — Senior Full-Stack JavaScript / Team Lead CV'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const cv = getCv(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return ogImage(cv.title, cv.intro)
}
