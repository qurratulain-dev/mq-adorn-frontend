import { Link } from 'react-router-dom'
import CartItem from '../components/cart/CartItem.jsx'
import CartSummary from '../components/cart/CartSummary.jsx'
import { useCart } from '../context/CartContext.jsx'
import Seo from '../components/Seo.jsx'

export default function Cart() {
  const { items, cartCount } = useCart()

  return (
    <div className="bg-cream">
      <Seo title="Your bag | MQ Adorn" description="The jewellery and dresses in your MQ Adorn bag." path="/cart" noindex />
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Shopping bag</p>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">Your bag</h1>
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        {items.length === 0 ? (
          <div className="border border-black/5 bg-card px-6 py-16 text-center">
            <p className="font-heading text-2xl">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted">Browse the collection to add jewellery or dresses.</p>
            <Link to="/shop" className="btn-primary mt-6 inline-flex">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:items-start">
            <div className="bg-card px-4 sm:px-6">
              <p className="border-b border-black/5 py-4 text-sm text-muted">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
              {items.map((item) => (
                <CartItem key={`${item.slug}-${item.color}-${item.size}`} item={item} />
              ))}
            </div>
            <aside className="border border-black/5 bg-card p-5 sm:p-6 lg:sticky lg:top-28">
              <h2 className="font-heading text-xl">Order summary</h2>
              <div className="mt-4">
                <CartSummary />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
