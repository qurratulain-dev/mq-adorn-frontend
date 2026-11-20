import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { approveAdminReview, deleteAdminReview, getAdminReviews, rejectAdminReview } from '../../api/client.js'
import { formatDateTime } from '../../lib/datetime.js'
import StatusBadge from '../components/StatusBadge.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const FILTERS = ['pending', 'approved', 'rejected', '']

export default function AdminReviews() {
  const [status, setStatus] = useState('pending')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

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

  return (
    <div>
      <h1 className="font-heading text-3xl">Reviews</h1>
      <p className="mt-1 text-sm text-muted">Only approved reviews are shown on product pages.</p>
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{review.product?.name || 'Product removed'}</p>
                <p className="text-xs text-muted">{review.customer_name} · {review.rating}/5 · {formatDateTime(review.created_at)}</p>
                {review.order_number && <Link to={`/admin/orders/${review.order_number}`} className="text-xs underline decoration-gold underline-offset-2 hover:text-gold">{review.order_number}</Link>}
              </div>
              <StatusBadge value={review.status} />
            </div>
            {review.comment && <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {review.status !== 'approved' && <button type="button" className="underline decoration-gold underline-offset-2 hover:text-gold" onClick={() => act(() => approveAdminReview(review.id))}>Approve</button>}
              {review.status !== 'rejected' && <button type="button" className="underline decoration-gold underline-offset-2 hover:text-gold" onClick={() => act(() => rejectAdminReview(review.id))}>Reject</button>}
              <button type="button" className="text-sale underline underline-offset-2" onClick={() => setPendingDelete(review)}>Delete</button>
            </div>
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
