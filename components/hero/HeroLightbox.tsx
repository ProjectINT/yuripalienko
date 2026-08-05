'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { HeroCard } from '@/types/content'

export default function HeroLightbox({
  card,
  closeLabel,
  onClose,
}: {
  card: HeroCard
  closeLabel: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    // Под оверлеем страница скроллиться не должна
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.title}
      className="animate-lightbox fixed inset-0 z-50 flex items-center justify-center bg-bg/90 p-6 backdrop-blur-sm lg:p-12"
      onClick={onClose}
    >
      <figure
        className="w-full max-w-5xl"
        // Клик по самому скриншоту и подписи не закрывает — закрывают фон, крестик и Esc
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={card.full}
          alt={card.title}
          width={1600}
          height={900}
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="max-h-[80dvh] w-full border border-line object-contain"
          priority
        />
        <figcaption className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-muted">
          {card.title}
        </figcaption>
      </figure>
      <button
        type="button"
        autoFocus
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-line font-mono text-sm text-muted transition-colors hover:border-fg hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 lg:right-8 lg:top-8"
      >
        ✕
      </button>
    </div>
  )
}
