import { useEffect, useState } from 'react'
import { deleteAdminCustomer, getAdminCustomers } from '../../api/client.js'
import { formatDateTime } from '../../lib/datetime.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function AdminCustomers() {
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => getAdminCustomers({ q: applied }).then(setData).catch((err) => setError(err.message || 'Customers could not be loaded.'))
  useEffect(() => { load() }, [applied])

  return (
    <div>
      <h1 className="font-heading text-3xl">Customers</h1>
      <p className="mt-1 text-sm text-muted">A read-only list of accounts, with a delete option for TEST accounts.</p>
      <form className="mt-5 flex gap-3" onSubmit={(e) => { e.preventDefault(); setApplied(q) }}>
        <input className="w-full max-w-sm border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn-primary px-4 py-2 text-xs">Search</button>
      </form>
      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      <div className="mt-6 overflow-x-auto border border-black/5 bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/5 bg-blush/40 text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {!(data?.data || []).length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No customers found.</td></tr>
            )}
            {(data?.data || []).map((user) => (
              <tr key={user.id} className="border-t border-black/5">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.phone || '—'}</td>
                <td className="px-4 py-3">{user.orders_count}</td>
                <td className="px-4 py-3 text-muted">{formatDateTime(user.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="text-xs text-sale underline underline-offset-2" onClick={() => setPendingDelete(user)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this customer?"
        body={pendingDelete ? `${pendingDelete.name} (${pendingDelete.email}) will be removed. Their past orders will stay in the orders list.` : ''}
        confirmLabel="Delete account"
        danger
        busy={busy}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          setBusy(true)
          try {
            await deleteAdminCustomer(pendingDelete.id)
            setPendingDelete(null)
            load()
          } catch (err) {
            setError(err.message || 'The account could not be deleted.')
          } finally {
            setBusy(false)
          }
        }}
      />
    </div>
  )
}
