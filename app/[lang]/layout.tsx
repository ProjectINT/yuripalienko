import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { LOCALES, isLocale } from '@/lib/i18n'
import { getSite, getNav } from '@/lib/content'
import { SITE_URL, robotsMeta } from '@/lib/seo'
import { rootGraph } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import SideNav from '@/components/layout/SideNav'
import MobileNav from '@/components/layout/MobileNav'
import Footer from '@/components/layout/Footer'
import ConsentGate from '@/components/analytics/ConsentGate'
import '../globals.css'

const sans = Geist({
  variable: '--font-app-sans',
  subsets: ['latin', 'cyrillic'],
})

const mono = Geist_Mono({
  variable: '--font-app-mono',
  subsets: ['latin', 'cyrillic'],
})

const NOT_FOUND_TITLE: Record<Locale, string> = {
  ru: '404 — Страница не найдена',
  en: '404 — Page not found',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const site = getSite(lang)
  return {
    metadataBase: new URL(SITE_URL),
    // Здесь НЕТ canonical/hreflang, description и OG: метаданные наследуются
    // поверхностно, и всё, что задано в layout, достаётся 404-границам
    // (not-found после notFound() свои generateMetadata не применяет). Битая
    // ссылка тогда превьюшилась в мессенджере как главная. Главная берёт
    // свой metaFor в app/[lang]/page.tsx, как и все остальные страницы.
    //
    // title.default используют только страницы без собственного absolute-title —
    // сегодня это ровно not-found-границы, поэтому default = заголовок 404.
    title: { default: NOT_FOUND_TITLE[lang], template: `%s · ${site.name}` },
    robots: robotsMeta, // kill-switch Q5 для тех же 404
    // Панели вебмастера подтверждаются через DNS — мета-теги verification не нужны.
  }
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const site = getSite(lang)
  const nav = getNav(lang)

  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-bg text-fg">
        <JsonLd data={rootGraph(lang)} />
        <MobileNav lang={lang} items={nav.items} site={site} />
        <SideNav lang={lang} items={nav.items} site={site} />
        <div className="lg:pl-64">
          <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 pt-24 pb-24 lg:px-12 lg:pt-16">
            {children}
          </main>
          <Footer lang={lang} settingsLabel={site.consent.settings} />
        </div>
        <ConsentGate content={site.consent} />
      </body>
    </html>
  )
}
