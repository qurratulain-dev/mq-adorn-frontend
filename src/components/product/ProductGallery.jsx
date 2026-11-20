import { useEffect, useRef, useState } from 'react'
import { mediaUrl } from '../../lib/media.js'
import { createPortal } from 'react-dom'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ZoomIcon } from '../Icons.jsx'

export default function ProductGallery({ images, name, badge }) {
  const list = (images || []).filter(Boolean)
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const scrollerRef = useRef(null)
  const current = list[index] || null

  useEffect(() => {
    setIndex(0)
  }, [list.join('|')])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return undefined
    const child = node.children[index]
    if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    return undefined
  }, [index])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'ArrowRight') setIndex((currentIndex) => (currentIndex + 1) % list.length)
      if (event.key === 'ArrowLeft') setIndex((currentIndex) => (currentIndex - 1 + list.length) % list.length)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, list.length])

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center bg-blush/60 text-sm text-muted">No image yet</div>
    )
  }

  const go = (next) => setIndex((next + list.length) % list.length)

  const onScroll = () => {
    const node = scrollerRef.current
    if (!node) return
    const width = node.clientWidth || 1
    const next = Math.round(node.scrollLeft / width)
    if (next !== index && next >= 0 && next < list.length) setIndex(next)
  }

  return (
    <div>
      <div className="relative bg-blush/40">
        {/* Mobile / tablet swipe track */}
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto md:hidden"
          onScroll={onScroll}
          style={{ scrollbarWidth: 'none' }}
        >
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className="w-full shrink-0 snap-center"
              onClick={() => setOpen(true)}
              aria-label={`View ${name} image ${i + 1} larger`}
            >
              <img src={mediaUrl(src)} alt={i === index ? name : ''} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>

        {/* Desktop main image with hover zoom */}
        <button
          type="button"
          className="group relative hidden w-full overflow-hidden md:block"
          onClick={() => setOpen(true)}
          aria-label={`View ${name} larger`}
        >
          <img
            src={mediaUrl(current)}
            alt={name}
            className="aspect-square w-full object-cover transition duration-700 ease-out motion-reduce:transition-none group-hover:scale-110 motion-reduce:group-hover:scale-100"
          />
          <span className="absolute right-4 bottom-4 flex items-center gap-1.5 bg-white/90 px-2.5 py-1 text-[10px] tracking-wide text-primary uppercase">
            <ZoomIcon width={14} height={14} /> Zoom
          </span>
        </button>

        {badge && (
          <span className="absolute top-4 left-4 z-10 rounded-sm bg-sale px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
            {badge}
          </span>
        )}

        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute top-1/2 left-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-black/10 bg-white/80 text-primary backdrop-blur-sm transition hover:border-gold hover:text-gold md:flex"
              onClick={() => go(index - 1)}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute top-1/2 right-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-black/10 bg-white/80 text-primary backdrop-blur-sm transition hover:border-gold hover:text-gold md:flex"
              onClick={() => go(index + 1)}
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5 md:hidden" role="tablist" aria-label="Product images">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-primary/20'}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      {list.length > 1 && (
        <ul className="mt-4 hidden grid-cols-4 gap-3 md:grid" aria-label="Product thumbnails">
          {list.map((src, i) => (
            <li key={src + i}>
              <button
                type="button"
                aria-current={i === index}
                aria-label={`Show image ${i + 1}`}
                className={`block aspect-square w-full overflow-hidden border bg-blush/40 transition ${
                  i === index ? 'border-gold' : 'border-transparent hover:border-black/20'
                }`}
                onClick={() => setIndex(i)}
              >
                <img src={mediaUrl(src)} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col bg-primary/90" role="dialog" aria-modal="true" aria-label={`${name} gallery`}>
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <p className="text-sm">
                {index + 1} / {list.length}
              </p>
              <button type="button" aria-label="Close gallery" className="p-2 hover:text-gold" onClick={() => setOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8">
              <img
                src={mediaUrl(current)}
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
              {list.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/15 text-white hover:bg-white/30"
                    onClick={() => go(index - 1)}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/15 text-white hover:bg-white/30"
                    onClick={() => go(index + 1)}
                  >
                    <ChevronRightIcon />
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
