import type { Locale } from '@/lib/i18n'
import type { PostBlock } from '@/types/content'
import RichText from '../RichText'

type ListBlock = Extract<PostBlock, { type: 'list' }>

/**
 * Маркер ненумерованного списка — длинное тире, как на /palistor и /works:
 * штатных `list-disc` на сайте нет ни в одном списке.
 */
export default function List({ block, lang }: { block: ListBlock; lang: Locale }) {
  if (block.ordered) {
    return (
      <ol className="max-w-prose list-decimal space-y-2 pl-6 leading-relaxed marker:font-mono marker:text-sm marker:text-muted">
        {block.items.map((item, index) => (
          <li key={index} className="pl-1">
            <RichText text={item} lang={lang} />
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ul className="max-w-prose space-y-2 leading-relaxed">
      {block.items.map((item, index) => (
        <li key={index} className="flex gap-2">
          <span aria-hidden className="text-muted">
            —
          </span>
          <span className="min-w-0">
            <RichText text={item} lang={lang} />
          </span>
        </li>
      ))}
    </ul>
  )
}
