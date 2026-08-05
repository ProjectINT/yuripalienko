import type { Locale } from '@/lib/i18n'
import type { CvJob } from '@/types/content'
import Tag from '@/components/ui/Tag'
import PeriodText from '@/components/ui/PeriodText'

export default function CvTimeline({
  jobs,
  lang,
}: {
  jobs: CvJob[]
  lang: Locale
}) {
  return (
    <div className="space-y-12">
      {jobs.map((job) => (
        <article
          key={`${job.company}-${job.period}`}
          className="grid grid-cols-1 gap-4 border-t border-line pt-8 lg:grid-cols-[12rem_1fr] lg:gap-8"
        >
          <div className="font-mono text-xs uppercase tracking-widest text-muted">
            <p>
              <PeriodText value={job.period} />
            </p>
            {job.duration && <p className="mt-1">{job.duration}</p>}
            {job.current && (
              <p className="mt-2 inline-block rounded-full border border-fg px-2 py-0.5 text-fg">
                {lang === 'ru' ? 'Сейчас' : 'Now'}
              </p>
            )}
          </div>
          <div className="min-w-0">
            {/* Под <h2>Опыт</h2> заголовок записи — должность, а не компания:
                так иерархию читают и рекрутеры, и парсеры */}
            <h3 className="break-words text-xl font-bold tracking-tight">{job.role}</h3>
            <p className="mt-1 text-sm text-muted">
              {job.company}
              {job.companyNote && <span> · {job.companyNote}</span>}
            </p>
            <p className="mt-3 max-w-prose leading-relaxed">{job.summary}</p>
            {job.bullets.length > 0 && (
              <ul className="mt-4 max-w-prose space-y-1.5 text-sm leading-relaxed text-muted">
                {job.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span aria-hidden>—</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {job.stack.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
