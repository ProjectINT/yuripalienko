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
  const amount = new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'currency',
    currency: tier.currency,
    maximumFractionDigits: 0,
  }).format(tier.price)
  return lang === 'ru' ? `от ${amount}` : `from ${amount}`
}

export default async function PricingPage({ params }: PageProps<'/[lang]/pricing'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const pricing = getPricing(lang)
  const solo = pricing.tiers.length === 1

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/pricing', pricing.title)} />
      <JsonLd data={pricingGraph(lang, pricing)} />
      <PageHeader title={pricing.title} intro={pricing.intro} />
      {/* Один тариф разворачивается в две колонки, несколько — в сетку карточек */}
      <div className={solo ? '' : 'grid grid-cols-1 gap-6 lg:grid-cols-3'}>
        {pricing.tiers.map((tier) => (
          <Card key={tier.slug} featured={tier.featured}>
            <div
              className={
                solo ? 'grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]' : ''
              }
            >
              <div>
                <h2 className={`font-bold tracking-tight ${solo ? 'text-2xl' : 'text-xl'}`}>
                  {tier.title}
                </h2>
                <p
                  className={`mt-4 font-bold tracking-tight ${
                    solo ? 'text-3xl lg:text-5xl' : 'text-2xl lg:text-3xl'
                  }`}
                >
                  {formatPrice(tier, lang)}
                </p>
                {tier.priceNote && (
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted">
                    {tier.priceNote}
                  </p>
                )}
                <p className="mt-6 max-w-prose leading-relaxed text-muted">{tier.summary}</p>
              </div>
              <ul
                className={`text-sm leading-relaxed ${
                  solo
                    ? 'grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-line lg:pl-8'
                    : 'mt-6 space-y-1.5'
                }`}
              >
                {tier.includes.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden className="text-muted">—</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
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
