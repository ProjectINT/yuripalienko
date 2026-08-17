import Image from 'next/image'
import type { PostBlock } from '@/types/content'

type ImageBlock = Extract<PostBlock, { type: 'image' }>

/**
 * width/height приходят из файла (валидатор требует их обязательными) —
 * next/image резервирует место и картинка не сдвигает текст при загрузке.
 */
export default function Figure({ block }: { block: ImageBlock }) {
  return (
    <figure className="min-w-0 space-y-3">
      <Image
        src={block.src}
        alt={block.alt}
        width={block.width}
        height={block.height}
        sizes="(max-width: 1024px) 100vw, 65vw"
        className="h-auto w-full border border-line"
      />
      {block.caption ? (
        <figcaption className="max-w-prose text-sm leading-relaxed text-muted">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
