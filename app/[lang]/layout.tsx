import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { LOCALES, isLocale } from '@/lib/i18n'
import { getSite, getNav } from '@/lib/content'
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
    metadataBase: new URL('https://yuripalienko.com'), // TODO_CONFIRM домен
    title: { default: `${site.name} — ${site.role}`, template: `%s · ${site.name}` },
    description: site.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { ru: '/ru', en: '/en' },
    },
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
