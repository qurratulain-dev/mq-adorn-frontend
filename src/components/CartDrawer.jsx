import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { CloseIcon } from './Icons.jsx'
import CartItem from './cart/CartItem.jsx'
import CartSummary from './cart/CartSummary.jsx'

export default function CartDrawer() {
  const { items, cartOpen, closeCart, cartCount } = useCart()

  useEffect(() => {
    if (!cartOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') closeCart()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [cartOpen, closeCart])

  return createPortal(
    <div className={`fixed inset-0 z-[70] ${cartOpen ? '' : 'pointer-events-none'}`} aria-hidden={!cartOpen}>
      <button
        type="button"
        aria-label="Close bag"
        className={`absolute inset-0 bg-primary/40 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          cartOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 id="cart-drawer-title" className="font-heading text-2xl">
            Your bag {cartCount > 0 && <span className="text-base text-muted">({cartCount})</span>}
          </h2>
          <button type="button" aria-label="Close bag" className="p-2" onClick={closeCart}>
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-heading text-2xl">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted">Browse the collection to add jewellery or dresses.</p>
            <Link to="/shop" onClick={closeCart} className="btn-primary mt-6">
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <CartItem
                  key={`${item.slug}-${item.color}-${item.size}`}
                  item={item}
                  compact
                  onNavigate={closeCart}
                />
              ))}
            </div>
            <div className="border-t border-black/10 px-5 py-4">
              <CartSummary />
              <Link to="/cart" onClick={closeCart} className="mt-3 block text-center text-sm hover:text-gold">
                View bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  )
}
