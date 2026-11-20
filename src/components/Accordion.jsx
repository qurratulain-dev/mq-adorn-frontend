import { useEffect, useState } from 'react'

export default function Accordion({ items, allowMultiple = false, initialId }) {
  const [open, setOpen] = useState(() => (initialId ? [initialId] : items[0]?.id ? [items[0].id] : []))

  useEffect(() => {
    if (!initialId) return
    setOpen((current) => (current.includes(initialId) ? current : allowMultiple ? [...current, initialId] : [initialId]))
  }, [initialId, allowMultiple])

  const toggle = (id) => {
    setOpen((current) => {
      const isOpen = current.includes(id)
      if (allowMultiple) return isOpen ? current.filter((item) => item !== id) : [...current, id]
      return isOpen ? [] : [id]
    })
  }

  return (
    <div className="border-t border-black/10">
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        return (
          <div key={item.id} id={item.id} className="border-b border-black/10">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              <span className="font-medium">{item.title}</span>
              <span className="shrink-0 text-gold" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden text-sm leading-relaxed text-muted">{item.body}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
