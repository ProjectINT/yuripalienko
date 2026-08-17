import { Fragment } from 'react'
import type { Locale } from '@/lib/i18n'
import type { PostBlock } from '@/types/content'
import CodeBlock from '@/components/ui/CodeBlock'
import Heading from './blocks/Heading'
import Text from './blocks/Text'
import List from './blocks/List'
import Quote from './blocks/Quote'
import Note from './blocks/Note'
import Table from './blocks/Table'
import Figure from './blocks/Figure'
import Divider from './blocks/Divider'

/**
 * Единственное место, где тип блока превращается в разметку. Ветка default
 * присваивает block переменной типа never: новый вариант в PostBlock без ветки
 * здесь валит `tsc`, а не оставляет пустое место на странице.
 */
function renderBlock(block: PostBlock, lang: Locale, copyLabel: string, copiedLabel: string) {
  switch (block.type) {
    case 'heading':
      return <Heading block={block} />
    case 'text':
      return <Text block={block} lang={lang} />
    case 'list':
      return <List block={block} lang={lang} />
    case 'quote':
      return <Quote block={block} lang={lang} />
    case 'note':
      return <Note block={block} lang={lang} />
    case 'code':
      // Тот же компонент, что на /palistor, вместе с кнопкой копирования
      return <CodeBlock block={block} copyLabel={copyLabel} copiedLabel={copiedLabel} />
    case 'table':
      return <Table block={block} lang={lang} />
    case 'image':
      return <Figure block={block} />
    case 'divider':
      return <Divider />
    default: {
      const unknownBlock: never = block
      throw new Error(`[posts] неизвестный тип блока: ${JSON.stringify(unknownBlock)}`)
    }
  }
}

export default function PostBody({
  blocks,
  lang,
  copyLabel,
  copiedLabel,
}: {
  blocks: PostBlock[]
  lang: Locale
  /** подписи кнопки копирования приходят из articles.json локали */
  copyLabel: string
  copiedLabel: string
}) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <Fragment key={index}>{renderBlock(block, lang, copyLabel, copiedLabel)}</Fragment>
      ))}
    </div>
  )
}
