import type { WorkItem } from '@/types/content'
import Tag from '@/components/ui/Tag'
import ExternalLink from '@/components/ui/ExternalLink'

export default function WorkCard({ item }: { item: WorkItem }) {
  return (
    <article
      className={`min-w-0 border-t border-line pt-8 ${
        item.featured ? 'lg:col-span-2' : ''
      }`}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {item.period}
      </p>
      <h2 className="mt-3 break-words text-2xl font-bold tracking-tight lg:text-3xl">
        {item.url ? (
          <ExternalLink
            href={item.url}
            className="transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {item.title} <span aria-hidden>↗</span>
          </ExternalLink>
        ) : (
          item.title
        )}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {item.company} · {item.role}
      </p>
      <p className="mt-4 max-w-prose leading-relaxed">{item.summary}</p>
      {item.highlights.length > 0 && (
        <ul className="mt-4 max-w-prose space-y-1.5 text-sm leading-relaxed text-muted">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span aria-hidden>—</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {item.stack.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>
    </article>
  )
}
