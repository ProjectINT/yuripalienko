import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import vesper from 'shiki/themes/vesper.mjs'
import bash from 'shiki/langs/bash.mjs'
import typescript from 'shiki/langs/typescript.mjs'
import tsx from 'shiki/langs/tsx.mjs'
import javascript from 'shiki/langs/javascript.mjs'
import jsx from 'shiki/langs/jsx.mjs'
import json from 'shiki/langs/json.mjs'
import css from 'shiki/langs/css.mjs'
import html from 'shiki/langs/html.mjs'
import sql from 'shiki/langs/sql.mjs'
import yaml from 'shiki/langs/yaml.mjs'
import python from 'shiki/langs/python.mjs'

/**
 * Точечный highlighter вместо `import { codeToHtml } from 'shiki'`: тот тянет
 * все грамматики и темы разом (десятки мегабайт на стадии сборки). Здесь —
 * движок, одна тема и закрытый список языков.
 *
 * JS-движок регулярок (без WASM): грамматик мало, разницы в скорости на этом
 * объёме нет, зато сборка не зависит от загрузки onig.wasm.
 *
 * shiki — devDependency: страницы SSG, подсветка выполняется на сборке и
 * впекается в статический HTML, в рантайм-образ пакет не едет.
 */
export const CODE_THEME = 'vesper'

// Список расширяется по мере надобности. Языка нет в списке — блок отдаётся
// без подсветки (см. highlight): shiki на незнакомом lang бросает исключение,
// и одна статья роняла бы прод-сборку целиком.
const LANGS = [bash, typescript, tsx, javascript, jsx, json, css, html, sql, yaml, python]

let highlighter: Promise<HighlighterCore> | null = null

// Модульный синглтон: пять блоков кода × две локали не должны поднимать
// движок десять раз.
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [vesper],
    langs: LANGS,
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

const ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Фолбэк: тот же контейнер, что у shiki, но без токенов и без цвета */
function plain(code: string) {
  const escaped = code.replace(/[&<>"']/g, (char) => ESCAPE[char])
  return `<pre class="shiki"><code>${escaped}</code></pre>`
}

export async function highlight(code: string, lang: string) {
  const shiki = await getHighlighter()
  const key = lang.trim().toLowerCase()

  // getLoadedLanguages отдаёт и имена, и алиасы («ts», «js», «yml»)
  if (!shiki.getLoadedLanguages().includes(key)) {
    console.warn(`[highlight] грамматика "${lang}" не подключена — блок без подсветки`)
    return plain(code)
  }
  return shiki.codeToHtml(code, { lang: key, theme: CODE_THEME })
}
