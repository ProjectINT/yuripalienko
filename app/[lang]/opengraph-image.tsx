import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getSite } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/**
 * Статический `export const alt` двуязычным быть не может — он один на обе
 * локали. generateImageMetadata получает params, поэтому знает lang и отдаёт
 * локализованный og:image:alt из JSON. Побочный эффект — суффикс id в URL
 * картинки (…/opengraph-image-og?…); на индексацию не влияет.
 */
export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const site = getSite(isLocale(params.lang) ? params.lang : DEFAULT_LOCALE)
  // id обязателен; при одной картинке достаточно постоянного значения
  return [{ id: 'og', alt: site.ogAlt, size: OG_SIZE, contentType: OG_CONTENT_TYPE }]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const site = getSite(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return ogImage(site.name, site.tagline)
}
