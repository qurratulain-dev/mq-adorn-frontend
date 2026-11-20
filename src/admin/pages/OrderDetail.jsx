import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteAdminOrder, getAdminOrder, getAdminPaymentProofUrl, rejectAdminPayment, updateAdminOrderStatus, verifyAdminPayment } from '../../api/client.js'
import { formatRs } from '../../lib/format.js'
import { formatDateTime } from '../../lib/datetime.js'
import StatusBadge from '../components/StatusBadge.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const NEXT = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
}

export default function AdminOrderDetail() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [zoom, setZoom] = useState(false)

  const load = () => getAdminOrder(orderNumber).then((payload) => setOrder(payload.data)).catch((err) => setError(err.message || 'This order could not be loaded.'))

  useEffect(() => { load() }, [orderNumber])

  useEffect(() => {
    let current = ''
    if (!order?.has_payment_proof) return undefined
    getAdminPaymentProofUrl(order.order_number)
      .then((url) => { current = url; setProofUrl(url) })
      .catch(() => setProofUrl(''))
    return () => { if (current) URL.revokeObjectURL(current) }
  }, [order?.order_number, order?.has_payment_proof])

  const run = async (key, action) => {
    setBusy(key)
    setError('')
    try {
      const payload = await action()
      if (payload?.data) setOrder(payload.data)
    } catch (err) {
      const fieldError = err?.errors && Object.values(err.errors).flat().find(Boolean)
      setError(fieldError || err.message || 'The action could not be completed.')
    } finally {
      setBusy('')
    }
  }

  const nextStatus = order ? NEXT[order.status] : null

  if (!order && !error) return <p className="text-sm text-muted">Loading order…</p>
  if (!order) return <p className="text-sm text-sale">{error}</p>

  return (
    <div>
      <Link to="/admin/orders" className="text-sm underline decoration-gold underline-offset-2 hover:text-gold">Back to orders</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">{order.order_number}</h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={order.status} />
          <StatusBadge value={order.payment_status} />
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-sale">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="border border-black/5 bg-card p-5 lg:col-span-2">
          <h2 className="font-heading text-xl">Items</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="py-2">Product</th>
                <th className="py-2">Qty</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index} className="border-t border-black/5">
                  <td className="py-2">
                    {item.product_name}
                    {(item.color || item.size) && <span className="block text-xs text-muted">{[item.color, item.size].filter(Boolean).join(' · ')}</span>}
                  </td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-right">{formatRs(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatRs(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{Number(order.shipping_fee) ? formatRs(order.shipping_fee) : 'Free'}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatRs(order.total)}</dd></div>
          </dl>
        </section>

        <section className="border border-black/5 bg-card p-5">
          <h2 className="font-heading text-xl">Customer</h2>
          <p className="mt-3 text-sm">{order.customer_name}</p>
          <p className="text-sm text-muted">{order.customer_phone}</p>
          {order.customer_email && <p className="text-sm text-muted">{order.customer_email}</p>}
          <p className="mt-3 text-sm">{order.shipping_address}<br />{order.city}</p>
          {order.notes && <p className="mt-3 text-sm text-muted">Note: {order.notes}</p>}
          {order.whatsapp_url && (
            <a href={order.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full px-4 py-2 text-xs">WhatsApp the customer</a>
          )}
        </section>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="border border-black/5 bg-card p-5 lg:col-span-2">
          <h2 className="font-heading text-xl">Payment</h2>
          <p className="mt-3 text-sm capitalize">{String(order.payment_method || '').replace('_', ' ')}</p>
          {order.payment_reference && <p className="text-sm">Transaction ID: {order.payment_reference}</p>}
          {order.payment_rejection_reason && <p className="mt-2 text-sm text-sale">Rejected: {order.payment_rejection_reason}</p>}
          {proofUrl ? (
            <button type="button" className="mt-4 block" onClick={() => setZoom(true)}>
              <img src={proofUrl} alt="Payment screenshot" className="max-h-80 max-w-full border border-black/10 object-contain" />
              <span className="mt-1 block text-xs text-muted">Click to zoom</span>
            </button>
          ) : (
            <p className="mt-3 text-sm text-muted">No payment screenshot is stored for this order.</p>
          )}
        </div>
        <div className="border border-black/5 bg-card p-5">
          <h2 className="font-heading text-xl">Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            {order.payment_status !== 'verified' && order.status !== 'cancelled' && (
              <button type="button" className="btn-primary px-4 py-2 text-xs" disabled={busy === 'verify'} onClick={() => run('verify', () => verifyAdminPayment(order.order_number))}>
                {busy === 'verify' ? 'Verifying…' : 'Verify payment'}
              </button>
            )}
            {order.payment_status !== 'rejected' && order.status !== 'cancelled' && (
              <button type="button" className="btn-outline px-4 py-2 text-xs" onClick={() => setRejectOpen(true)}>Reject payment</button>
            )}
            {nextStatus && (
              <button type="button" className="btn-outline px-4 py-2 text-xs capitalize" disabled={busy === 'status'} onClick={() => run('status', () => updateAdminOrderStatus(order.order_number, nextStatus))}>
                Mark as {nextStatus}
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button type="button" className="btn-outline px-4 py-2 text-xs" disabled={busy === 'cancel'} onClick={() => run('cancel', () => updateAdminOrderStatus(order.order_number, 'cancelled'))}>
                Cancel order
              </button>
            )}
            <button type="button" className="px-4 py-2 text-xs font-medium tracking-wide text-sale uppercase" onClick={() => setDeleteOpen(true)}>Delete order</button>
          </div>
        </div>
      </section>

      {zoom && proofUrl && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4" onClick={() => setZoom(false)}>
          <img src={proofUrl} alt="Payment screenshot enlarged" className="max-h-full max-w-full object-contain" />
        </div>
      )}

      <ConfirmDialog
        open={rejectOpen}
        title="Reject this payment?"
        body="Please tell the customer why, in a short note. You can then message them on WhatsApp."
        confirmLabel="Reject payment"
        danger
        busy={busy === 'reject'}
        onClose={() => setRejectOpen(false)}
        onConfirm={async () => {
          if (!reason.trim()) { setError('Please enter a reason for rejecting this payment.'); return }
          await run('reject', () => rejectAdminPayment(order.order_number, reason.trim()))
          setRejectOpen(false)
          setReason('')
        }}
      />
      {rejectOpen && (
        <div className="pointer-events-none fixed inset-0 z-[81] flex items-end justify-center p-6 sm:items-center">
          <textarea className="pointer-events-auto mb-24 w-full max-w-md border border-black/15 bg-white p-3 text-sm outline-none focus:border-gold sm:mb-0 sm:translate-y-16" rows={3} placeholder="Reason for rejection" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this order?"
        body="This cannot be undone. Use this for TEST orders you no longer need."
        confirmLabel="Delete order"
        danger
        busy={busy === 'delete'}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setBusy('delete')
          try {
            await deleteAdminOrder(order.order_number)
            navigate('/admin/orders', { replace: true })
          } catch (err) {
            setError(err.message || 'The order could not be deleted.')
            setBusy('')
          }
        }}
      />
    </div>
  )
}
