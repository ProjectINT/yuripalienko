import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { isLocale } from '@/lib/i18n'
import { getPricing } from '@/lib/content'
import { metaFor } from '@/lib/seo'
import { breadcrumbs, pricingGraph } from '@/lib/schema'
import type { PricingTier } from '@/types/content'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'

export async function generateMetadata({ params }: PageProps<'/[lang]/pricing'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const pricing = getPricing(lang)
  return metaFor(lang, '/pricing', pricing.seoTitle, pricing.seoDescription)
}

function formatPrice(tier: PricingTier, lang: Locale) {
  if (tier.price === null) return lang === 'ru' ? 'по запросу' : 'on request'
  const amount = `$${tier.price.toLocaleString('en-US')}`
  return lang === 'ru' ? `от ${amount}` : `from ${amount}`
}

export default async function PricingPage({ params }: PageProps<'/[lang]/pricing'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const pricing = getPricing(lang)

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/pricing', pricing.title)} />
      <JsonLd data={pricingGraph(lang, pricing)} />
      <PageHeader title={pricing.title} intro={pricing.intro} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pricing.tiers.map((tier) => (
          <Card key={tier.slug} featured={tier.featured}>
            <h2 className="text-xl font-bold tracking-tight">{tier.title}</h2>
            <p className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">
              {formatPrice(tier, lang)}
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
      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {pricing.stackTitle}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {pricing.stack.map((group) => (
            <div key={group.group}>
              <h3 className="text-sm font-medium">{group.group}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
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
