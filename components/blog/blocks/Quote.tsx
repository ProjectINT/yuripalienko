import type { Locale } from '@/lib/i18n'
import type { PostBlock } from '@/types/content'
import RichText from '../RichText'

type QuoteBlock = Extract<PostBlock, { type: 'quote' }>

export default function Quote({ block, lang }: { block: QuoteBlock; lang: Locale }) {
  return (
    <figure className="max-w-prose border-l-2 border-line pl-6">
      <blockquote className="leading-relaxed italic">
        <RichText text={block.text} lang={lang} />
      </blockquote>
      {block.author ? (
        <figcaption className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">
          {block.author}
        </figcaption>
      ) : null}
    </figure>
  )
}
