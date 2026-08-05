/**
 * Оборачивает годы в периоде («2020 — 2025», «Ноя 2020 — Июн 2025»)
 * в <time dateTime> — машиночитаемые даты для парсеров CV и портфолио.
 */
export default function PeriodText({ value }: { value: string }) {
  return (
    <>
      {value.split(/(\d{4})/).map((part, index) =>
        /^\d{4}$/.test(part) ? (
          <time key={index} dateTime={part}>
            {part}
          </time>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}
