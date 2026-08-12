import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getPalistor } from '@/lib/content'
import { metaFor } from '@/lib/seo'
import { breadcrumbs, faqPage, palistorGraph } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import ExternalLink from '@/components/ui/ExternalLink'
import CodeBlock from '@/components/ui/CodeBlock'

/**
 * `/{lang}/palistor` — канонический URL бренда Palistor (короткий, под
 * брендовый запрос из выдачи).
 *
 * Когда появится общий роут страниц проектов `/{lang}/works/[slug]` (P1-3 из
 * docs/seo-plan.md), slug `palistor` даст два URL с одним содержимым и
 * каннибализацию. Тогда — либо исключить `palistor` из generateStaticParams
 * того роута, либо отдать с него 301 сюда через redirects() в next.config.ts.
 * Вопрос решён здесь, переоткрывать его не нужно.
 */

export async function generateMetadata({ params }: PageProps<'/[lang]/palistor'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const palistor = getPalistor(lang)
  return metaFor(lang, '/palistor', palistor.seoTitle, palistor.seoDescription)
}

export default async function PalistorPage({ params }: PageProps<'/[lang]/palistor'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const palistor = getPalistor(lang)
  const { copyLabel, copiedLabel } = palistor

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/palistor', palistor.title)} />
      <JsonLd data={palistorGraph(lang, palistor)} />
      <JsonLd data={faqPage(lang, '/palistor', palistor.faq)} />

      <div className="space-y-6">
        <PageHeader title={palistor.title} intro={palistor.intro} />
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {palistor.meta.join(' · ')}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm uppercase tracking-widest">
          {palistor.links.map((link) => (
            <ExternalLink
              key={link.url}
              href={link.url}
              className={
                link.primary
                  ? 'border border-fg px-4 py-2 transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2'
                  : 'border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2'
              }
            >
              {link.label} <span aria-hidden>↗</span>
            </ExternalLink>
          ))}
        </div>
      </div>

      {/* Продакшен-использование — главный аргумент доверия и единственное,
          чего нет у github.com и npmjs.com в той же выдаче. */}
      <section id="used" className="space-y-3 border-t border-line pt-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {palistor.usedInTitle}
        </h2>
        <ul className="space-y-1.5 leading-relaxed">
          {palistor.usedIn.map((project) => (
            <li key={project.url} className="flex gap-2">
              <span aria-hidden className="text-muted">—</span>
              <span>
                <ExternalLink href={project.url} className="font-medium underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2">
                  {project.title}
                </ExternalLink>
                <span className="text-muted"> — {project.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Image
        src="/works/palistor-1.webp"
        alt={palistor.screenshotAlt}
        width={1600}
        height={900}
        sizes="(max-width: 1024px) 100vw, 65vw"
        // Вероятный LCP-элемент страницы
        priority
        className="h-auto w-full border border-line"
      />

      <section id="layers" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {palistor.layersTitle}
          </h2>
          <p className="max-w-prose leading-relaxed text-muted">{palistor.layersLead}</p>
        </div>
        <div className="space-y-12">
          {palistor.layers.map((layer) => (
            <div key={layer.index} className="min-w-0 space-y-4 border-t border-line pt-8">
              <h3 className="flex items-baseline gap-3">
                <span className="font-mono text-xs tracking-widest text-muted">
                  {layer.index}
                </span>
                <span className="text-lg font-medium lg:text-xl">{layer.title}</span>
              </h3>
              <p className="max-w-prose leading-relaxed text-muted">{layer.text}</p>
              {layer.code && (
                <CodeBlock
                  block={layer.code}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="start" className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {palistor.startTitle}
        </h2>
        <CodeBlock block={palistor.install} copyLabel={copyLabel} copiedLabel={copiedLabel} />
        <div className="space-y-12">
          {palistor.steps.map((step) => (
            <div key={step.index} className="min-w-0 space-y-4 border-t border-line pt-8">
              <h3 className="flex items-baseline gap-3">
                <span className="font-mono text-xs tracking-widest text-muted">
                  {step.index}
                </span>
                <span className="text-lg font-medium lg:text-xl">{step.title}</span>
              </h3>
              <p className="max-w-prose leading-relaxed text-muted">{step.text}</p>
              <CodeBlock
                block={step.code}
                copyLabel={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {palistor.featuresTitle}
        </h2>
        <dl className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          {palistor.features.map((feature) => (
            <div key={feature.term} className="min-w-0">
              <dt className="font-medium">{feature.term}</dt>
              <dd className="mt-1 leading-relaxed text-muted">{feature.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="fit" className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {palistor.fitTitle}
          </h2>
          <ul className="space-y-2 leading-relaxed">
            {palistor.fit.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden className="text-muted">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {palistor.unfitTitle}
          </h2>
          <ul className="space-y-2 leading-relaxed text-muted">
            {palistor.unfit.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden>—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="demo" className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {palistor.demoTitle}
        </h2>
        <p className="max-w-prose leading-relaxed text-muted">{palistor.demoLead}</p>
        <ul className="space-y-2 leading-relaxed">
          {palistor.demo.map((tab) => (
            <li key={tab.url} className="flex gap-2">
              <span aria-hidden className="text-muted">—</span>
              <span>
                <ExternalLink href={tab.url} className="font-medium underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2">
                  {tab.label}
                </ExternalLink>
                <span className="text-muted"> — {tab.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section id="faq" className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {palistor.faqTitle}
        </h2>
        <div className="max-w-prose space-y-8">
          {palistor.faq.map((item) => (
            <div key={item.q} className="space-y-2">
              <h3 className="font-medium">{item.q}</h3>
              <p className="leading-relaxed text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-6 border-t border-line pt-8">
        <p className="max-w-prose leading-relaxed text-muted">{palistor.ctaText}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm uppercase tracking-widest">
          <Link
            href={`/${lang}/contacts`}
            className="border-b border-fg pb-1 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {palistor.ctaLabel} →
          </Link>
          <Link
            href={`/${lang}/works`}
            className="border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {palistor.worksLabel} →
          </Link>
          <ExternalLink
            href="https://github.com/ProjectINT/palistor#readme"
            className="border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {palistor.docsLabel} <span aria-hidden>↗</span>
          </ExternalLink>
        </div>
      </div>
    </PageShell>
  )
}
