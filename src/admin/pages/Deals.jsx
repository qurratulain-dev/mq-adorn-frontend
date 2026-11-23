import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteAdminDeal, getAdminDeals, toggleAdminDeal } from '../../api/client.js'
import { formatDateTime } from '../../lib/datetime.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

function statusLabel(deal) {
  const now = Date.now()
  const start = new Date(deal.starts_at).getTime()
  const end = new Date(deal.ends_at).getTime()
  if (!deal.is_active) return { label: 'Inactive', className: 'text-muted' }
  if (now < start) return { label: 'Scheduled', className: 'text-gold' }
  if (now > end) return { label: 'Ended', className: 'text-muted' }
  return { label: 'Live', className: 'text-success' }
}

export default function AdminDeals() {
  const [deals, setDeals] = useState([])
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toggling, setToggling] = useState(null)

  const load = () => getAdminDeals()
    .then((payload) => setDeals(payload?.data || []))
    .catch((err) => setError(err.message || 'Deals could not be loaded.'))

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Deals</h1>
          <p className="mt-1 text-sm text-muted">Create limited-time prices that apply at checkout while the deal is live.</p>
        </div>
        <Link to="/admin/deals/new" className="btn-primary px-4 py-2 text-xs">New deal</Link>
      </div>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}

      <div className="mt-6 overflow-x-auto border border-black/5 bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/5 bg-blush/40 text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {!deals.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No deals yet. Create one to show Deal of the Week on the home page.</td></tr>
            )}
            {deals.map((deal) => {
              const status = statusLabel(deal)
              return (
                <tr key={deal.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-medium">{deal.title}</td>
                  <td className="px-4 py-3 text-muted">
                    {formatDateTime(deal.starts_at)}
                    <span className="mx-1">–</span>
                    {formatDateTime(deal.ends_at)}
                  </td>
                  <td className="px-4 py-3">{deal.items?.length || 0}</td>
                  <td className={`px-4 py-3 ${status.className}`}>{status.label}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="text-xs underline underline-offset-2 disabled:opacity-50"
                        disabled={toggling === deal.id}
                        onClick={async () => {
                          setToggling(deal.id)
                          setError('')
                          try {
                            await toggleAdminDeal(deal.id)
                            await load()
                          } catch (err) {
                            setError(err.message || 'The deal could not be updated.')
                          } finally {
                            setToggling(null)
                          }
                        }}
                      >
                        {deal.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <Link to={`/admin/deals/${deal.id}`} className="text-xs underline underline-offset-2">Edit</Link>
                      <button type="button" className="text-xs text-sale underline underline-offset-2" onClick={() => setPendingDelete(deal)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this deal?"
        body={pendingDelete ? `${pendingDelete.title} will be removed and its deal prices will stop applying immediately.` : ''}
        confirmLabel="Delete deal"
        danger
        busy={busy}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          setBusy(true)
          try {
            await deleteAdminDeal(pendingDelete.id)
            setPendingDelete(null)
            load()
          } catch (err) {
            setError(err.message || 'The deal could not be deleted.')
          } finally {
            setBusy(false)
          }
        }}
      />
    </div>
  )
}
