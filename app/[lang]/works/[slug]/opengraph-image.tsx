import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n'
import { getWorks } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Локализованный alt — см. комментарий в app/[lang]/opengraph-image.tsx */
export function generateImageMetadata({ params }: { params: { lang: string; slug: string } }) {
  const works = getWorks(isLocale(params.lang) ? params.lang : DEFAULT_LOCALE)
  const item = works.items.find((work) => work.slug === params.slug)
  return [
    {
      id: 'og',
      alt: item?.ogAlt ?? item?.title ?? works.ogAlt,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ]
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const works = getWorks(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const item = works.items.find((work) => work.slug === slug)
  // Кейс не найден — картинка раздела вместо падения рантайм-роута
  return ogImage(item?.h1 ?? item?.title ?? works.h1, item?.summary ?? works.intro)
}
