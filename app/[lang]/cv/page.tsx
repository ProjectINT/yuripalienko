import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getCv } from '@/lib/content'
import { metaFor } from '@/lib/seo'
import { breadcrumbs, profilePage } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import PageShell from '@/components/ui/PageShell'
import PageHeader from '@/components/ui/PageHeader'
import CvFacts from '@/components/cv/CvFacts'
import CvTimeline from '@/components/cv/CvTimeline'
import CvStack from '@/components/cv/CvStack'

export async function generateMetadata({ params }: PageProps<'/[lang]/cv'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const cv = getCv(lang)
  return metaFor(lang, '/cv', cv.seoTitle, cv.seoDescription)
}

export default async function CvPage({ params }: PageProps<'/[lang]/cv'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const cv = getCv(lang)

  return (
    <PageShell>
      <JsonLd data={breadcrumbs(lang, '/cv', cv.title)} />
      <JsonLd data={profilePage(lang, '/cv')} />
      <div className="space-y-8">
        <PageHeader title={cv.title} intro={cv.intro} />
        <a
          href={cv.pdfUrl}
          download
          className="inline-block border-b border-fg pb-1 font-mono text-sm uppercase tracking-widest transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {cv.pdfLabel} ↓
        </a>
      </div>

      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {lang === 'ru' ? 'Профиль' : 'Profile'}
        </h2>
        <p className="max-w-prose leading-relaxed">{cv.profile}</p>
      </section>

      <CvFacts facts={cv.facts} />

      <section className="space-y-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {lang === 'ru' ? 'Опыт' : 'Experience'}
        </h2>
        <CvTimeline jobs={cv.jobs} lang={lang} />
      </section>

      <section className="space-y-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {lang === 'ru' ? 'Стек' : 'Stack'}
        </h2>
        <CvStack stack={cv.stack} />
      </section>

      <section className="space-y-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          {lang === 'ru' ? 'Образование' : 'Education'}
        </h2>
        <div className="space-y-6">
          {cv.education.map((entry) => (
            <div
              key={entry.title}
              className="grid grid-cols-1 gap-2 border-t border-line pt-6 lg:grid-cols-[12rem_1fr] lg:gap-8"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {entry.year}
              </p>
              <div className="min-w-0">
                <p className="font-medium">{entry.title}</p>
                <p className="mt-1 text-sm text-muted">{entry.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
