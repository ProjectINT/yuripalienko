import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from './i18n'
import { LOCALES } from './i18n'
import type { Post, PostBlock, PostCover, PostFile } from '@/types/content'

/**
 * Единственный модуль, который знает, где лежат посты. Страницы и компоненты
 * не читают `content/posts/` сами и про `fs` не знают — ровно эта граница
 * потом подменяется на запрос к БД без правки рендера (docs/blog-json-plan.md §12).
 *
 * `node:fs` в SSG законен: код выполняется на сборке. Исключение — динамические
 * OG-роуты, они читают файлы в рантайме, поэтому Dockerfile копирует `content/`
 * в рантайм-образ.
 *
 * JSON приходит нетипизированным, поэтому здесь же валидатор: ошибка конвертации
 * должна падать на сборке с именем файла, а не превращаться в пустое место на
 * странице.
 */

const POSTS_DIR = join(process.cwd(), 'content/posts')

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/
/** URL-слаг: латиница, цифры, дефис — кириллица и пробелы в адресе не нужны */
const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Средняя скорость чтения технического текста; 180 — общепринятая оценка для обоих языков */
const WORDS_PER_MINUTE = 180

const BLOCK_TYPES = [
  'heading',
  'text',
  'list',
  'quote',
  'note',
  'code',
  'table',
  'image',
  'divider',
] as const

/* --------------------------------- разбор -------------------------------- */

