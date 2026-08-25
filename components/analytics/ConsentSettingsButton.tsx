'use client'

import { openConsentBanner } from '@/lib/analytics'

/** Кнопка в подвале: открывает баннер заново, чтобы поменять решение */
export default function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openConsentBanner}
      className="transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {label}
    </button>
  )
}
