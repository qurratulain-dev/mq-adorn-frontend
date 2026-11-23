import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createAdminDeal, getAdminDeal, getAdminProducts, updateAdminDeal } from '../../api/client.js'
import { fromDatetimeLocal, toDatetimeLocal } from '../../lib/datetime.js'
import { formatRs } from '../../lib/format.js'

const emptyItem = () => ({ product_id: '', mode: 'price', deal_price: '', percent_off: '' })

const emptyForm = {
  title: 'Deal of the Week',
  starts_at: '',
  ends_at: '',
  is_active: true,
  items: [emptyItem()],
}

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function AdminDealEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    getAdminProducts({ per_page: 50 })
      .then((payload) => setProducts(payload?.data || []))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    if (isNew) return undefined
    let cancelled = false
    setLoading(true)
    getAdminDeal(id)
      .then((payload) => {
        if (cancelled) return
        const deal = payload?.data
        if (!deal) {
          setError('This deal could not be found.')
          return
        }
        setForm({
          title: deal.title || 'Deal of the Week',
          starts_at: toDatetimeLocal(deal.starts_at),
          ends_at: toDatetimeLocal(deal.ends_at),
          is_active: Boolean(deal.is_active),
          items: (deal.items || []).map((item) => ({
            product_id: String(item.product_id),
            mode: item.percent_off != null && item.percent_off !== '' ? 'percent' : 'price',
            deal_price: item.deal_price ?? '',
            percent_off: item.percent_off ?? '',
          })),
        })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'This deal could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, isNew])

  const field = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const setItem = (index, key, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    const body = {
      title: form.title,
      starts_at: fromDatetimeLocal(form.starts_at),
      ends_at: fromDatetimeLocal(form.ends_at),
      is_active: form.is_active,
      items: form.items.map((item) => ({
        product_id: Number(item.product_id),
        deal_price: item.mode === 'price' && item.deal_price !== '' ? Number(item.deal_price) : null,
        percent_off: item.mode === 'percent' && item.percent_off !== '' ? Number(item.percent_off) : null,
      })),
    }
    try {
      if (isNew) await createAdminDeal(body)
      else await updateAdminDeal(id, body)
      navigate('/admin/deals')
    } catch (err) {
      setError(firstError(err.errors) || err.message || 'The deal could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading deal…</p>
  }

  return (
    <div>
      <p className="text-sm text-muted">
        <Link to="/admin/deals" className="hover:text-gold">Deals</Link>
        <span className="mx-2">/</span>
        {isNew ? 'New deal' : 'Edit deal'}
      </p>
      <h1 className="mt-2 font-heading text-3xl">{isNew ? 'New deal' : 'Edit deal'}</h1>
      <p className="mt-1 text-sm text-muted">Deal prices apply on the product page, in the bag, and at checkout while the deal is active.</p>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}

      <form className="mt-6 max-w-3xl space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs tracking-wide text-muted uppercase">Title</span>
            <input className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.title} onChange={(e) => field('title', e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs tracking-wide text-muted uppercase">Starts (Pakistan time)</span>
            <input type="datetime-local" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.starts_at} onChange={(e) => field('starts_at', e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs tracking-wide text-muted uppercase">Ends (Pakistan time)</span>
            <input type="datetime-local" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.ends_at} onChange={(e) => field('ends_at', e.target.value)} required />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => field('is_active', e.target.checked)} />
            Active
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl">Products</h2>
            <button
              type="button"
              className="text-xs underline underline-offset-2"
              onClick={() => setForm((current) => ({ ...current, items: [...current.items, emptyItem()] }))}
            >
              Add product
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {form.items.map((item, index) => {
              const chosen = products.find((product) => String(product.id) === String(item.product_id))
              return (
                <div key={index} className="border border-black/5 bg-card p-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] sm:items-end">
                    <label className="block">
                      <span className="mb-1 block text-xs tracking-wide text-muted uppercase">Product</span>
                      <select className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={item.product_id} onChange={(e) => setItem(index, 'product_id', e.target.value)} required>
                        <option value="">Choose a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs tracking-wide text-muted uppercase">Pricing</span>
                      <select className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={item.mode} onChange={(e) => setItem(index, 'mode', e.target.value)}>
                        <option value="price">Deal price</option>
                        <option value="percent">Percent off</option>
                      </select>
                    </label>
                    {item.mode === 'price' ? (
                      <label className="block">
                        <span className="mb-1 block text-xs tracking-wide text-muted uppercase">Deal price (Rs.)</span>
                        <input type="number" min="1" step="1" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={item.deal_price} onChange={(e) => setItem(index, 'deal_price', e.target.value)} required />
                      </label>
                    ) : (
                      <label className="block">
                        <span className="mb-1 block text-xs tracking-wide text-muted uppercase">Percent off</span>
                        <input type="number" min="1" max="90" step="1" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={item.percent_off} onChange={(e) => setItem(index, 'percent_off', e.target.value)} required />
                      </label>
                    )}
                    {form.items.length > 1 && (
                      <button type="button" className="text-xs text-sale underline underline-offset-2 sm:mb-3" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }))}>
                        Remove
                      </button>
                    )}
                  </div>
                  {chosen && (
                    <p className="mt-2 text-xs text-muted">Regular price {formatRs(chosen.price)}{chosen.sale_price ? ` · sale ${formatRs(chosen.sale_price)}` : ''}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary px-5 py-2.5 text-xs" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create deal' : 'Save deal'}
          </button>
          <Link to="/admin/deals" className="btn-outline px-5 py-2.5 text-xs">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
