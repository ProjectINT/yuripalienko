'use client'

import { useEffect } from 'react'
import type { Consent } from '@/lib/analytics'
import type { ConsentContent } from '@/types/content'

/**
 * Полоса согласия внизу экрана. Не модальная: сайт читается и без ответа,
 * просто аналитика до ответа выключена.
 */
export default function ConsentBanner({
  content,
  current,
  onDecide,
  onDismiss,
}: {
  content: ConsentContent
  /** null — выбор ещё не сделан; иначе баннер открыт повторно из подвала */
  current: Consent | null
  onDecide: (value: Consent) => void
  onDismiss: () => void
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Escape закрывает только повторно открытый баннер: закрыть первый показ,
      // не ответив, значит остаться без выбора и увидеть его снова.
      if (event.key === 'Escape' && current !== null) onDismiss()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [current, onDismiss])

  return (
    <div
      role="region"
      aria-label={content.title}
      className="animate-consent fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur lg:pl-64"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <p className="max-w-2xl font-mono text-xs leading-relaxed text-muted">
          <span className="text-fg">{content.title}</span> · {content.text}
          {current !== null && (
            <> {current === 'granted' ? content.statusGranted : content.statusDenied}</>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-3 font-mono text-xs tracking-widest">
          <button
            type="button"
            onClick={() => onDecide('denied')}
            className="border border-line px-4 py-2 text-muted transition-colors hover:border-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {content.decline}
          </button>
          <button
            type="button"
            onClick={() => onDecide('granted')}
            className="border border-fg bg-fg px-4 py-2 text-bg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {content.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
