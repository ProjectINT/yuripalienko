/**
 * Согласие на аналитику и параметры Яндекс.Метрики.
 *
 * Метрика ставит куки и (вебвизор) записывает действия на странице, поэтому
 * счётчик не грузится вообще, пока пользователь явно не нажал «Принять»:
 * скрипта нет в DOM, запросов к mc.yandex.ru нет. Отказ тоже запоминается —
 * баннер больше не показывается, пока его не открыть из подвала.
 *
 * Решение лежит в localStorage, а не в куке: куку пришлось бы читать в layout
 * через cookies(), а это переводит весь сайт из SSG в динамический рендер.
 */

export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID ?? 111945991)

const STORAGE_KEY = 'yp-analytics-consent'

/** storage-событие приходит только в другие вкладки — своей нужен свой канал */
const CHANGE_EVENT = 'yp:consent-change'

/** Кнопка «Куки» в подвале открывает баннер заново */
export const OPEN_EVENT = 'yp:consent-open'

export type Consent = 'granted' | 'denied'

/**
 * Запасная копия решения на случай, когда localStorage недоступен (приватный
 * режим, запрет на хранилище): выбор тогда действует хотя бы до перезагрузки.
 */
let inMemory: Consent | null = null

/** null — выбор ещё не сделан: аналитику не включаем */
export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'granted' || value === 'denied') return value
  } catch {
    // Хранилище недоступно — ниже отдадим то, что помним в памяти вкладки.
  }
  return inMemory
}

export function writeConsent(value: Consent) {
  inMemory = value
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Не сохранилось — решение всё равно действует в этой вкладке.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Подписка для useSyncExternalStore: своя вкладка + соседние */
export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function openConsentBanner() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

/**
 * Первые куки Метрики (_ym_uid, _ym_d, _ym_isad, _ym_visorc). Куки на домене
 * mc.yandex.ru снять из JS нельзя — они третьей стороны, их чистит браузер.
 */
export function clearAnalyticsCookies() {
  const { hostname } = location
  const parts = hostname.split('.')
  const domains = [
    undefined,
    hostname,
    `.${hostname}`,
    // Кука ставится на домен второго уровня, чтобы работать и на поддоменах
    parts.length > 2 ? `.${parts.slice(-2).join('.')}` : undefined,
  ]

  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim()
    if (!name.startsWith('_ym')) continue
    for (const domain of domains) {
      document.cookie =
        `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT` +
        (domain ? `; domain=${domain}` : '')
    }
  }
}
