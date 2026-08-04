import Tag from '@/components/ui/Tag'

export default function CvStack({
  stack,
}: {
  stack: { group: string; items: string[] }[]
}) {
  return (
    <div className="space-y-8">
      {stack.map((group) => (
        <div
          key={group.group}
          className="grid grid-cols-1 gap-2 border-t border-line pt-6 lg:grid-cols-[12rem_1fr] lg:gap-8"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {group.group}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
