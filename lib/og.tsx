import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_URL } from './seo'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/**
 * Общий рендер OG-картинки 1200×630: тёмный фон сайта, монограмма YP,
 * заголовок + подзаголовок, домен внизу. Geist из assets/fonts — TTF
 * с кириллицей, потому что дефолтный шрифт ImageResponse русский не покроет.
 */
export async function ogImage(title: string, subtitle: string) {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/Geist-Regular.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/Geist-Bold.ttf')),
  ])
  const domain = SITE_URL.replace(/^https?:\/\//, '')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          backgroundColor: '#0a0a0b',
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(245,245,245,0.12), rgba(10,10,11,0) 65%)',
          color: '#f5f5f5',
          fontFamily: 'Geist',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 76,
              height: 76,
              border: '2px solid #f5f5f5',
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            YP
          </div>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 10,
              textTransform: 'uppercase',
              color: '#a1a1a1',
            }}
          >
            {SITE_NAME}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 1020,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, color: '#a1a1a1', lineHeight: 1.4, maxWidth: 980 }}>
            {subtitle}
          </div>
        </div>
        <div
          style={{
            fontSize: 24,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#a1a1a1',
          }}
        >
          {domain}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Geist', data: regular, weight: 400, style: 'normal' },
        { name: 'Geist', data: bold, weight: 700, style: 'normal' },
      ],
    },
  )
}
