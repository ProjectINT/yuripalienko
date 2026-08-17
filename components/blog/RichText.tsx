import type { ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'
import type { RichText as RichTextValue } from '@/types/content'
import SmartLink from '@/components/ui/SmartLink'

/**
 * Инлайн-разметка внутри строки поста — ровно четыре конструкции:
 * `**жирный**`, `*курсив*`, `` `код` `` и `[текст](url)`. Значащий символ
 * экранируется обратным слэшем: `\*` — обычная звёздочка (сноска в таблице).
 *
 * Результат — React-узлы, а не HTML-строка: dangerouslySetInnerHTML здесь не
 * нужен, поэтому экранирование пользовательского текста бесплатно, а внутренние
 * ссылки уходят в SmartLink и сами получают префикс локали и префетч.
 */

const INLINE =
  /\\([\\*`[\]()])|\*\*([\s\S]+?)\*\*|\*([\s\S]+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^\s)]+)\)/g

const LINK_CLASS =
  'underline decoration-line underline-offset-4 transition-colors hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2'

function parse(text: RichTextValue, lang: Locale, prefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0

  // matchAll, а не exec в цикле: parse рекурсивен (жирный может содержать
  // ссылку), а общий lastIndex глобальной регулярки рекурсию бы сломал.
  for (const match of text.matchAll(INLINE)) {
    const start = match.index
    if (start > cursor) nodes.push(text.slice(cursor, start))
    cursor = start + match[0].length

    const [, escaped, bold, italic, code, label, href] = match
    const key = `${prefix}-${start}`

    if (escaped !== undefined) {
      nodes.push(escaped)
    } else if (bold !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {parse(bold, lang, key)}
        </strong>,
      )
    } else if (italic !== undefined) {
      nodes.push(
        <em key={key} className="italic">
          {parse(italic, lang, key)}
        </em>,
      )
    } else if (code !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded border border-line bg-line/40 px-1 py-0.5 font-mono text-[0.9em]"
        >
          {code}
        </code>,
      )
    } else if (label !== undefined && href !== undefined) {
      // Якорь на этой же странице — обычная ссылка: SmartLink считает внешним
      // всё, что не начинается со слэша, и открыл бы «#faq» в новой вкладке.
      nodes.push(
        href.startsWith('#') ? (
          <a key={key} href={href} className={LINK_CLASS}>
            {parse(label, lang, key)}
          </a>
        ) : (
          // Внешней ссылке — ↗ и rel, как везде на сайте; внутренняя в тексте
          // остаётся обычной ссылкой, стрелка сбивала бы чтение абзаца
          <SmartLink key={key} href={href} lang={lang} arrow={!href.startsWith('/')}>
            {parse(label, lang, key)}
          </SmartLink>
        ),
      )
    }
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

export default function RichText({ text, lang }: { text: RichTextValue; lang: Locale }) {
  return <>{parse(text, lang, 'r')}</>
}
