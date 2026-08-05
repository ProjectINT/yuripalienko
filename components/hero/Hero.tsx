'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { HeroCard, SiteContent } from '@/types/content'
import HeroLightbox from './HeroLightbox'

// ssr:false обязан жить в клиентском компоненте (см. next/dist/docs, lazy-loading):
// three.js работает только с WebGL в браузере
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })

// full   — стекло, параллакс от курсора, dpr до 2 (десктоп с мышью);
// lite   — кольцо крутится, но логотип хромовый и параллакса нет (тач/узкий экран);
// static — один кадр, никакого движения (prefers-reduced-motion).
//
// Тач и reduce-motion разведены намеренно. Полный отказ от анимации — это про
// доступность, и его требует только reduce-motion. Мобильному же не тянется не
// движение как таковое, а стекло: MeshTransmissionMaterial рендерит сцену в
// буфер дважды за кадр. Убрали стекло — вращение кольца телефон везёт спокойно.
// Параллакс на тач-устройствах выключен не ради экономии: pointermove там
// приходит только во время касания, то есть сцена дёргалась бы на скролле.
//
// Читаем matchMedia через useSyncExternalStore, а не setState в эффекте: на сервере
// снапшот null, поэтому до гидратации рисуется только glow, а смена медиазапроса
// (поворот планшета, включение reduce motion) подхватывается на лету.
export type HeroMode = 'full' | 'lite' | 'static'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const LIGHTWEIGHT = '(pointer: coarse), (max-width: 767px)'

function subscribeMode(onChange: () => void) {
  const queries = [window.matchMedia(REDUCED_MOTION), window.matchMedia(LIGHTWEIGHT)]
  queries.forEach((query) => query.addEventListener('change', onChange))
  return () => queries.forEach((query) => query.removeEventListener('change', onChange))
}

function getMode(): HeroMode {
  if (window.matchMedia(REDUCED_MOTION).matches) return 'static'
  return window.matchMedia(LIGHTWEIGHT).matches ? 'lite' : 'full'
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
  // HDRI весит ~0.4 МБ: до его загрузки канвас пустой, поэтому проявляем сцену
  // поверх glow, а не вместо него. Полноценный прелоадер — Этап 3.
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  // Клик по карточке в сцене открывает полноразмерный скриншот в лайтбоксе
  const [activeCard, setActiveCard] = useState<HeroCard | null>(null)
  const closeLightbox = useCallback(() => setActiveCard(null), [])
  // Уехавшую за экран сцену незачем перерисовывать: rAF работает, пока вкладка
  // активна, и без этого рендер-цикл крутился бы всё время, что читатель
  // проводит внизу страницы. Элемент держим в state, а не в ref: ref-колбэк
  // не вызывает ререндер, а эффекту нужно узнать о появлении узла.
  const [sceneEl, setSceneEl] = useState<HTMLDivElement | null>(null)
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    if (!sceneEl) return
    // rootMargin: возобновляем чуть раньше, чем сцена реально въедет в кадр
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: '15%',
    })
    observer.observe(sceneEl)
    return () => observer.disconnect()
  }, [sceneEl])

  return (
    <section className="relative flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden lg:min-h-[calc(100dvh-6rem)]">
      {/* aria-hidden оставляем: для скринридеров кольцо декоративно, работы
          доступны на /works. Клики канвас ловит сам — рейкастом по карточкам. */}
      <div aria-hidden className="absolute inset-0">
        <HeroGlow />
        {mode !== null && (
          <div
            ref={setSceneEl}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <HeroScene
              mode={mode}
              paused={!onScreen}
              cards={cards}
              onReady={onReady}
              onCardClick={setActiveCard}
            />
          </div>
        )}
        {/* Карточки на обороте кольца заходят на текст — гасим низ кадра.
            pointer-events-none: иначе градиент съедает клики по нижним карточкам */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-bg via-bg/85 to-transparent" />
      </div>

      {/* pointer-events-auto: блок текста должен перехватывать клики, иначе они
          прошивают его насквозь и открывают невидимую карточку за градиентом */}
      <div className="pointer-events-auto relative mt-auto space-y-4 pb-10 text-center">
        <div className="space-y-2">
          {/* Один h1 с именем и специализацией (P1-9); визуально — те же две строки */}
          <h1 className="space-y-2">
            <span className="block text-2xl font-bold tracking-tight lg:text-3xl">
              {site.name}
            </span>
            <span className="block font-mono text-xs uppercase tracking-widest text-muted">
              {site.role}
            </span>
          </h1>
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

      {activeCard && (
        <HeroLightbox
          card={activeCard}
          closeLabel={lang === 'ru' ? 'Закрыть' : 'Close'}
          onClose={closeLightbox}
        />
      )}
    </section>
  )
}
