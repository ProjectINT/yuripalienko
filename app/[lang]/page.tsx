import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getHeroCards, getSite } from '@/lib/content'
import Hero from '@/components/hero/Hero'

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const site = getSite(lang)
  const home = site.home

  return (
    <>
      <Hero lang={lang} site={site} cards={getHeroCards(lang)} />
      {/* Текстовый блок под hero (P1-9): 3D-сцена — aria-hidden, без него на
          главной ~40 слов индексируемого текста. Заодно — перелинковка. */}
      <section className="mt-24 space-y-10 border-t border-line pt-16">
        <h2 className="max-w-3xl text-2xl font-bold tracking-tight lg:text-3xl">
          {home.heading}
        </h2>
        <div className="max-w-prose space-y-6">
          {home.paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
            {home.highlightsTitle}
          </h3>
          <ul className="max-w-prose space-y-2 leading-relaxed">
            {home.highlights.map((highlight) => (
              <li key={highlight.title} className="flex gap-2">
                <span aria-hidden className="text-muted">—</span>
                <span>
                  <span className="font-medium">{highlight.title}</span>
                  <span className="text-muted"> — {highlight.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-6 font-mono text-sm uppercase tracking-widest">
          <Link
            href={`/${lang}/works`}
            className="border-b border-fg pb-1 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {home.worksLink} →
          </Link>
          <Link
            href={`/${lang}/pricing`}
            className="border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {home.pricingLink} →
          </Link>
        </div>
      </section>
    </>
  )
}
