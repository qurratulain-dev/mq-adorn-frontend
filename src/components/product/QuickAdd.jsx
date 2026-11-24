import { useEffect, useMemo, useState } from 'react'
import { mediaUrl } from '../../lib/media.js'
import { createPortal } from 'react-dom'
import { useCart } from '../../context/CartContext.jsx'
import { colorHex, findVariant, firstAvailableSelection, uniqueValues } from '../../lib/product.js'
import { formatRs } from '../../lib/format.js'
import { CloseIcon } from '../Icons.jsx'

export default function QuickAdd({ product, open, onClose }) {
  const { addToCart } = useCart()
  const variants = product?.variants || []
  const initial = firstAvailableSelection(variants)
  const [color, setColor] = useState(initial.color)
  const [size, setSize] = useState(initial.size)

  useEffect(() => {
    if (!open) return undefined
    const selection = firstAvailableSelection(variants)
    setColor(selection.color)
    setSize(selection.size)
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, product, onClose]) // eslint-disable-line react-hooks/exhaustive-deps

  const colors = useMemo(() => uniqueValues(variants, 'color'), [variants])
  const sizes = useMemo(() => {
    const inColor = color ? variants.filter((item) => item.color === color) : variants
    const list = uniqueValues(inColor, 'size')
    return list.length ? list : uniqueValues(variants, 'size')
  }, [variants, color])

  const variant = useMemo(() => findVariant(variants, color, size), [variants, color, size])
  const stock = Number(variant?.stock || 0)
  const price = variant?.price || product.sale_price || product.price
  const image = product.images?.[0]

  const add = () => {
    if (!variant || stock < 1) return
    addToCart(product, {
      color: variant.color || color || null,
      size: variant.size || size || null,
      price,
    })
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className={`fixed inset-0 z-[80] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-primary/40 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-md bg-cream shadow-xl transition-all duration-300 ease-out motion-reduce:transition-none sm:inset-y-auto sm:bottom-1/2 sm:rounded-sm ${
          open ? 'translate-y-0 opacity-100 sm:translate-y-1/2' : 'translate-y-full opacity-0 sm:translate-y-[70%]'
        }`}
      >
        <div className="flex items-start gap-4 border-b border-black/10 px-5 py-4">
          {image && <img src={mediaUrl(image)} alt={product?.name || 'Product'} className="h-16 w-16 object-cover" />}
          <div className="min-w-0 flex-1">
            <h2 id="quick-add-title" className="font-heading text-xl">
              Choose options
            </h2>
            <p className="text-sm">{product.name}</p>
            <p className="mt-1 text-sm font-medium">{formatRs(price)}</p>
          </div>
          <button type="button" aria-label="Close" className="p-1 text-muted hover:text-primary" onClick={onClose}>
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {colors.length > 0 && (
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">Colour{color ? ` — ${color}` : ''}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((value) => {
                  const selected = color === value
                  const hex = colorHex(value)
                  const available = variants.some((item) => item.color === value && Number(item.stock) > 0)
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      aria-pressed={selected}
                      className={`min-w-10 border px-3 py-1.5 text-sm transition ${
                        selected ? 'border-gold bg-blush' : 'border-black/15 bg-white hover:border-gold'
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                      onClick={() => {
                        setColor(value)
                        const nextSizes = uniqueValues(
                          variants.filter((item) => item.color === value),
                          'size',
                        )
                        if (nextSizes.length && !nextSizes.includes(size)) setSize(nextSizes[0])
                      }}
                    >
                      {hex && (
                        <span className="mr-2 inline-block h-3 w-3 rounded-full border border-black/10" style={{ background: hex }} />
                      )}
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">Size{size ? ` — ${size}` : ''}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((value) => {
                  const selected = size === value
                  const option = findVariant(variants, color, value)
                  const available = Number(option?.stock || 0) > 0
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      aria-pressed={selected}
                      className={`min-w-10 border px-3 py-1.5 text-sm transition ${
                        selected ? 'border-gold bg-blush' : 'border-black/15 bg-white hover:border-gold'
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                      onClick={() => setSize(value)}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button type="button" className="btn-primary w-full" disabled={!variant || stock < 1} onClick={add}>
            {stock < 1 ? 'Out of stock' : 'Add to bag'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
