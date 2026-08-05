/**
 * Встраивает schema.org разметку в серверный рендер.
 * Экранирование `<` — рекомендация next/dist/docs (json-ld.md): защита от
 * закрытия тега </script> данными.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
