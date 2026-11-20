import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useStoreSettings } from '../../context/StoreSettingsContext.jsx'
import { formatRs } from '../../lib/format.js'

export default function CartSummary({ onNavigate, checkoutTo = '/checkout' }) {
  const { freeShippingThreshold, remainingForFreeShipping } = useStoreSettings()
  const { items, subtotal, shippingFee, total, closeCart } = useCart()
  const remaining = remainingForFreeShipping(subtotal)
  const go = () => {
    closeCart()
    onNavigate?.()
  }

  return (
    <div>
      {remaining > 0 ? (
        <p className="text-xs leading-relaxed text-muted">
          Add {formatRs(remaining)} more for free shipping (on orders above {formatRs(freeShippingThreshold)}).
        </p>
      ) : (
        <p className="text-xs text-success">You have qualified for free shipping.</p>
      )}
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatRs(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd>{shippingFee === 0 ? 'Free' : formatRs(shippingFee)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-black/10 pt-2 font-medium">
          <dt>Total</dt>
          <dd>{formatRs(total)}</dd>
        </div>
      </dl>
      <Link
        to={checkoutTo}
        onClick={go}
        className={`btn-primary mt-5 w-full ${items.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
      >
        Checkout
      </Link>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Payment is by JazzCash, Easypaisa or bank transfer only. We do not offer Cash on Delivery. Shipping is calculated
        again when you place the order. All sales are final — no returns, refunds or exchanges.{' '}
        <Link to="/return-policy" onClick={go} className="underline decoration-gold underline-offset-2 hover:text-gold">
          Return Policy
        </Link>
      </p>
    </div>
  )
}
