'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { SiteContent } from '@/types/content'

// ssr:false обязан жить в клиентском компоненте (см. next/dist/docs, lazy-loading):
// three.js работает только с WebGL в браузере
const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <HeroGlow />,
})

function HeroGlow() {
  return (
    <div
      aria-hidden
      className="animate-hero-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,245,245,0.08),transparent_60%)]"
    />
  )
}

export default function Hero({ lang, site }: { lang: Locale; site: SiteContent }) {
  // null — до маунта (показываем glow), дальше full = анимация, static = один кадр
  const [mode, setMode] = useState<'full' | 'static' | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 767px)').matches
    setMode(reducedMotion || mobile ? 'static' : 'full')
  }, [])

  return (
    <section className="relative flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden lg:min-h-[calc(100dvh-6rem)]">
      <div aria-hidden className="absolute inset-0">
        {mode === null ? <HeroGlow /> : <HeroScene animate={mode === 'full'} />}
      </div>

      <div className="pointer-events-none relative mt-auto space-y-4 pb-10 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{site.name}</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">{site.role}</p>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted lg:text-base">
            {site.tagline}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center justify-center gap-6 font-mono text-sm uppercase tracking-widest">
          <Link
            href={`/${lang}/works`}
            className="border-b border-fg pb-1 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {lang === 'ru' ? 'Работы' : 'Work'}
          </Link>
          <Link
            href={`/${lang}/contacts`}
            className="border-b border-line pb-1 text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {lang === 'ru' ? 'Контакты' : 'Contact'}
          </Link>
        </div>
      </div>
    </section>
  )
}
