import { Link } from 'react-router-dom'
import { BagIcon, HeartIcon } from './Icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatRs, salePercent } from '../lib/format.js'

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const image = product.images?.[0]
  const onSale = Boolean(product.sale_price)
  const percent = salePercent(product.price, product.sale_price)
  const loved = isWishlisted(product.slug)

  return (
    <article className="flex h-full flex-col bg-card p-3 shadow-[0_10px_30px_-22px_rgba(26,26,26,0.45)] sm:p-4">
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-contain p-3" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
          )}
        </Link>
        {onSale && (
          <span className="absolute top-3 left-3 rounded-sm bg-sale px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
            {percent ? `${percent}% Off` : 'Sale'}
          </span>
        )}
        <button
          type="button"
          aria-label={loved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={loved}
          className={`absolute top-3 right-3 text-primary transition hover:text-sale ${loved ? 'text-sale' : ''}`}
          onClick={() => toggleWishlist(product)}
        >
          <HeartIcon width={20} height={20} />
        </button>
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium hover:text-gold">
          {product.name}
        </Link>
        <p className="mt-1.5 text-sm">
          {onSale ? (
            <>
              <span className="font-medium text-sale">{formatRs(product.sale_price)}</span>{' '}
              <s className="text-muted">{formatRs(product.price)}</s>
            </>
          ) : (
            <span className="font-medium">{formatRs(product.price)}</span>
          )}
        </p>
        <button type="button" className="btn-primary mt-3 w-full px-4 py-2.5 text-xs" onClick={() => addToCart(product)}>
          <BagIcon width={16} height={16} /> Add to Cart
        </button>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-card p-3 sm:p-4" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-cream" />
      <div className="mt-3 h-4 w-3/4 animate-pulse bg-cream" />
      <div className="mt-2 h-4 w-1/2 animate-pulse bg-cream" />
      <div className="mt-3 h-10 animate-pulse bg-cream" />
    </div>
  )
}
