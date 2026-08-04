import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getWorks } from '@/lib/content'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import WorkCard from '@/components/works/WorkCard'

export async function generateMetadata({ params }: PageProps<'/[lang]/works'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const works = getWorks(lang)
  return { title: works.title, description: works.intro }
}

export default async function WorksPage({ params }: PageProps<'/[lang]/works'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const works = getWorks(lang)

  return (
    <PageShell>
      <PageHeader title={works.title} intro={works.intro} />
      <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
        {works.items.map((item) => (
          <WorkCard key={item.slug} item={item} />
        ))}
      </div>
    </PageShell>
  )
}
