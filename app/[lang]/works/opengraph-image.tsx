import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getWorks } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Локализованный alt — см. комментарий в app/[lang]/opengraph-image.tsx */
export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const works = getWorks(isLocale(params.lang) ? params.lang : DEFAULT_LOCALE)
  return [{ id: 'og', alt: works.ogAlt, size: OG_SIZE, contentType: OG_CONTENT_TYPE }]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const works = getWorks(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return ogImage(works.h1, works.intro)
}