function fail(file: string, message: string): never {
  throw new Error(`[posts] ${file}: ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(file: string, obj: Record<string, unknown>, key: string): string {
  const value = obj[key]
  if (typeof value !== 'string' || value.trim() === '') {
    fail(file, `${key}: ожидалась непустая строка, получено ${JSON.stringify(value)}`)
  }
  return value
}

function bool(file: string, obj: Record<string, unknown>, key: string): boolean {
  const value = obj[key]
  if (typeof value !== 'boolean') {
    fail(file, `${key}: ожидалось true или false, получено ${JSON.stringify(value)}`)
  }
  return value
}

function date(file: string, obj: Record<string, unknown>, key: string): string {
  const value = str(file, obj, key)
  if (!DATE_FORMAT.test(value) || Number.isNaN(Date.parse(value))) {
    fail(file, `${key}: ожидалась дата YYYY-MM-DD, получено "${value}"`)
  }
  return value
}

function strings(file: string, obj: Record<string, unknown>, key: string): string[] {
  const value = obj[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    fail(file, `${key}: ожидался массив строк`)
  }
  return value as string[]
}

function size(file: string, obj: Record<string, unknown>, key: string, where: string): number {
  const value = obj[key]
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    // Размеры берутся из файла инструментом, а не на глаз: расхождение с
    // реальной картинкой = сдвиг вёрстки при загрузке.
    fail(file, `${where}.${key}: ожидалось положительное число, получено ${JSON.stringify(value)}`)
  }
  return value
}

function cover(file: string, value: unknown): PostCover | null {
  if (value === null) return null
  if (!isRecord(value)) fail(file, 'cover: ожидался объект или null')
  return {
    src: str(file, value, 'src'),
    alt: str(file, value, 'alt'),
    width: size(file, value, 'width', 'cover'),
    height: size(file, value, 'height', 'cover'),
  }
}

function block(file: string, value: unknown, index: number): PostBlock {
  const where = `blocks[${index}]`
  if (!isRecord(value)) fail(file, `${where}: ожидался объект`)

  const type = value.type
  if (typeof type !== 'string' || !(BLOCK_TYPES as readonly string[]).includes(type)) {
    fail(file, `${where}.type ${JSON.stringify(type)} неизвестен; допустимы: ${BLOCK_TYPES.join(', ')}`)
  }

  switch (type as PostBlock['type']) {
    case 'heading': {
      const level = value.level
      // H1 рисует PageHeader из title — заголовок в теле задвоил бы его
      if (level !== 2 && level !== 3) fail(file, `${where}.level: допустимы только 2 и 3`)
      return { type: 'heading', level, id: str(file, value, 'id'), text: str(file, value, 'text') }
    }
    case 'text':
      return { type: 'text', text: str(file, value, 'text') }
    case 'list': {
      const items = strings(file, value, 'items')
      if (items.length === 0) fail(file, `${where}.items: список пуст`)
      return { type: 'list', ordered: bool(file, value, 'ordered'), items }
    }
    case 'quote': {
      const author = value.author
      if (author !== null && typeof author !== 'string') {
        fail(file, `${where}.author: ожидалась строка или null`)
      }
      return { type: 'quote', text: str(file, value, 'text'), author }
    }
    case 'note': {
      const variant = value.variant
      if (variant !== 'info' && variant !== 'warn') {
        fail(file, `${where}.variant: допустимы только "info" и "warn"`)
      }
      return { type: 'note', variant, text: str(file, value, 'text') }
    }
    case 'code':
      return {
        type: 'code',
        lang: str(file, value, 'lang'),
        caption: str(file, value, 'caption'),
        code: str(file, value, 'code'),
      }
    case 'table': {
      const head = strings(file, value, 'head')
      if (head.length === 0) fail(file, `${where}.head: шапка таблицы пуста`)
      const rows = value.rows
      if (!Array.isArray(rows)) fail(file, `${where}.rows: ожидался массив строк таблицы`)
      const caption = value.caption
      if (caption !== null && typeof caption !== 'string') {
        fail(file, `${where}.caption: ожидалась строка или null`)
      }
      rows.forEach((row, rowIndex) => {
        if (!Array.isArray(row) || row.some((cell) => typeof cell !== 'string')) {
          fail(file, `${where}.rows[${rowIndex}]: ожидался массив строк`)
        }
        if (row.length !== head.length) {
          fail(
            file,
            `${where}.rows[${rowIndex}]: ${row.length} ячеек против ${head.length} колонок в head`,
          )
        }
      })
      return { type: 'table', caption, head, rows: rows as string[][] }
    }
    case 'image': {
      const caption = value.caption
      if (caption !== null && typeof caption !== 'string') {
        fail(file, `${where}.caption: ожидалась строка или null`)
      }
      return {
        type: 'image',
        src: str(file, value, 'src'),
        alt: str(file, value, 'alt'),
        width: size(file, value, 'width', where),
        height: size(file, value, 'height', where),
        caption,
      }
    }
    case 'divider':
      return { type: 'divider' }
  }
}

function parsePost(file: string, lang: Locale, id: string, raw: string): PostFile {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (error) {
    fail(file, `битый JSON — ${(error as Error).message}`)
  }
  if (!isRecord(value)) fail(file, 'ожидался объект поста')

  if (str(file, value, 'id') !== id) {
    fail(file, `id "${value.id}" не совпадает с именем файла "${id}"`)
  }
  const slug = str(file, value, 'slug')
  if (!SLUG_FORMAT.test(slug)) {
    fail(file, `slug "${slug}": допустимы только строчные латинские буквы, цифры и дефис`)
  }
  if (str(file, value, 'lang') !== lang) {
    fail(file, `lang "${value.lang}" не совпадает с папкой "${lang}"`)
  }

  const updated = value.updated === null ? null : date(file, value, 'updated')

  const blocks = value.blocks
  if (!Array.isArray(blocks)) fail(file, 'blocks: ожидался массив блоков')
  const parsed = blocks.map((item, index) => block(file, item, index))

  // Дубли id ломают якоря и оглавление молча — ловим здесь
  const ids = parsed.filter((item) => item.type === 'heading').map((item) => item.id)
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index)
  if (duplicate) fail(file, `heading.id "${duplicate}" встречается дважды`)

  return {
    id,
    slug,
    lang,
    date: date(file, value, 'date'),
    updated,
    draft: bool(file, value, 'draft'),
    title: str(file, value, 'title'),
    summary: str(file, value, 'summary'),
    seoTitle: str(file, value, 'seoTitle'),
    seoDescription: str(file, value, 'seoDescription'),
    ogAlt: str(file, value, 'ogAlt'),
    tags: strings(file, value, 'tags'),
    cover: cover(file, value.cover),
    blocks: parsed,
  }
}

function readLocale(lang: Locale): Map<string, PostFile> {
  const dir = join(POSTS_DIR, lang)
  const posts = new Map<string, PostFile>()
  if (!existsSync(dir)) return posts

  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.json')) continue
    const id = name.slice(0, -'.json'.length)
    const file = `content/posts/${lang}/${name}`
    posts.set(id, parsePost(file, lang, id, readFileSync(join(dir, name), 'utf8')))
  }
  return posts
}

/* ------------------------------ время чтения ----------------------------- */

/** Снимает инлайн-разметку, чтобы `**слово**` считалось одним словом, а не тремя */
const INLINE = /\\(.)|\[([^\]]+)\]\([^\s)]+\)|[*`]/g

function words(text: string): number {
  const plain = text.replace(INLINE, (_, escaped: string | undefined, label: string | undefined) =>
    escaped ?? label ?? ' ',
  )
  return plain.split(/\s+/).filter(Boolean).length
}

function readingMinutes(blocks: PostBlock[]): number {
  let total = 0
  for (const item of blocks) {
    switch (item.type) {
      case 'heading':
      case 'text':
      case 'note':
        total += words(item.text)
        break
      case 'quote':
        total += words(item.text) + (item.author ? words(item.author) : 0)
        break
      case 'list':
        total += item.items.reduce((sum, line) => sum + words(line), 0)
        break
      case 'table':
        total +=
          item.head.reduce((sum, cell) => sum + words(cell), 0) +
          item.rows.reduce((sum, row) => sum + row.reduce((s, cell) => s + words(cell), 0), 0) +
          (item.caption ? words(item.caption) : 0)
        break
      case 'code':
        // Код читают медленнее прозы, а слов в нём меньше — считаем по строкам:
        // 10 «слов» на строку, то есть ~18 строк кода на минуту чтения
        total += item.code.split('\n').length * 10
        break
      case 'image':
        total += item.caption ? words(item.caption) : 0
        break
      case 'divider':
        break
    }
  }
  return Math.max(1, Math.round(total / WORDS_PER_MINUTE))
}

/* --------------------------- пары и публикация --------------------------- */

function structureMismatch(a: PostFile, b: PostFile): string | null {
  if (a.blocks.length !== b.blocks.length) {
    return `разное число блоков (${a.lang}: ${a.blocks.length}, ${b.lang}: ${b.blocks.length})`
  }
  for (let i = 0; i < a.blocks.length; i += 1) {
    if (a.blocks[i].type !== b.blocks[i].type) {
      return `blocks[${i}].type: ${a.lang} — ${a.blocks[i].type}, ${b.lang} — ${b.blocks[i].type}`
    }
  }
  if (a.date !== b.date) return `разная дата (${a.lang}: ${a.date}, ${b.lang}: ${b.date})`
  return null
}

function loadAll(): Record<Locale, Post[]> {
  const byLocale = Object.fromEntries(LOCALES.map((lang) => [lang, readLocale(lang)])) as Record<
    Locale,
    Map<string, PostFile>
  >

  const result = Object.fromEntries(LOCALES.map((lang) => [lang, [] as Post[]])) as Record<
    Locale,
    Post[]
  >

  const ids = [...new Set(LOCALES.flatMap((lang) => [...byLocale[lang].keys()]))].sort()

  // Слаг → id по всем локалям: слаг одной локали не должен вести к другому
  // посту в соседней, иначе редирект в proxy.ts отправит читателя не туда.
  const owners = new Map<string, string>()

  for (const id of ids) {
    // Публикуется только полная пара: непарный id не существует ни в одной
    // локали (сработает [...rest] → 404), но сборка при этом жива.
    const missing = LOCALES.filter((lang) => !byLocale[lang].has(id))
    if (missing.length > 0) {
      console.warn(`[posts] пропущено: ${id} — нет перевода ${missing.join(', ')}`)
      continue
    }

    const pair = LOCALES.map((lang) => byLocale[lang].get(id)!)
    if (pair.some((post) => post.draft)) {
      if (pair.some((post) => !post.draft)) {
        console.warn(`[posts] ${id}: draft различается между локалями — пост не публикуется`)
      }
      continue
    }

    for (const post of pair.slice(1)) {
      const mismatch = structureMismatch(pair[0], post)
      if (mismatch) console.warn(`[posts] ${id}: структура перевода разошлась — ${mismatch}`)
    }

    for (const post of pair) {
      const owner = owners.get(post.slug)
      if (owner && owner !== id) {
        fail(`content/posts/${post.lang}/${id}.json`, `slug "${post.slug}" уже занят постом "${owner}"`)
      }
      owners.set(post.slug, id)
    }

    const alternates = Object.fromEntries(pair.map((post) => [post.lang, post.slug])) as Record<
      Locale,
      string
    >

    pair.forEach((post) => {
      result[post.lang as Locale].push({
        ...post,
        alternates,
        readingMinutes: readingMinutes(post.blocks),
      })
    })
  }

  // Свежие сверху; при одной дате — стабильный порядок по id
  for (const lang of LOCALES) {
    result[lang].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
  }
  return result
}

// Валидация и чтение — один раз на процесс: страница, OG-роут, sitemap и
// индекс дёргают эти функции десятки раз за сборку.
let cache: Record<Locale, Post[]> | null = null

function all(): Record<Locale, Post[]> {
  cache ??= loadAll()
  return cache
}

/* -------------------------------- публичное ------------------------------ */

/** Опубликованные посты локали, свежие сверху */
export function getPosts(lang: Locale): Post[] {
  return all()[lang]
}

export function getPost(lang: Locale, slug: string): Post | null {
  return all()[lang].find((post) => post.slug === slug) ?? null
}

/**
 * Слаг поста в локали lang по слагу из любой локали. Для proxy.ts: чужой слаг
 * (переключатель языка, старая ссылка) → 308 на свой; null — поста нет.
 */
export function findPostSlug(lang: Locale, slug: string): string | null {
  for (const locale of LOCALES) {
    const post = all()[locale].find((item) => item.slug === slug)
    if (post) return post.alternates[lang]
  }
  return null
}
