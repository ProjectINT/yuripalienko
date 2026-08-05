import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { LOCALES, isLocale } from '@/lib/i18n'
import { getSite, getNav } from '@/lib/content'
import { SITE_URL, metaFor } from '@/lib/seo'
import { rootGraph } from '@/lib/schema'
import JsonLd from '@/components/seo/JsonLd'
import SideNav from '@/components/layout/SideNav'
import MobileNav from '@/components/layout/MobileNav'
import Footer from '@/components/layout/Footer'
import '../globals.css'

const sans = Geist({
  variable: '--font-app-sans',
  subsets: ['latin', 'cyrillic'],
})

const mono = Geist_Mono({
  variable: '--font-app-mono',
  subsets: ['latin', 'cyrillic'],
})

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
    // canonical/hreflang, robots (kill-switch Q5), OG и twitter — для главной;
    // каждая внутренняя страница переопределяет их своим metaFor(lang, path, …),
    // потому что alternates наследуются и иначе канонизируют всё на главную.
    ...metaFor(lang, '', site.seoTitle, site.seoDescription),
    // Шаблон — для страниц без собственного absolute-title (например, 404)
    title: { default: site.seoTitle, template: `%s · ${site.name}` },
    // Этап 5 (после снятия флага индексации): коды подтверждения площадок.
    // verification: { google: '…', other: { 'msvalidate.01': '…' }, yandex: '…' },
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
          <Footer lang={lang} />
        </div>
      </body>
    </html>
  )
}
