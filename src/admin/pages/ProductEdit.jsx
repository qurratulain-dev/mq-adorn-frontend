import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createAdminProduct, deleteAdminProductImage, getAdminCategories, getAdminProduct, updateAdminProduct, uploadAdminProductImages } from '../../api/client.js'
import { mediaUrl } from '../../lib/media.js'
import { OCCASIONS } from '../../lib/occasions.js'

const emptyVariant = () => ({ color: '', size: '', stock: 0, sku: '', price: '' })

const emptyForm = {
  name: '',
  type: 'jewellery',
  category_id: '',
  description: '',
  materials: '',
  price: '',
  sale_price: '',
  is_featured: false,
  is_best_seller: false,
  is_new: false,
  is_active: true,
  variants: [emptyVariant()],
  images: [],
  occasions: [],
}

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function AdminProductEdit() {
  const { id } = useParams()
  const isNew = id === 'new' || !id
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [productId, setProductId] = useState(isNew ? null : id)

  useEffect(() => {
    getAdminCategories().then((payload) => setCategories(payload.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    getAdminProduct(id)
      .then((payload) => {
        const product = payload.data
        setProductId(product.id)
        setForm({
          name: product.name || '',
          type: product.type || 'jewellery',
          category_id: product.category_id || '',
          description: product.description || '',
          materials: product.materials || '',
          price: product.price ?? '',
          sale_price: product.sale_price ?? '',
          is_featured: Boolean(product.is_featured),
          is_best_seller: Boolean(product.is_best_seller),
          is_new: Boolean(product.is_new),
          is_active: product.is_active !== false,
          variants: (product.variants || []).length ? product.variants.map((v) => ({ id: v.id, color: v.color || '', size: v.size || '', stock: v.stock ?? 0, sku: v.sku || '', price: v.price ?? '' })) : [emptyVariant()],
          images: product.images || [],
          occasions: (product.occasions || []).map((item) => item.slug || item),
        })
      })
      .catch((err) => setError(err.message || 'This product could not be loaded.'))
  }, [id, isNew])

  const field = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const payload = () => ({
    name: form.name.trim(),
    type: form.type,
    category_id: form.category_id || null,
    description: form.description,
    materials: form.materials,
    price: form.price === '' ? 0 : Number(form.price),
    sale_price: form.sale_price === '' ? null : Number(form.sale_price),
    is_featured: form.is_featured,
    is_best_seller: form.is_best_seller,
    is_new: form.is_new,
    is_active: form.is_active,
    variants: form.variants
      .filter((row) => row.color || row.size || Number(row.stock) > 0 || row.sku)
      .map((row) => ({
        id: row.id,
        color: row.color || null,
        size: row.size || null,
        sku: row.sku || null,
        price: row.price === '' ? null : Number(row.price),
        stock: Number(row.stock) || 0,
      })),
    images: form.images,
    occasions: form.occasions,
  })

  const save = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim() || form.price === '') {
      setError('Please enter a name and price.')
      return
    }
    setSaving(true)
    try {
      const body = payload()
      if (productId) {
        const result = await updateAdminProduct(productId, body)
        setForm((current) => ({ ...current, images: result.data.images || current.images, variants: result.data.variants?.map((v) => ({ id: v.id, color: v.color || '', size: v.size || '', stock: v.stock ?? 0, sku: v.sku || '', price: v.price ?? '' })) || current.variants }))
      } else {
        const result = await createAdminProduct(body)
        setProductId(result.data.id)
        navigate(`/admin/products/${result.data.id}`, { replace: true })
      }
    } catch (err) {
      setError(firstError(err.errors) || err.message || 'The product could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const onUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (!productId) {
      setError('Please save the product first, then add photos.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const result = await uploadAdminProductImages(productId, files)
      setForm((current) => ({ ...current, images: result.data.images || current.images }))
    } catch (err) {
      setError(firstError(err.errors) || err.message || 'The photos could not be uploaded.')
    } finally {
      setUploading(false)
    }
  }

  const moveImage = (index, direction) => {
    setForm((current) => {
      const images = [...current.images]
      const next = index + direction
      if (next < 0 || next >= images.length) return current
      const tmp = images[index]
      images[index] = images[next]
      images[next] = tmp
      return { ...current, images }
    })
  }

  const removeImage = async (url) => {
    if (productId) {
      try {
        const result = await deleteAdminProductImage(productId, url)
        setForm((current) => ({ ...current, images: result.data.images || current.images.filter((item) => item !== url) }))
        return
      } catch (err) {
        setError(err.message || 'The photo could not be removed.')
        return
      }
    }
    setForm((current) => ({ ...current, images: current.images.filter((item) => item !== url) }))
  }

  const setVariant = (index, key, value) => {
    setForm((current) => {
      const variants = current.variants.map((row, i) => (i === index ? { ...row, [key]: value } : row))
      return { ...current, variants }
    })
  }

  const typeCategories = categories.filter((item) => item.type === form.type)

  return (
    <form onSubmit={save} className="max-w-4xl">
      <Link to="/admin/products" className="text-sm underline decoration-gold underline-offset-2 hover:text-gold">Back to products</Link>
      <h1 className="mt-3 font-heading text-3xl">{isNew && !productId ? 'Add product' : 'Edit product'}</h1>
      {error && <p className="mt-4 text-sm text-sale">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Name</span>
          <input className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.name} onChange={(e) => field('name', e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Type</span>
          <select className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.type} onChange={(e) => field('type', e.target.value)}>
            <option value="jewellery">Jewellery</option>
            <option value="dress">Dresses</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Category</span>
          <select className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.category_id} onChange={(e) => field('category_id', e.target.value)}>
            <option value="">Select a category</option>
            {typeCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Price (PKR)</span>
          <input type="number" min="0" step="1" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.price} onChange={(e) => field('price', e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Sale price (optional)</span>
          <input type="number" min="0" step="1" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.sale_price} onChange={(e) => field('sale_price', e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Description</span>
          <textarea rows={4} className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.description} onChange={(e) => field('description', e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Materials / fabric</span>
          <textarea rows={3} className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.materials} onChange={(e) => field('materials', e.target.value)} />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        {[
          ['is_featured', 'Featured'],
          ['is_best_seller', 'Best Seller'],
          ['is_new', 'New'],
          ['is_active', 'Active'],
        ].map(([key, label]) => (
          <label key={key} className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form[key]} onChange={(e) => field(key, e.target.checked)} data-testid={key === 'is_best_seller' ? 'best-seller-toggle' : undefined} />
            {label}
          </label>
        ))}
      </div>

      <fieldset className="mt-6">
        <legend className="mb-2 text-xs tracking-wide text-muted uppercase">Occasions</legend>
        <p className="mb-3 text-xs text-muted">Tag this product so it appears on Shop by Occasion pages.</p>
        <div className="flex flex-wrap gap-4 text-sm">
          {OCCASIONS.map((item) => {
            const checked = form.occasions.includes(item.slug)
            return (
              <label key={item.slug} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...form.occasions, item.slug]
                      : form.occasions.filter((slug) => slug !== item.slug)
                    field('occasions', next)
                  }}
                />
                {item.name}
              </label>
            )
          })}
        </div>
      </fieldset>

      <section className="mt-8">
        <h2 className="font-heading text-xl">Photos</h2>
        <p className="mt-1 text-xs text-muted">The first photo is the primary image. Use the arrows to reorder. Save the product before uploading new photos.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {form.images.map((url, index) => (
            <div key={`${url}-${index}`} className="border border-black/10 bg-card p-2">
              <img src={mediaUrl(url)} alt="Product image" className="aspect-square w-full object-cover" />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span>{index === 0 ? 'Primary' : `Photo ${index + 1}`}</span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Move earlier">↑</button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === form.images.length - 1} aria-label="Move later">↓</button>
                  <button type="button" className="text-sale" onClick={() => removeImage(url)}>Remove</button>
                </span>
              </div>
            </div>
          ))}
        </div>
        <label className="btn-outline mt-4 inline-flex cursor-pointer px-4 py-2 text-xs">
          {uploading ? 'Uploading…' : 'Upload photos'}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl">Variants</h2>
          <button type="button" className="text-sm underline decoration-gold underline-offset-2 hover:text-gold" onClick={() => setForm((current) => ({ ...current, variants: [...current.variants, emptyVariant()] }))}>Add variant</button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="py-2 pr-2">Colour</th>
                <th className="py-2 pr-2">Size</th>
                <th className="py-2 pr-2">Stock</th>
                <th className="py-2 pr-2">SKU</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.variants.map((row, index) => (
                <tr key={row.id || index}>
                  <td className="py-1 pr-2"><input className="w-full border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-gold" value={row.color} onChange={(e) => setVariant(index, 'color', e.target.value)} /></td>
                  <td className="py-1 pr-2"><input className="w-full border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-gold" value={row.size} onChange={(e) => setVariant(index, 'size', e.target.value)} /></td>
                  <td className="py-1 pr-2"><input type="number" min="0" className="w-24 border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-gold" value={row.stock} onChange={(e) => setVariant(index, 'stock', e.target.value)} /></td>
                  <td className="py-1 pr-2"><input className="w-full border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-gold" value={row.sku} onChange={(e) => setVariant(index, 'sku', e.target.value)} /></td>
                  <td className="py-1"><button type="button" className="text-xs text-sale" onClick={() => setForm((current) => ({ ...current, variants: current.variants.filter((_, i) => i !== index) }))}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button type="submit" className="btn-primary mt-8 px-6 py-2.5 text-xs" disabled={saving}>
        {saving ? 'Saving…' : 'Save product'}
      </button>
    </form>
  )
}
