import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import vesper from 'shiki/themes/vesper.mjs'
import bash from 'shiki/langs/bash.mjs'
import typescript from 'shiki/langs/typescript.mjs'
import tsx from 'shiki/langs/tsx.mjs'

/**
 * Точечный highlighter вместо `import { codeToHtml } from 'shiki'`: тот тянет
 * все грамматики и темы разом (десятки мегабайт на стадии сборки). Здесь —
 * движок, ровно три языка и одна тема.
 *
 * JS-движок регулярок (без WASM): грамматик мало, разницы в скорости на этом
 * объёме нет, зато сборка не зависит от загрузки onig.wasm.
 *
 * shiki — devDependency: страница SSG, подсветка выполняется на сборке и
 * впекается в статический HTML, в рантайм-образ пакет не едет.
 */
export const CODE_THEME = 'vesper'

let highlighter: Promise<HighlighterCore> | null = null

// Модульный синглтон: пять блоков кода × две локали не должны поднимать
// движок десять раз.
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [vesper],
    langs: [bash, typescript, tsx],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

export async function highlight(code: string, lang: string) {
  const shiki = await getHighlighter()
  return shiki.codeToHtml(code, { lang, theme: CODE_THEME })
}
