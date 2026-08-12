import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getPalistor } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/**
 * Статический `export const alt` двуязычным быть не может — он один на обе
 * локали. generateImageMetadata получает params (в отличие от alt), поэтому
 * знает lang и отдаёт локализованный og:image:alt.
 *
 * Побочный эффект: URL картинки получает суффикс id (…/opengraph-image-og?…).
 * На индексацию не влияет. Три существующие OG-картинки (works, pricing, cv)
 * остаются со статическим alt — их перевод на этот механизм отдельная задача.
 */
export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const palistor = getPalistor(isLocale(params.lang) ? params.lang : DEFAULT_LOCALE)
  // id обязателен; при одной картинке достаточно постоянного значения
  return [{ id: 'og', alt: palistor.ogAlt, size: OG_SIZE, contentType: OG_CONTENT_TYPE }]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const palistor = getPalistor(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return ogImage(palistor.title, palistor.intro)
}
