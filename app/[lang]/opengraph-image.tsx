import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getSite } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const alt = 'Palisoft — Yuri Palienko, Full-Stack Architect & Team Lead'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const site = getSite(locale)
  return ogImage(site.name, site.tagline)
}
