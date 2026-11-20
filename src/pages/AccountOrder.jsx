import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { getAccountOrder, submitReview } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatRs } from '../lib/format.js'
import DeliveryAddress from '../components/DeliveryAddress.jsx'

export default function AccountOrder() {
  const { orderNumber } = useParams()
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ product_id: '', rating: 5, comment: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [thanks, setThanks] = useState(false)

  const load = (signal) =>
    getAccountOrder(orderNumber, { signal })
      .then((payload) => {
        setOrder(payload.data)
        const firstUnreviewed = (payload.data.items || []).find((item) => !item.reviewed)
        setForm((current) => ({
          ...current,
          product_id: firstUnreviewed?.product_id ? String(firstUnreviewed.product_id) : '',
        }))
        setStatus('ready')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus(error.status === 404 ? 'notfound' : 'error')
      })

  useEffect(() => {
    if (!isLoggedIn) return undefined
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [isLoggedIn, orderNumber])

  if (!loading && !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const onReview = async (event) => {
    event.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await submitReview(orderNumber, {
        product_id: Number(form.product_id),
        rating: Number(form.rating),
        comment: form.comment.trim(),
      })
      setForm((current) => ({ ...current, comment: '', rating: 5 }))
      setThanks(true)
      await load()
    } catch (error) {
      setErrors(error.errors || {})
      const value = error.errors ? Object.values(error.errors)[0] : null
      setFormError((Array.isArray(value) ? value[0] : value) || error.message || 'We could not save your review.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'notfound') {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="font-heading text-3xl">Order not found</h1>
        <Link to="/account" className="btn-primary mt-6 inline-flex">
          Back to my orders
        </Link>
      </section>
    )
  }

  const unreviewed = (order?.items || []).filter((item) => !item.reviewed)

  return (
    <div className="bg-cream">
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <Link to="/account" className="text-xs tracking-wide text-muted uppercase hover:text-gold">
            My orders
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">{orderNumber}</h1>
          {order && <p className="mt-2 text-sm text-muted">{order.status_label} · {order.status === 'delivered' ? 'Delivered' : order.status}</p>}
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        {status !== 'ready' || !order ? (
          <div className="h-40 animate-pulse bg-card" />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:items-start">
            <div className="border border-black/5 bg-card p-5 sm:p-6">
              <h2 className="font-heading text-xl">Items</h2>
              <ul className="mt-4 divide-y divide-black/5">
                {order.items.map((item) => (
                  <li key={`${item.product_id}-${item.color}-${item.size}`} className="flex justify-between gap-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted">
                        {[item.color, item.size].filter(Boolean).join(' · ')}
                        {item.quantity > 1 ? ` · Qty ${item.quantity}` : ''}
                        {item.reviewed ? ' · Review submitted' : ''}
                      </p>
                    </div>
                    <p>{formatRs(item.line_total)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{formatRs(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd>{Number(order.shipping_fee) === 0 ? 'Free' : formatRs(order.shipping_fee)}</dd>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-2 font-medium">
                  <dt>Total</dt>
                  <dd>{formatRs(order.total)}</dd>
                </div>
              </dl>
            </div>

            <aside className="space-y-6">
              <div className="border border-black/5 bg-card p-5 sm:p-6">
                <h2 className="font-heading text-xl">Delivery</h2>
                <p className="mt-3 text-sm">{order.customer_name}</p>
                <p className="text-sm text-muted">{order.customer_phone}</p>
                {order.customer_email && <p className="text-sm text-muted">{order.customer_email}</p>}
                <DeliveryAddress order={order} />
              </div>

              {(thanks || (order.items || []).some((item) => item.reviewed)) && (
                <div className="border border-black/5 bg-card p-5 sm:p-6">
                  <p className="text-sm">Thanks! Your review has been submitted.</p>
                </div>
              )}

              {order.can_review && unreviewed.length > 0 && (
                <form className="border border-black/5 bg-card p-5 sm:p-6" onSubmit={onReview}>
                  <h2 className="font-heading text-xl">Leave a review</h2>
                  <p className="mt-2 text-xs text-muted">Your review will be checked before it appears on the product page.</p>
                  <label className="mt-4 block">
                    <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Product</span>
                    <select
                      className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
                      value={form.product_id}
                      onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    >
                      {unreviewed.map((item) => (
                        <option key={item.product_id} value={item.product_id}>
                          {item.product_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <fieldset className="mt-4">
                    <legend className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Rating</legend>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`h-9 w-9 border text-sm ${form.rating === value ? 'border-gold bg-blush' : 'border-black/15 bg-white'}`}
                          onClick={() => setForm({ ...form, rating: value })}
                          aria-pressed={form.rating === value}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="mt-4 block">
                    <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Your review</span>
                    <textarea
                      className="min-h-24 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    />
                  </label>
                  {formError && <p className="mt-3 text-sm text-sale">{formError}</p>}
                  <button type="submit" className="btn-primary mt-4 w-full" disabled={saving || !form.product_id}>
                    {saving ? 'Sending…' : 'Submit review'}
                  </button>
                </form>
              )}

            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
