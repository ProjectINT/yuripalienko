import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getHeroCards, getSite } from '@/lib/content'
import Hero from '@/components/hero/Hero'

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const site = getSite(lang)

  return <Hero lang={lang} site={site} cards={getHeroCards(lang)} />
}
