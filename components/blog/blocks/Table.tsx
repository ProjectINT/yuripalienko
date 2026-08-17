import type { Locale } from '@/lib/i18n'
import type { PostBlock } from '@/types/content'
import RichText from '../RichText'

type TableBlock = Extract<PostBlock, { type: 'table' }>

/**
 * Таблица на 5 колонок на 320px ломает вёрстку, поэтому она всегда живёт в
 * контейнере с горизонтальным скроллом — та же техника, что в CodeBlock.
 * min-w гарантирует, что колонки не сожмутся до нечитаемой ширины, а скролл
 * появится вместо переноса каждого слова.
 */
export default function Table({ block, lang }: { block: TableBlock; lang: Locale }) {
  return (
    <figure className="min-w-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {block.head.map((cell, index) => (
                <th
                  key={index}
                  scope="col"
                  className="py-3 pr-6 align-bottom font-mono text-xs font-normal uppercase tracking-widest text-muted"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-line/50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-3 pr-6 align-top leading-relaxed">
                    <RichText text={cell} lang={lang} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption ? (
        <figcaption className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
