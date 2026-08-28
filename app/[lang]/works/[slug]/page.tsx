import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { isLocale } from '@/lib/i18n'
import { getWorks } from '@/lib/content'
import { metaFor } from '@/lib/seo'
import { breadcrumbs, caseStudyGraph } from '@/lib/schema'
import type { WorkItem } from '@/types/content'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import ExternalLink from '@/components/ui/ExternalLink'
import PeriodText from '@/components/ui/PeriodText'
import Tag from '@/components/ui/Tag'

/**
 * Страница кейса: /{lang}/works/{slug}. Раскладывает то, что на /works ужато
 * в карточку, — описание, что сделано, стек, все скриншоты настоящими <img>
 * с alt (в hero они живут только текстурами внутри <canvas>).
 *
 * Кейс получает страницу, если у него в works.json есть page = /works/<slug>
 * и description. palistor сюда не входит: его канон — /palistor
 * (см. комментарий там), /works/palistor → 301 в next.config.ts.
 */
export const dynamicParams = false

const withPage = (lang: Locale) =>
  getWorks(lang).items.filter(
    (item): item is WorkItem & { page: string; description: string[] } =>
      item.page === `/works/${item.slug}` && Array.isArray(item.description),
  )

export function generateStaticParams({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) return []
  return withPage(params.lang).map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[lang]/works/[slug]'>) {
  const { lang, slug } = await params
  if (!isLocale(lang)) return {}
  const item = withPage(lang).find((work) => work.slug === slug)
  if (!item) return {}
  return metaFor(
    lang,
    item.page,
    item.seoTitle ?? `${item.title} | Palisoft`,
    item.seoDescription ?? item.summary,
  )
}

export default async function CasePage({ params }: PageProps<'/[lang]/works/[slug]'>) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const works = getWorks(lang)
  const items = withPage(lang)
  const index = items.findIndex((work) => work.slug === slug)
  if (index === -1) notFound()
  const item = items[index]
  const labels = works.caseLabels
  const images = item.images ?? []
  // Соседние кейсы — перелинковка внутри раздела, а не только «назад»
  const prev = items[index - 1]
  const next = items[index + 1]

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbs(lang, item.page, item.title, { path: '/works', name: works.title })}
      />
      <JsonLd data={caseStudyGraph(lang, item, item.page)} />

      <div className="space-y-8">
        <PageHeader title={item.h1 ?? item.title} intro={item.summary} />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-muted">
              {labels.company}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">{item.company}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-muted">
              {labels.role}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">{item.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-muted">
              {labels.period}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">
              <PeriodText value={item.period} />
            </dd>
          </div>
          {item.url && (
            <div className="min-w-0">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted">
                {labels.site}
              </dt>
              <dd className="mt-1 break-words text-sm leading-relaxed">
                <ExternalLink
                  href={item.url}
                  className="underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {item.url.replace(/^https?:\/\//, '')} <span aria-hidden>↗</span>
                </ExternalLink>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {images.length > 0 && (
        <div className="space-y-6">
          {images.map((image, i) => (
            <figure key={image.name} className="space-y-2">
              <Image
                src={image.src}
                alt={labels.screenshot.replace('{title}', item.title).replace('{n}', String(i + 1))}
                width={1600}
                height={900}
                sizes="(max-width: 1024px) 100vw, 65vw"
                // Первый скриншот — вероятный LCP-элемент страницы
                priority={i === 0}
                className="h-auto w-full border border-line"
              />
              <figcaption className="font-mono text-xs uppercase tracking-widest text-muted">
                {item.title} — {String(i + 1).padStart(2, '0')}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">{labels.about}</h2>
        <div className="max-w-prose space-y-6">
          {item.description.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {item.highlights.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">{labels.done}</h2>
          <ul className="max-w-prose space-y-2 leading-relaxed">
            {item.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <span aria-hidden className="text-muted">—</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">{labels.stack}</h2>
        <div className="flex flex-wrap gap-2">
          {item.stack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </section>

      <div className="space-y-6 border-t border-line pt-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm uppercase tracking-widest">
          <Link
            href={`/${lang}/contacts`}
            className="border-b border-fg pb-1 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {labels.cta} →
          </Link>
          <Link
            href={`/${lang}/pricing`}
            className="border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {labels.pricing} →
          </Link>
          <Link
            href={`/${lang}/works`}
            className="border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ← {labels.back}
          </Link>
        </div>
        {(prev || next) && (
          <nav
            aria-label={works.title}
            className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/${lang}${prev.page}`}
                className="group min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-muted">←</span>
                <span className="mt-1 block break-words font-medium transition-colors group-hover:text-muted">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/${lang}${next.page}`}
                className="group min-w-0 text-right focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-muted">→</span>
                <span className="mt-1 block break-words font-medium transition-colors group-hover:text-muted">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </PageShell>
  )
}
