import type { Locale } from '@/lib/i18n'
import type { PostBlock } from '@/types/content'
import RichText from '../RichText'

type NoteBlock = Extract<PostBlock, { type: 'note' }>

/**
 * Палитра сайта монохромная, поэтому варианты различаются не цветом, а весом
 * линии: info — обычная линия, warn — контрастная.
 */
export default function Note({ block, lang }: { block: NoteBlock; lang: Locale }) {
  return (
    <aside
      className={`max-w-prose border-l-2 p-4 leading-relaxed text-muted ${
        block.variant === 'warn' ? 'border-fg bg-line/40' : 'border-line bg-line/20'
      }`}
    >
      <RichText text={block.text} lang={lang} />
    </aside>
  )
}
