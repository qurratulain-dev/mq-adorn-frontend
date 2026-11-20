import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../api/client.js'
import { formatRs } from '../../lib/format.js'
import { formatDateTime } from '../../lib/datetime.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminDashboard()
      .then((payload) => setData(payload.data))
      .catch((err) => setError(err.message || 'The dashboard could not be loaded.'))
  }, [])

  if (error) return <p className="text-sm text-sale">{error}</p>
  if (!data) return <p className="text-sm text-muted">Loading dashboard…</p>

  const cards = [
    { label: 'Pending payment checks', value: data.pending_payment_verifications },
    { label: "Today's orders", value: data.todays_orders },
    { label: 'Verified revenue', value: formatRs(data.verified_revenue) },
  ]

  return (
    <div>
      <h1 className="font-heading text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">A snapshot of orders and payments.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border border-black/5 bg-card p-5">
            <p className="text-xs tracking-wide text-muted uppercase">{card.label}</p>
            <p className="mt-2 font-heading text-3xl">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-5">
        {Object.entries(data.orders_by_status || {}).map(([status, count]) => (
          <div key={status} className="border border-black/5 bg-card p-4">
            <p className="text-[11px] tracking-wide text-muted uppercase">{status}</p>
            <p className="mt-1 text-2xl font-medium">{count}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm underline decoration-gold underline-offset-2 hover:text-gold">View all</Link>
        </div>
        <div className="mt-4 overflow-x-auto border border-black/5 bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-black/5 bg-blush/40 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Placed</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_orders || []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No orders yet.</td></tr>
              )}
              {(data.recent_orders || []).map((order) => (
                <tr key={order.order_number} className="border-t border-black/5">
                  <td className="px-4 py-3"><Link to={`/admin/orders/${order.order_number}`} className="hover:text-gold">{order.order_number}</Link></td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{formatRs(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge value={order.status} /></td>
                  <td className="px-4 py-3"><StatusBadge value={order.payment_status} /></td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
