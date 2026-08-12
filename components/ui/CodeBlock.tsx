import type { PalistorCode } from '@/types/content'
import { highlight } from '@/lib/highlight'
import CopyButton from './CopyButton'

/**
 * Серверный компонент: подсветка выполняется на сборке, в HTML попадает
 * готовая разметка. Клиентского JS — только CopyButton.
 */
export default async function CodeBlock({
  block,
  copyLabel,
  copiedLabel,
}: {
  block: PalistorCode
  /** подписи приходят из локализованного контента, а не хардкодятся внутри */
  copyLabel: string
  copiedLabel: string
}) {
  const html = await highlight(block.code, block.lang)

  return (
    <figure className="min-w-0">
      {/* Кнопка живёт в подписи, а не поверх кода: на 320px наложенная кнопка
          закрывает начало первой строки. figcaption обязан быть прямым
          потомком figure, поэтому флекс-ряд — это он сам. */}
      <figcaption className="mb-2 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted">
        <span className="min-w-0">{block.caption}</span>
        <CopyButton code={block.code} label={copyLabel} copiedLabel={copiedLabel} />
      </figcaption>
      <div className="min-w-0 rounded-lg border border-line bg-line/20">
        {/* shiki отдаёт готовый <pre><code>; overflow-x-auto обязателен, иначе
            длинные строки ломают вёрстку на телефоне.
            dangerouslySetInnerHTML безопасен: вход — литералы из нашего JSON,
            не пользовательский ввод. */}
        <div
          className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:bg-transparent!"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </figure>
  )
}
