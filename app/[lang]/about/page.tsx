import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getAbout } from '@/lib/content'
import { metaFor } from '@/lib/seo'
import { breadcrumbs, profilePage } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import CvFacts from '@/components/cv/CvFacts'
import SmartLink from '@/components/ui/SmartLink'

export async function generateMetadata({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const about = getAbout(lang)
  return metaFor(lang, '/about', about.seoTitle, about.seoDescription)
}

export default async function AboutPage({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const about = getAbout(lang)

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/about', about.title)} />
      <JsonLd data={profilePage(lang, '/about')} />
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
            {/* Свои страницы («/palistor») открываются в той же вкладке */}
            <SmartLink href={link.url} lang={lang} arrow>
              {link.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
