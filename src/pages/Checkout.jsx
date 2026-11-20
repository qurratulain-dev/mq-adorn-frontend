import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/client.js'
import CartItem from '../components/cart/CartItem.jsx'
import { ACCEPTED_PROOF_EXTENSIONS, ACCEPTED_PROOF_TYPES, MAX_PROOF_BYTES, PAYMENT_METHODS, paymentMethodById } from '../config/payment.js'
import { FREE_SHIPPING_THRESHOLD, remainingForFreeShipping } from '../config/shipping.js'
import { useCart } from '../context/CartContext.jsx'
import { formatRs } from '../lib/format.js'
import { isPakistaniPhone } from '../lib/phone.js'

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Sialkot']

const EMPTY = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  city: '',
  shipping_address: '',
  notes: '',
  payment_method: '',
  payment_reference: '',
}

function firstError(errors) {
  if (!errors) return ''
  if (typeof errors === 'string') return errors
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, shippingFee, total, clearCart } = useCart()
  const [form, setForm] = useState(EMPTY)
  const [proof, setProof] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [complete, setComplete] = useState(false)

  const method = paymentMethodById(form.payment_method)
  const remaining = remainingForFreeShipping(subtotal)

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const onProof = (file) => {
    setFormError('')
    if (!file) {
      setProof(null)
      setPreview('')
      return
    }
    if (!ACCEPTED_PROOF_TYPES.includes(file.type)) {
      setErrors((current) => ({ ...current, proof: 'Please upload a JPG, PNG or WebP image of your payment screenshot.' }))
      return
    }
    if (file.size > MAX_PROOF_BYTES) {
      setErrors((current) => ({ ...current, proof: 'This image is too large. Please upload a file under 5MB.' }))
      return
    }
    setProof(file)
    setPreview(URL.createObjectURL(file))
    setErrors((current) => {
      const next = { ...current }
      delete next.proof
      return next
    })
  }

  const validate = () => {
    const next = {}
    if (!form.customer_name.trim()) next.customer_name = 'Please enter your full name.'
    if (!form.customer_phone.trim()) next.customer_phone = 'Please enter your mobile number.'
    else if (!isPakistaniPhone(form.customer_phone)) next.customer_phone = 'Please enter a valid Pakistani mobile number, for example 03XX XXXXXXX.'
    if (form.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) {
      next.customer_email = 'Please enter a valid email address, or leave this field empty.'
    }
    if (!form.city.trim()) next.city = 'Please enter your city.'
    if (!form.shipping_address.trim()) next.shipping_address = 'Please enter your full delivery address.'
    if (!form.payment_method) next.payment_method = 'Please choose a payment method.'
    if (!proof) next.proof = 'Please upload a screenshot of your payment (JPG, PNG or WebP, up to 5MB).'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const data = new FormData()
      data.set('customer_name', form.customer_name.trim())
      data.set('customer_phone', form.customer_phone.trim())
      if (form.customer_email.trim()) data.set('customer_email', form.customer_email.trim())
      data.set('city', form.city.trim())
      data.set('shipping_address', form.shipping_address.trim())
      if (form.notes.trim()) data.set('notes', form.notes.trim())
      data.set('payment_method', form.payment_method)
      if (form.payment_reference.trim()) data.set('payment_reference', form.payment_reference.trim())
      data.set(
        'items',
        JSON.stringify(
          items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity || 1,
            color: item.color || null,
            size: item.size || null,
          })),
        ),
      )
      data.set('proof', proof)

      const payload = await createOrder(data)
      const number = payload?.data?.order_number
      if (!number) {
        throw new Error('The order was created but no order number was returned. Please message us on WhatsApp.')
      }
      setComplete(true)
      clearCart()
      navigate(`/order-success/${number}`, { replace: true })
    } catch (error) {
      const apiErrors = error.errors || {}
      setErrors(apiErrors)
      setFormError(firstError(apiErrors) || error.message || 'We could not place your order. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = (key) =>
    `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold ${errors[key] ? 'border-sale' : 'border-black/15'}`

  const fieldError = (key) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-sale">{Array.isArray(errors[key]) ? errors[key][0] : errors[key]}</p>
    ) : null

  if (items.length === 0 && !complete && !submitting) {
    return <Navigate to="/cart" replace />
  }

  return (
    <div className="bg-cream">
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Guest checkout</p>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">Checkout</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            No account is needed. We only accept JazzCash, Easypaisa or bank transfer — we do not offer Cash on Delivery.
          </p>
        </div>
      </header>

      <form className="container-page grid gap-10 py-8 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start" onSubmit={submit} noValidate>
        <div className="space-y-8">
          <section>
            <h2 className="font-heading text-2xl">Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Full name</span>
                <input className={fieldClass('customer_name')} value={form.customer_name} autoComplete="name" onChange={(e) => setField('customer_name', e.target.value)} />
                {fieldError('customer_name')}
              </label>
              <label>
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Mobile number</span>
                <input className={fieldClass('customer_phone')} value={form.customer_phone} autoComplete="tel" placeholder="03XX XXXXXXX" onChange={(e) => setField('customer_phone', e.target.value)} />
                {fieldError('customer_phone')}
              </label>
              <label>
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Email (optional)</span>
                <input type="email" className={fieldClass('customer_email')} value={form.customer_email} autoComplete="email" onChange={(e) => setField('customer_email', e.target.value)} />
                {fieldError('customer_email')}
              </label>
              <label>
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">City</span>
                <input className={fieldClass('city')} value={form.city} autoComplete="address-level2" list="checkout-cities" onChange={(e) => setField('city', e.target.value)} />
                <datalist id="checkout-cities">
                  {CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                {fieldError('city')}
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Full address</span>
                <textarea className={`${fieldClass('shipping_address')} min-h-24`} value={form.shipping_address} autoComplete="street-address" onChange={(e) => setField('shipping_address', e.target.value)} />
                {fieldError('shipping_address')}
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Order notes (optional)</span>
                <textarea className={`${fieldClass('notes')} min-h-20`} value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
                {fieldError('notes')}
              </label>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl">Payment</h2>
            <p className="mt-2 text-sm text-muted">
              Account numbers below are placeholders until MQ Adorn adds the real details. Please do not send money to XXXX.
            </p>
            <fieldset className="mt-4 space-y-3">
              <legend className="sr-only">Payment method</legend>
              {PAYMENT_METHODS.map((item) => {
                const selected = form.payment_method === item.id
                return (
                  <label
                    key={item.id}
                    className={`block cursor-pointer border bg-card p-4 transition ${selected ? 'border-gold' : 'border-black/10 hover:border-gold/60'}`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value={item.id}
                        checked={selected}
                        onChange={() => setField('payment_method', item.id)}
                        className="accent-[#D4AF37]"
                      />
                      <span className="font-medium">{item.label}</span>
                    </span>
                    {selected && (
                      <div className="mt-3 border-t border-black/5 pt-3 text-sm text-muted">
                        <p>
                          <span className="text-primary">Account title:</span> {item.accountName}
                        </p>
                        {item.bankName && (
                          <p>
                            <span className="text-primary">Bank:</span> {item.bankName}
                          </p>
                        )}
                        <p>
                          <span className="text-primary">Account / number:</span> {item.accountNumber}
                        </p>
                        {item.iban && (
                          <p>
                            <span className="text-primary">IBAN:</span> {item.iban}
                          </p>
                        )}
                        <p className="mt-2">{item.instructions}</p>
                      </div>
                    )}
                  </label>
                )
              })}
            </fieldset>
            {fieldError('payment_method')}

            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Transaction ID (optional)</span>
              <input className={fieldClass('payment_reference')} value={form.payment_reference} onChange={(e) => setField('payment_reference', e.target.value)} />
            </label>

            <div className="mt-5">
              <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Payment screenshot</span>
              <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-black/20 bg-white px-4 py-8 text-center hover:border-gold">
                <input
                  type="file"
                  accept={ACCEPTED_PROOF_EXTENSIONS}
                  className="sr-only"
                  onChange={(event) => onProof(event.target.files?.[0])}
                />
                <span className="text-sm">Upload a JPG, PNG or WebP image, up to 5MB</span>
                <span className="mt-1 text-xs text-muted">This is required so we can verify your payment.</span>
              </label>
              {preview && (
                <div className="mt-3 flex items-start gap-4">
                  <img src={preview} alt="Payment screenshot preview" className="h-28 w-28 object-cover" />
                  <div>
                    <p className="text-sm">{proof?.name}</p>
                    <button type="button" className="mt-2 text-xs text-sale hover:underline" onClick={() => onProof(null)}>
                      Remove screenshot
                    </button>
                  </div>
                </div>
              )}
              {fieldError('proof')}
            </div>
          </section>
        </div>

        <aside className="border border-black/5 bg-card p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="font-heading text-xl">Your order</h2>
          <div className="mt-2 divide-y divide-black/5">
            {items.map((item) => (
              <CartItem key={`${item.slug}-${item.color}-${item.size}`} item={item} compact />
            ))}
          </div>
          {remaining > 0 ? (
            <p className="mt-4 text-xs text-muted">Add {formatRs(remaining)} more for free shipping (above {formatRs(FREE_SHIPPING_THRESHOLD)}).</p>
          ) : (
            <p className="mt-4 text-xs text-success">You have qualified for free shipping.</p>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatRs(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{shippingFee === 0 ? 'Free' : formatRs(shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 font-medium">
              <dt>Total</dt>
              <dd>{formatRs(total)}</dd>
            </div>
          </dl>
          {formError && <p className="mt-4 text-sm text-sale">{formError}</p>}
          {method && (
            <p className="mt-3 text-xs text-muted">
              Paying with {method.label}. Account details are placeholders until the real numbers are added.
            </p>
          )}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
          <Link to="/cart" className="mt-3 block text-center text-sm hover:text-gold">
            Back to bag
          </Link>
        </aside>
      </form>
    </div>
  )
}
