import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { formatRs } from '../../lib/format.js'
import { CloseIcon, MinusIcon, PlusIcon } from '../Icons.jsx'

export default function CartItem({ item, compact = false, onNavigate }) {
  const { updateQuantity, removeItem } = useCart()
  const qty = item.quantity || 1
  const meta = [item.color, item.size].filter(Boolean).join(' · ')

  return (
    <article className={`flex gap-3 ${compact ? 'py-3' : 'gap-4 border-b border-black/5 py-5'}`}>
      <Link
        to={`/product/${item.slug}`}
        onClick={onNavigate}
        className={`shrink-0 overflow-hidden bg-blush/50 ${compact ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28'}`}
      >
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] text-muted">No image</span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${item.slug}`} onClick={onNavigate} className="font-medium hover:text-gold">
              {item.name}
            </Link>
            {meta && <p className="mt-0.5 text-xs text-muted">{meta}</p>}
            <p className="mt-1 text-sm">{formatRs(item.price)}</p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            className="p-1 text-muted transition hover:text-sale"
            onClick={() => removeItem(item.slug, item.color, item.size)}
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
        <div className="mt-3 inline-flex items-center border border-black/15 bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="px-2 py-1.5 disabled:opacity-40"
            disabled={qty <= 1}
            onClick={() => updateQuantity(item.slug, item.color, item.size, qty - 1)}
          >
            <MinusIcon width={14} height={14} />
          </button>
          <span className="min-w-8 px-1 text-center text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="px-2 py-1.5"
            onClick={() => updateQuantity(item.slug, item.color, item.size, qty + 1)}
          >
            <PlusIcon width={14} height={14} />
          </button>
        </div>
      </div>
    </article>
  )
}
