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
  // Своего opengraph-image.tsx у сегмента нет — запасная статическая картинка
  return metaFor(lang, '/about', about.seoTitle, about.seoDescription, {
    image: { alt: about.ogAlt },
  })
}

export default async function AboutPage({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const about = getAbout(lang)

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/about', about.title)} />
      <JsonLd data={profilePage(lang, '/about')} />
      <PageHeader title={about.h1} />
      <p className="max-w-3xl text-2xl font-medium leading-snug tracking-tight lg:text-3xl">
        {about.lead}
      </p>

      {about.sections.map((section) => (
        <section key={section.heading} className="space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            {section.heading}
          </h2>
          <div className="max-w-prose space-y-6">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {about.factsTitle}
        </h2>
        <CvFacts facts={about.facts} />
      </section>

      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {about.linksTitle}
        </h2>
        <ul className="space-y-2">
          {about.links.map((link) => (
            <li key={link.url}>
              {/* Свои страницы («/palistor», «/works/…») открываются в той же вкладке */}
              <SmartLink href={link.url} lang={lang} arrow>
                {link.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  )
}
