import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getWorks } from '@/lib/content'
import { metaFor } from '@/lib/seo'
import { breadcrumbs, worksItemList } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import WorkCard from '@/components/works/WorkCard'

export async function generateMetadata({ params }: PageProps<'/[lang]/works'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const works = getWorks(lang)
  return metaFor(lang, '/works', works.seoTitle, works.seoDescription)
}

export default async function WorksPage({ params }: PageProps<'/[lang]/works'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const works = getWorks(lang)

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/works', works.title)} />
      <JsonLd data={worksItemList(lang, works)} />
      <PageHeader title={works.h1} intro={works.intro} />
      <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
        {works.items.map((item, index) => (
          <WorkCard key={item.slug} item={item} lang={lang} priority={index === 0} />
        ))}
      </div>
    </PageShell>
  )
}
