import type { Locale } from '@/lib/i18n'
import type { PostBlock } from '@/types/content'
import RichText from '../RichText'

type TextBlock = Extract<PostBlock, { type: 'text' }>

/** Тело статьи — основным цветом: muted оставлен лидам, подписям и врезкам */
export default function Text({ block, lang }: { block: TextBlock; lang: Locale }) {
  return (
    <p className="max-w-prose leading-relaxed">
      <RichText text={block.text} lang={lang} />
    </p>
  )
}
