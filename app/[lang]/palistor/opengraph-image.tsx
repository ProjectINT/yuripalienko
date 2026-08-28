import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getPalistor } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Локализованный alt — см. комментарий в app/[lang]/opengraph-image.tsx */
export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const palistor = getPalistor(isLocale(params.lang) ? params.lang : DEFAULT_LOCALE)
  return [{ id: 'og', alt: palistor.ogAlt, size: OG_SIZE, contentType: OG_CONTENT_TYPE }]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const palistor = getPalistor(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return ogImage(palistor.title, palistor.intro)
}
