#!/usr/bin/env node
/**
 * Проверка SEO-полей контента перед сборкой (P2-5 из docs/seo-audit-2026-08-28.md).
 *
 * Выдача обрезает title после ~60 символов и description после ~155 — поля
 * разъезжаются через три правки, если их не ловить автоматически. Скрипт
 * читает content/{ru,en}/*.json, кейсы в works.json и content/posts/** и
 * падает с ненулевым кодом при нарушении. Запускается из `pnpm build`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const LIMITS = {
  seoTitle: { min: 25, max: 60 },
  seoDescription: { min: 70, max: 155 },
  ogAlt: { min: 10, max: 200 },
  h1: { min: 3, max: 110 },
}
const DATE = /^\d{4}-\d{2}-\d{2}$/
const LOCALES = ['ru', 'en']
const PAGES = ['site', 'works', 'about', 'articles', 'pricing', 'cv', 'contacts', 'palistor']

const errors = []

function check(where, obj, keys, { updated = true } = {}) {
  for (const key of keys) {
    const value = obj[key]
    const limit = LIMITS[key]
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${where}: ${key} отсутствует`)
      continue
    }
    const length = [...value].length
    if (length < limit.min || length > limit.max) {
      errors.push(`${where}: ${key} — ${length} симв., норма ${limit.min}–${limit.max}: «${value}»`)
    }
  }
  if (updated && (typeof obj.updated !== 'string' || !DATE.test(obj.updated))) {
    errors.push(`${where}: updated — ожидалась дата YYYY-MM-DD`)
  }
}

for (const lang of LOCALES) {
  for (const page of PAGES) {
    const file = `content/${lang}/${page}.json`
    const data = JSON.parse(readFileSync(file, 'utf8'))
    check(file, data, page === 'site' ? ['seoTitle', 'seoDescription', 'ogAlt'] : ['seoTitle', 'seoDescription', 'ogAlt', 'h1'])

    if (page === 'works') {
      for (const item of data.items) {
        if (!item.page?.startsWith('/works/')) continue
        check(`${file} → ${item.slug}`, item, ['seoTitle', 'seoDescription', 'ogAlt', 'h1'])
        if (!Array.isArray(item.description) || item.description.length === 0) {
          errors.push(`${file} → ${item.slug}: у кейса со страницей нет description`)
        }
      }
    }
  }

  const dir = join('content/posts', lang)
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.json')) continue
    const file = `${dir}/${name}`
    const post = JSON.parse(readFileSync(file, 'utf8'))
    if (post.draft) continue
    check(file, post, ['seoTitle', 'seoDescription', 'ogAlt'], { updated: false })
  }
}

if (errors.length > 0) {
  console.error(`[check-seo] ${errors.length} проблем:\n` + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
console.log('[check-seo] ok')
