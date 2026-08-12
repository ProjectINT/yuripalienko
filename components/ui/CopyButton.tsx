'use client'

import { useState } from 'react'

/**
 * Единственный клиентский компонент на /palistor. Обе подписи приходят
 * пропсами из локализованного JSON — внутри компонента строк нет.
 */
export default function CopyButton({
  code,
  label,
  copiedLabel,
}: {
  code: string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер недоступен (нет https, отказ в разрешении) — молча ничего
      // не делаем: код виден и выделяется руками.
    }
  }

  return (
    <span className="shrink-0">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? copiedLabel : label}
        className="border-b border-line pb-0.5 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {copied ? copiedLabel : label}
      </button>
      {/* Отдельный live-регион: смена текста на самой кнопке при фокусе на ней
          читается скринридером ненадёжно. */}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </span>
  )
}
