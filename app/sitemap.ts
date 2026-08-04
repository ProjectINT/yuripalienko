import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n'

const ROUTES = ['', '/works', '/about', '/articles', '/pricing', '/cv', '/contacts']
const BASE = 'https://yuripalienko.com' // TODO_CONFIRM домен

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((lang) =>
    ROUTES.map((route) => ({ url: `${BASE}/${lang}${route}` }))
  )
}
