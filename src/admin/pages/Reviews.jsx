import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { approveAdminReview, deleteAdminReview, getAdminReviews, rejectAdminReview, updateAdminReview } from '../../api/client.js'
import { formatDateTime } from '../../lib/datetime.js'
import StatusBadge from '../components/StatusBadge.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const FILTERS = ['pending', 'approved', 'rejected', '']

function emptyEdit(review) {
  return {
    rating: review?.rating || 5,
    comment: review?.comment || '',
    customer_name: review?.customer_name || '',
    show_on_home: review?.show_on_home !== false,
  }
}

export default function AdminReviews() {
  const [status, setStatus] = useState('pending')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)
  const [edit, setEdit] = useState(emptyEdit())
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => getAdminReviews({ status }).then(setData).catch((err) => setError(err.message || 'Reviews could not be loaded.'))

  useEffect(() => { load() }, [status])

  const act = async (fn) => {
    setError('')
    try {
      await fn()
      load()
    } catch (err) {
      setError(err.message || 'The review could not be updated.')
    }
  }

  const startEdit = (review) => {
    setEditing(review)
    setEdit(emptyEdit(review))
    setEditError('')
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    setEditError('')
    setSaving(true)
    try {
      await updateAdminReview(editing.id, {
        rating: Number(edit.rating),
        comment: edit.comment.trim(),
        customer_name: edit.customer_name.trim(),
        show_on_home: Boolean(edit.show_on_home),
      })
      setEditing(null)
      load()
    } catch (err) {
      const fieldError = err?.errors && Object.values(err.errors).flat().find(Boolean)
      setEditError(fieldError || err.message || 'The review could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl">Reviews</h1>
      <p className="mt-1 text-sm text-muted">Only approved reviews are shown on product pages and, if enabled, on the home page.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value || 'all'}
            type="button"
            className={`px-3 py-1.5 text-xs tracking-wide uppercase ${status === value ? 'bg-gold text-white' : 'border border-black/10 bg-card'}`}
            onClick={() => setStatus(value)}
          >
            {value || 'All'}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      <div className="mt-6 space-y-3">
        {!(data?.data || []).length && <p className="border border-black/5 bg-card px-4 py-8 text-center text-sm text-muted">No reviews in this list.</p>}
        {(data?.data || []).map((review) => (
          <article key={review.id} className="border border-black/5 bg-card p-4 sm:p-5">
            {editing?.id === review.id ? (
              <form onSubmit={saveEdit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Display name</span>
                    <input className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" value={edit.customer_name} onChange={(e) => setEdit({ ...edit, customer_name: e.target.value })} />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Rating</span>
                    <select className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" value={edit.rating} onChange={(e) => setEdit({ ...edit, rating: Number(e.target.value) })}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>{value} / 5</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Review</span>
                  <textarea className="min-h-24 w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" value={edit.comment} onChange={(e) => setEdit({ ...edit, comment: e.target.value })} />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={edit.show_on_home} onChange={(e) => setEdit({ ...edit, show_on_home: e.target.checked })} />
                  Show on home
                </label>
                {editError && <p className="text-sm text-sale">{editError}</p>}
                <div className="flex flex-wrap gap-3 text-xs">
                  <button type="submit" className="btn-primary px-4 py-2 text-xs" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                  <button type="button" className="underline underline-offset-2" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{review.product?.name || 'Product removed'}</p>
                    <p className="text-xs text-muted">{review.customer_name} · {review.rating}/5 · {formatDateTime(review.created_at)}</p>
                    {review.order_number && <Link to={`/admin/orders/${review.order_number}`} className="text-xs underline decoration-gold underline-offset-2 hover:text-gold">{review.order_number}</Link>}
                    {review.show_on_home ? <p className="mt-1 text-xs text-muted">Shown on home</p> : <p className="mt-1 text-xs text-muted">Hidden from home</p>}
                  </div>
                  <StatusBadge value={review.status} />
                </div>
                {review.comment && <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>}
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <button type="button" className="underline decoration-gold underline-offset-2 hover:text-gold" onClick={() => startEdit(review)}>Edit</button>
                  {review.status !== 'approved' && <button type="button" className="underline decoration-gold underline-offset-2 hover:text-gold" onClick={() => act(() => approveAdminReview(review.id))}>Approve</button>}
                  {review.status !== 'rejected' && <button type="button" className="underline decoration-gold underline-offset-2 hover:text-gold" onClick={() => act(() => rejectAdminReview(review.id))}>Reject</button>}
                  <button type="button" className="text-sale underline underline-offset-2" onClick={() => setPendingDelete(review)}>Delete</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this review?"
        body="This cannot be undone."
        confirmLabel="Delete review"
        danger
        busy={busy}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          setBusy(true)
          try {
            await deleteAdminReview(pendingDelete.id)
            setPendingDelete(null)
            load()
          } catch (err) {
            setError(err.message || 'The review could not be deleted.')
          } finally {
            setBusy(false)
          }
        }}
      />
    </div>
  )
}
