import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOrders } from '../../api/client.js'
import { formatRs } from '../../lib/format.js'
import { formatDateTime } from '../../lib/datetime.js'
import StatusBadge from '../components/StatusBadge.jsx'

const STATUSES = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const PAYMENTS = ['', 'pending', 'verified', 'rejected']

export default function AdminOrders() {
  const [filters, setFilters] = useState({ status: '', payment_status: '', q: '' })
  const [applied, setApplied] = useState(filters)
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminOrders({ ...applied, page })
      .then(setData)
      .catch((err) => setError(err.message || 'Orders could not be loaded.'))
  }, [applied, page])

  const submit = (event) => {
    event.preventDefault()
    setPage(1)
    setApplied({ ...filters })
  }

  return (
    <div>
      <h1 className="font-heading text-3xl">Orders</h1>
      <form className="mt-5 grid gap-3 sm:grid-cols-4" onSubmit={submit}>
        <input className="border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Search order no, name or phone" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <select className="border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          {STATUSES.map((s) => <option key={s || 'all'} value={s}>{s ? s : 'All statuses'}</option>)}
        </select>
        <select className="border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" value={filters.payment_status} onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}>
          {PAYMENTS.map((s) => <option key={s || 'all'} value={s}>{s ? s : 'All payments'}</option>)}
        </select>
        <button type="submit" className="btn-primary px-4 py-2 text-xs">Filter</button>
      </form>
      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      <div className="mt-6 overflow-x-auto border border-black/5 bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/5 bg-blush/40 text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {!(data?.data || []).length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No orders match these filters.</td></tr>
            )}
            {(data?.data || []).map((order) => (
              <tr key={order.order_number} className="border-t border-black/5">
                <td className="px-4 py-3"><Link to={`/admin/orders/${order.order_number}`} className="hover:text-gold">{order.order_number}</Link></td>
                <td className="px-4 py-3">
                  <div>{order.customer_name}</div>
                  <div className="text-xs text-muted">{order.customer_phone}</div>
                </td>
                <td className="px-4 py-3">{order.city}</td>
                <td className="px-4 py-3">{formatRs(order.total)}</td>
                <td className="px-4 py-3"><StatusBadge value={order.status} /></td>
                <td className="px-4 py-3"><StatusBadge value={order.payment_status} /></td>
                <td className="px-4 py-3 text-muted">{formatDateTime(order.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && data.last_page > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button type="button" className="underline disabled:no-underline disabled:text-muted" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {data.current_page} of {data.last_page}</span>
          <button type="button" className="underline disabled:no-underline disabled:text-muted" disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
