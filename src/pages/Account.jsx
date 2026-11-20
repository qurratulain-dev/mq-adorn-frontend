import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { getAccountOrders } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatRs } from '../lib/format.js'

function statusText(order) {
  if (order.status === 'delivered') return 'Delivered'
  if (order.status === 'shipped') return 'Shipped'
  if (order.status === 'processing') return 'Processing'
  if (order.status === 'cancelled') return 'Cancelled'
  return order.status_label || 'Payment verification pending'
}

export default function Account() {
  const { user, loading, isLoggedIn, logout } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!isLoggedIn) return undefined
    const controller = new AbortController()
    getAccountOrders({ signal: controller.signal })
      .then((payload) => {
        setOrders(payload.data || [])
        setStatus('ready')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus('error')
      })
    return () => controller.abort()
  }, [isLoggedIn])

  if (!loading && !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="bg-cream">
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page flex flex-wrap items-end justify-between gap-4 py-8 sm:py-10">
          <div>
            <p className="text-xs tracking-[0.22em] text-muted uppercase">Account</p>
            <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">My orders</h1>
            {user && <p className="mt-2 text-sm text-muted">{user.name} · {user.email}</p>}
          </div>
          <button type="button" className="btn-outline" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        {status === 'loading' || loading ? (
          <div className="space-y-3" aria-hidden="true">
            <div className="h-24 animate-pulse bg-card" />
            <div className="h-24 animate-pulse bg-card" />
          </div>
        ) : status === 'error' ? (
          <p className="text-sm text-sale">We could not load your orders. Please try again in a moment.</p>
        ) : orders.length === 0 ? (
          <div className="border border-black/5 bg-card px-6 py-16 text-center">
            <p className="font-heading text-2xl">No orders yet</p>
            <p className="mt-2 text-sm text-muted">When you place an order, it will appear here.</p>
            <Link to="/shop" className="btn-primary mt-6 inline-flex">
              Continue shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.order_number} className="border border-black/5 bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-wide text-muted uppercase">Order</p>
                    <p className="font-heading text-xl">{order.order_number}</p>
                    <p className="mt-1 text-sm text-muted">{statusText(order)}</p>
                  </div>
                  <p className="font-medium">{formatRs(order.total)}</p>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                  {order.items?.[0] ? ` · ${order.items[0].product_name}` : ''}
                  {order.item_count > 1 ? ' and more' : ''}
                </p>
                <Link to={`/account/orders/${order.order_number}`} className="mt-4 inline-block text-sm hover:text-gold">
                  View order
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
