import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getAbout } from '@/lib/content'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import CvFacts from '@/components/cv/CvFacts'
import ExternalLink from '@/components/ui/ExternalLink'

export async function generateMetadata({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const about = getAbout(lang)
  return { title: about.title, description: about.lead }
}

export default async function AboutPage({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const about = getAbout(lang)

  return (
    <PageShell>
      <PageHeader title={about.title} />
      <p className="max-w-3xl text-2xl font-medium leading-snug tracking-tight lg:text-3xl">
        {about.lead}
      </p>
      <div className="max-w-prose space-y-6">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph} className="leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>
      <CvFacts facts={about.facts} />
      <ul className="space-y-2">
        {about.links.map((link) => (
          <li key={link.url}>
            <ExternalLink href={link.url}>
              {link.label} <span aria-hidden>↗</span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
