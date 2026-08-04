import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getSite } from '@/lib/content'
import HeroPlaceholder from '@/components/hero/HeroPlaceholder'

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const site = getSite(lang)

  return <HeroPlaceholder lang={lang} site={site} />
}
