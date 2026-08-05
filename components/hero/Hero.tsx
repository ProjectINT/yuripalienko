'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { HeroCard, SiteContent } from '@/types/content'

// ssr:false обязан жить в клиентском компоненте (см. next/dist/docs, lazy-loading):
// three.js работает только с WebGL в браузере
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })

// full = полная анимация, static = один кадр (мобильные, prefers-reduced-motion).
// Читаем matchMedia через useSyncExternalStore, а не setState в эффекте: на сервере
// снапшот null, поэтому до гидратации рисуется только glow, а смена медиазапроса
// (поворот планшета, включение reduce motion) подхватывается на лету.
type HeroMode = 'full' | 'static'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const LIGHTWEIGHT = '(pointer: coarse), (max-width: 767px)'

function subscribeMode(onChange: () => void) {
  const queries = [window.matchMedia(REDUCED_MOTION), window.matchMedia(LIGHTWEIGHT)]
  queries.forEach((query) => query.addEventListener('change', onChange))
  return () => queries.forEach((query) => query.removeEventListener('change', onChange))
}

function getMode(): HeroMode {
  const lightweight =
    window.matchMedia(REDUCED_MOTION).matches || window.matchMedia(LIGHTWEIGHT).matches
  return lightweight ? 'static' : 'full'
}

function HeroGlow() {
  return (
    <div
      aria-hidden
      className="animate-hero-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,245,245,0.08),transparent_60%)]"
    />
  )
}

export default function Hero({
  lang,
  site,
  cards,
}: {
  lang: Locale
  site: SiteContent
  cards: HeroCard[]
}) {
  const mode = useSyncExternalStore<HeroMode | null>(subscribeMode, getMode, () => null)
  // HDRI весит ~1.6 МБ: до его загрузки канвас пустой, поэтому проявляем сцену
  // поверх glow, а не вместо него. Полноценный прелоадер — Этап 3.
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  return (
    <section className="relative flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden lg:min-h-[calc(100dvh-6rem)]">
      <div aria-hidden className="absolute inset-0">
        <HeroGlow />
        {mode !== null && (
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <HeroScene animate={mode === 'full'} cards={cards} onReady={onReady} />
          </div>
        )}
        {/* Карточки на обороте кольца заходят на текст — гасим низ кадра */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-bg via-bg/85 to-transparent" />
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
