import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getPricing } from '@/lib/content'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'

export async function generateMetadata({ params }: PageProps<'/[lang]/pricing'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const pricing = getPricing(lang)
  return { title: pricing.title, description: pricing.intro }
}

export default async function PricingPage({ params }: PageProps<'/[lang]/pricing'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const pricing = getPricing(lang)
  const onRequest = lang === 'ru' ? 'по запросу' : 'on request'

  return (
    <PageShell>
      <PageHeader title={pricing.title} intro={pricing.intro} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pricing.tiers.map((tier) => (
          <Card key={tier.slug} featured={tier.featured}>
            <h2 className="text-xl font-bold tracking-tight">{tier.title}</h2>
            <p className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">
              {tier.price === 'TODO_CONFIRM' ? onRequest : tier.price}
            </p>
            {tier.priceNote && (
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
                {tier.priceNote}
              </p>
            )}
            <p className="mt-4 leading-relaxed text-muted">{tier.summary}</p>
            <ul className="mt-6 space-y-1.5 text-sm leading-relaxed">
              {tier.includes.map((line) => (
                <li key={line} className="flex gap-2">
                  <span aria-hidden className="text-muted">—</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div className="space-y-6">
        <p className="max-w-prose leading-relaxed text-muted">{pricing.note}</p>
        <Link
          href={`/${lang}/contacts`}
          className="inline-block border-b border-fg pb-1 font-mono text-sm uppercase tracking-widest transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {lang === 'ru' ? 'Обсудить задачу →' : 'Discuss a project →'}
        </Link>
      </div>
    </PageShell>
  )
}
