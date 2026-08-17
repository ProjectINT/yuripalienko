import type { PostBlock } from '@/types/content'

type HeadingBlock = Extract<PostBlock, { type: 'heading' }>

/**
 * id пишется в JSON явно (транслит слага), а не выводится из русского текста
 * в рантайме: на нём держатся якоря и `#`-ссылки из текста статьи.
 *
 * Отступ сверху — padding, а не margin: контейнер PostBody разводит блоки
 * через space-y, и margin-top на заголовке был бы им перебит.
 */
export default function Heading({ block }: { block: HeadingBlock }) {
  if (block.level === 2) {
    return (
      <h2 id={block.id} className="scroll-mt-24 pt-6 text-2xl font-bold tracking-tight lg:text-3xl">
        {block.text}
      </h2>
    )
  }
  return (
    <h3 id={block.id} className="scroll-mt-24 pt-2 text-lg font-medium lg:text-xl">
      {block.text}
    </h3>
  )
}
