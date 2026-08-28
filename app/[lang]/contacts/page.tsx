import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getContacts } from '@/lib/content'
import { metaFor } from '@/lib/seo'
import { breadcrumbs, contactPage } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'

export async function generateMetadata({ params }: PageProps<'/[lang]/contacts'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const contacts = getContacts(lang)
  // Своего opengraph-image.tsx у сегмента нет — запасная статическая картинка
  return metaFor(lang, '/contacts', contacts.seoTitle, contacts.seoDescription, {
    image: { alt: contacts.ogAlt },
  })
}

export default async function ContactsPage({ params }: PageProps<'/[lang]/contacts'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const contacts = getContacts(lang)
  const primary = contacts.channels.filter((channel) => channel.primary)
  const secondary = contacts.channels.filter((channel) => !channel.primary)

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/contacts', contacts.title)} />
      <JsonLd data={contactPage(lang, '/contacts')} />
      <PageHeader title={contacts.h1} intro={contacts.intro} />

      <div className="space-y-8">
        {primary.map((channel) => (
          <div key={channel.url} className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {channel.label}
            </p>
            <a
              href={channel.url}
              {...(channel.url.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer noopener' }
                : {})}
              className="mt-2 inline-block break-words text-[clamp(1.5rem,4vw,3rem)] font-bold leading-tight tracking-tight transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {channel.value}
            </a>
          </div>
        ))}
      </div>

      <div className="space-y-6 border-t border-line pt-8">
        {/* Q3: формат работы (весь мир) — первым, локация — вторым фактом */}
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-muted">
              {contacts.availabilityLabel}
            </dt>
            <dd className="mt-1 leading-relaxed">{contacts.availability}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-muted">
              {contacts.locationLabel}
            </dt>
            <dd className="mt-1 leading-relaxed">{contacts.location}</dd>
          </div>
        </dl>
        {secondary.length > 0 && (
          <ul className="space-y-2">
            {secondary.map((channel) => (
              <li key={channel.url}>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noreferrer noopener me"
                  className="underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {channel.label}: {channel.value} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Что написать и что будет дальше: страница из 90 слов выглядела для
          поиска как soft-404, а для клиента — как тупик без следующего шага */}
      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {contacts.briefTitle}
        </h2>
        <ul className="max-w-prose space-y-2 leading-relaxed">
          {contacts.brief.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="text-muted">—</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {contacts.processTitle}
        </h2>
        <ol className="space-y-8">
          {contacts.process.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-1 gap-2 border-t border-line pt-6 lg:grid-cols-[12rem_1fr] lg:gap-8"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {String(index + 1).padStart(2, '0')}
              </p>
              <div className="min-w-0 max-w-prose">
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          href={`/${lang}/pricing`}
          className="inline-block border-b border-line pb-1 font-mono text-sm uppercase tracking-widest text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {lang === 'ru' ? 'Цены и форматы работы' : 'Pricing & engagement'} →
        </Link>
      </section>
    </PageShell>
  )
}
