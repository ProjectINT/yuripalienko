import type { MetadataRoute } from 'next'
import { SITE_URL, INDEXING_ENABLED } from '@/lib/seo'

// Разрешаем явно, хотя `*` их и так покрывает: robots.txt — публичный документ,
// и запись в нём фиксирует решение «AI-краулеры допущены» (цитирование в
// AI-ответах — канал входящих обращений). Когда решение поменяется, здесь
// достаточно поменять allow на disallow.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    // Q5: закрыто — sitemap не публикуем, чтобы не приглашать обход
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: [
      // /_next/ НЕ закрываем: оттуда идут картинки (/_next/image), CSS и JS.
      // Запрет вырезал бы все скриншоты работ из Google Картинок и заставил бы
      // Googlebot рендерить страницы без стилей.
      { userAgent: '*', allow: '/', disallow: '/api/' },
      { userAgent: AI_BOTS, allow: '/', disallow: '/api/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
