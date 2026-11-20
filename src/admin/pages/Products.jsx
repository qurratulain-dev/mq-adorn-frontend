import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteAdminProduct, getAdminProducts, updateAdminProduct } from '../../api/client.js'
import { formatRs } from '../../lib/format.js'
import { mediaUrl } from '../../lib/media.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function AdminProducts() {
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => getAdminProducts({ q: applied, page }).then(setData).catch((err) => setError(err.message || 'Products could not be loaded.'))

  useEffect(() => { load() }, [applied, page])

  const toggleActive = async (product) => {
    try {
      await updateAdminProduct(product.id, {
        name: product.name,
        type: product.type,
        category_id: product.category_id,
        price: product.price,
        sale_price: product.sale_price,
        is_active: !product.is_active,
        is_featured: product.is_featured,
        is_best_seller: product.is_best_seller,
        is_new: product.is_new,
      })
      load()
    } catch (err) {
      setError(err.message || 'The product could not be updated.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted">Add, edit or hide listings.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary px-4 py-2 text-xs">Add product</Link>
      </div>
      <form className="mt-5 flex gap-3" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(q) }}>
        <input className="w-full max-w-sm border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn-primary px-4 py-2 text-xs">Search</button>
      </form>
      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      <div className="mt-6 overflow-x-auto border border-black/5 bg-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-black/5 bg-blush/40 text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {!(data?.data || []).length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No products found.</td></tr>
            )}
            {(data?.data || []).map((product) => (
              <tr key={product.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? <img src={mediaUrl(product.images[0])} alt="" className="h-12 w-12 object-cover" /> : <div className="h-12 w-12 bg-cream" />}
                    <div>
                      <Link to={`/admin/products/${product.id}`} className="hover:text-gold">{product.name}</Link>
                      <div className="text-[11px] text-muted uppercase">{product.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{product.category?.name || '—'}</td>
                <td className="px-4 py-3">{product.sale_price ? formatRs(product.sale_price) : formatRs(product.price)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-xs underline decoration-gold underline-offset-2" onClick={() => toggleActive(product)}>
                    {product.is_active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/admin/products/${product.id}`} className="text-xs underline decoration-gold underline-offset-2 hover:text-gold">Edit</Link>
                  <button type="button" className="ml-3 text-xs text-sale underline underline-offset-2" onClick={() => setPendingDelete(product)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && data.last_page > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button type="button" className="underline disabled:text-muted" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {data.current_page} of {data.last_page}</span>
          <button type="button" className="underline disabled:text-muted" disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this product?"
        body={pendingDelete ? `${pendingDelete.name} will be removed from the shop.` : ''}
        confirmLabel="Delete product"
        danger
        busy={busy}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          setBusy(true)
          try {
            await deleteAdminProduct(pendingDelete.id)
            setPendingDelete(null)
            load()
          } catch (err) {
            setError(err.message || 'The product could not be deleted.')
          } finally {
            setBusy(false)
          }
        }}
      />
    </div>
  )
}
