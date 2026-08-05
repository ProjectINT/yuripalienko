import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Yuri Palienko — Full-Stack Architect & Team Lead',
    short_name: 'YP',
    description:
      'Full-Stack JavaScript architect and Team Lead. Node.js / NestJS / React. SaaS platforms and marketplaces from scratch to production.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    icons: [
      {
        src: '/favicon/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
