'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import {
  OPEN_EVENT,
  clearAnalyticsCookies,
  readConsent,
  subscribeConsent,
  writeConsent,
  type Consent,
} from '@/lib/analytics'
import type { ConsentContent } from '@/types/content'
import ConsentBanner from './ConsentBanner'
import YandexMetrika from './YandexMetrika'

const noopSubscribe = () => () => {}

/**
 * Единственное место, где решается, грузить ли Метрику. На сервере и в момент
 * гидрации не рендерит ничего: согласие лежит в localStorage, и любой другой
 * порядок либо разошёлся бы с разметкой сервера, либо (через cookies()) увёл
 * бы весь сайт из SSG в динамику.
 */
export default function ConsentGate({ content }: { content: ConsentContent }) {
  // Отдельный «сторож гидрации»: до неё сервер и клиент обязаны совпасть.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null)
  const [reopened, setReopened] = useState(false)

  useEffect(() => {
    const open = () => setReopened(true)
    window.addEventListener(OPEN_EVENT, open)
    return () => window.removeEventListener(OPEN_EVENT, open)
  }, [])

  const decide = useCallback((value: Consent) => {
    const wasGranted = readConsent() === 'granted'
    writeConsent(value)
    setReopened(false)

    if (wasGranted && value === 'denied') {
      clearAnalyticsCookies()
      // Размонтировать <Script> недостаточно: tag.js уже загружен и продолжает
      // слушать страницу. Единственный надёжный способ оборвать сбор прямо
      // сейчас — перезагрузка: после неё скрипт просто не будет вставлен.
      location.reload()
    }
  }, [])

  const dismiss = useCallback(() => setReopened(false), [])

  if (!hydrated) return null

  return (
    <>
      {consent === 'granted' && <YandexMetrika />}
      {(consent === null || reopened) && (
        <ConsentBanner
          content={content}
          current={consent}
          onDecide={decide}
          onDismiss={dismiss}
        />
      )}
    </>
  )
}
