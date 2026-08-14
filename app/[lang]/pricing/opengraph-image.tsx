import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getPricing } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const alt = 'Palisoft pricing — complex web application and SaaS development'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const pricing = getPricing(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return ogImage(pricing.title, pricing.intro)
}
