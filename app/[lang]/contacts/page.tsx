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
  return metaFor(lang, '/contacts', contacts.seoTitle, contacts.seoDescription)
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
      <PageHeader title={contacts.title} intro={contacts.intro} />

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
              {lang === 'ru' ? 'Формат' : 'Availability'}
            </dt>
            <dd className="mt-1 leading-relaxed">{contacts.availability}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-muted">
              {lang === 'ru' ? 'Локация' : 'Location'}
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
                  rel="noreferrer noopener"
                  className="underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {channel.label}: {channel.value} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
