'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { YM_ID } from '@/lib/analytics'

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void
  }
}

/**
 * Счётчик Метрики. Монтируется только при согласии — см. ConsentGate.
 *
 * strategy="lazyOnload": Next вставляет загрузчик после window.load, в простое
 * браузера. tag.js тянется асинхронно и не участвует ни в LCP, ни в TBT —
 * ради этого и не кладём официальный сниппет прямо в <head>.
 *
 * noscript-пикселя нет намеренно: без JS показать баннер и спросить согласие
 * невозможно, а значит и трекать нельзя.
 */
export default function YandexMetrika() {
  const pathname = usePathname()
  const previous = useRef<string | null>(null)

  useEffect(() => {
    // Первый хит отправляет сам init — руками досылаем только переходы внутри SPA,
    // их Метрика не видит: смена маршрута в App Router перезагрузки не делает.
    if (previous.current === null) {
      previous.current = pathname
      return
    }
    if (previous.current === pathname) return
    const referer = `${location.origin}${previous.current}`
    previous.current = pathname
    window.ym?.(YM_ID, 'hit', location.href, { referer })
  }, [pathname])

  return (
    <Script id="yandex-metrika" strategy="lazyOnload">
      {`(function(m,e,t,r,i,k,a){
   m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}', 'ym');
ym(${YM_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
    </Script>
  )
}
