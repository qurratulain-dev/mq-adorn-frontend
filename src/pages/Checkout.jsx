import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/client.js'
import CartItem from '../components/cart/CartItem.jsx'
import { ACCEPTED_PROOF_EXTENSIONS, ACCEPTED_PROOF_TYPES, MAX_PROOF_BYTES, paymentMethodById as fallbackPaymentMethod } from '../config/payment.js'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatRs } from '../lib/format.js'
import { isPakistaniPhone } from '../lib/phone.js'
import { PROVINCES } from '../lib/pakistan.js'
import { NO_RETURNS_CHECKBOX, NO_RETURNS_SHORT } from '../content/policies.js'
import { isMobileDevice, orderPlacedHref } from '../lib/whatsapp.js'

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Sialkot']

const EMPTY = {
  customer_name: '',
  customer_phone: '',
  customer_phone_alt: '',
  customer_email: '',
  address_street: '',
  address_area: '',
  address_landmark: '',
  city: '',
  province: '',
  shipping_address: '',
  notes: '',
  payment_method: '',
  payment_reference: '',
}

function lineError(errors, index) {
  const keys = [`items.${index}`, `items.${index}.slug`, `items.${index}.quantity`, `items.${index}.color`, `items.${index}.size`]
  for (const key of keys) {
    if (errors?.[key]) return Array.isArray(errors[key]) ? errors[key][0] : errors[key]
  }
  return ''
}

function firstError(errors) {
  if (!errors) return ''
  if (typeof errors === 'string') return errors
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function Checkout() {
  const settings = useStoreSettings()
  const navigate = useNavigate()
  const { items, subtotal, shippingFee, total, clearCart, hasBlockingIssue } = useCart()
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [proof, setProof] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [complete, setComplete] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!user) return
    const last = user.last_delivery || {}
    setForm((current) => {
      const fill = (key, ...sources) => current[key] || sources.find((value) => Boolean(value)) || ''
      return {
        ...current,
        customer_name: fill('customer_name', user.name, last.customer_name),
        customer_phone: fill('customer_phone', user.phone, last.customer_phone),
        customer_phone_alt: fill('customer_phone_alt', last.customer_phone_alt),
        customer_email: fill('customer_email', user.email, last.customer_email),
        address_street: fill('address_street', last.address_street),
        address_area: fill('address_area', last.address_area),
        address_landmark: fill('address_landmark', last.address_landmark),
        city: fill('city', last.city),
        province: fill('province', last.province),
        shipping_address: fill('shipping_address', last.shipping_address),
      }
    })
  }, [user])


  const method = (settings.paymentMethods || []).find((item) => item.id === form.payment_method) || fallbackPaymentMethod(form.payment_method)
  const remaining = settings.remainingForFreeShipping(subtotal)

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
    if (form.customer_phone_alt && !isPakistaniPhone(form.customer_phone_alt)) {
      next.customer_phone_alt = 'Please enter a valid Pakistani mobile number, for example 03XX XXXXXXX.'
    }
    if (form.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) {
      next.customer_email = 'Please enter a valid email address.'
    }
    if (!form.customer_phone_alt.trim() && !form.customer_email.trim()) {
      const contactMessage = 'Please enter an alternate phone number or an email address — at least one is required.'
      next.customer_phone_alt = contactMessage
      next.customer_email = contactMessage
    }
    if (!form.address_street.trim()) next.address_street = 'Please enter your house, street and mohalla.'
    if (!form.address_area.trim()) next.address_area = 'Please enter your area.'
    if (!form.city.trim()) next.city = 'Please enter your city.'
    if (!form.province.trim()) next.province = 'Please choose your province.'
    if (!form.shipping_address.trim()) next.shipping_address = 'Please enter your complete address.'
if (!form.payment_method) next.payment_method = 'Please choose a payment method.'
    if (!proof) next.proof = 'Please upload a screenshot of your payment (JPG, PNG or WebP, up to 5MB).'
    if (!agreed) next.final_sale = 'Please confirm that you understand all sales are final — no returns, refunds or exchanges.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (hasBlockingIssue) {
      setFormError('Please update or remove the unavailable items in your bag before placing the order.')
      return
    }
    if (!validate()) return

    // Open the tab now, while we still have the user click. After the API
    // call, popup blockers will refuse window.open.
    const mobile = isMobileDevice()
    let waWindow = null
    if (!mobile) {
      waWindow = window.open('about:blank', 'mq-adorn-whatsapp')
    }

    setSubmitting(true)
    try {
      const data = new FormData()
      data.set('customer_name', form.customer_name.trim())
      data.set('customer_phone', form.customer_phone.trim())
      if (form.customer_phone_alt.trim()) data.set('customer_phone_alt', form.customer_phone_alt.trim())
      if (form.customer_email.trim()) data.set('customer_email', form.customer_email.trim())
      data.set('address_street', form.address_street.trim())
      data.set('address_area', form.address_area.trim())
      if (form.address_landmark.trim()) data.set('address_landmark', form.address_landmark.trim())
      data.set('city', form.city.trim())
      data.set('province', form.province.trim())
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
      const href = orderPlacedHref(number)
      if (mobile || !waWindow || waWindow.closed) {
        if (waWindow && !waWindow.closed) waWindow.close()
        navigate(`/order-success/${number}`, { replace: true, state: { openWhatsApp: true } })
      } else {
        waWindow.location = href
        navigate(`/order-success/${number}`, { replace: true })
      }
    } catch (error) {
      if (waWindow && !waWindow.closed) waWindow.close()
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
          <p className="text-xs tracking-[0.22em] text-muted uppercase">{user ? 'Checkout' : 'Guest checkout'}</p>
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
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Alternate phone</span>
                <input className={fieldClass('customer_phone_alt')} value={form.customer_phone_alt} autoComplete="tel" placeholder="03XX XXXXXXX" onChange={(e) => setField('customer_phone_alt', e.target.value)} />
                {fieldError('customer_phone_alt')}
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Email</span>
                <input type="email" className={fieldClass('customer_email')} value={form.customer_email} autoComplete="email" onChange={(e) => setField('customer_email', e.target.value)} />
                <span className="mt-1 block text-xs text-muted">Enter an alternate phone number or an email — at least one is required.</span>
                {fieldError('customer_email')}
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">House / street &amp; mohalla</span>
                <input className={fieldClass('address_street')} value={form.address_street} autoComplete="address-line1" placeholder="House no., street, gali / mohalla" onChange={(e) => setField('address_street', e.target.value)} />
                {fieldError('address_street')}
              </label>
              <label>
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Area</span>
                <input className={fieldClass('address_area')} value={form.address_area} autoComplete="address-line2" onChange={(e) => setField('address_area', e.target.value)} />
                {fieldError('address_area')}
              </label>
              <label>
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Nearby landmark</span>
                <input className={fieldClass('address_landmark')} value={form.address_landmark} placeholder="Near…" onChange={(e) => setField('address_landmark', e.target.value)} />
                {fieldError('address_landmark')}
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
              <label>
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Province</span>
                <select className={fieldClass('province')} value={form.province} autoComplete="address-level1" onChange={(e) => setField('province', e.target.value)}>
                  <option value="">Select province</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                {fieldError('province')}
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Complete address</span>
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
              {(settings.paymentMethods || []).map((item) => {
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
            {items.map((item, index) => (
              <div key={`${item.slug}-${item.color}-${item.size}`}>
                <CartItem item={item} compact />
                {lineError(errors, index) && <p className="pb-3 text-xs text-sale">{lineError(errors, index)}</p>}
              </div>
            ))}
          </div>
          {remaining > 0 ? (
            <p className="mt-4 text-xs text-muted">Add {formatRs(remaining)} more for free shipping (above {formatRs(settings.freeShippingThreshold)}).</p>
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
              Paying with {method.label}. Transfer the order total, then upload a screenshot of the payment.
            </p>
          )}
          <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              className="mt-1 accent-[#D4AF37]"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked)
                setErrors((current) => {
                  if (!current.final_sale) return current
                  const next = { ...current }
                  delete next.final_sale
                  return next
                })
              }}
            />
            <span>
              {NO_RETURNS_CHECKBOX}{' '}
              <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">
                Return Policy
              </Link>
            </span>
          </label>
          {errors.final_sale && <p className="mt-2 text-xs text-sale">{errors.final_sale}</p>}
          <p className="mt-3 text-[11px] text-muted">{NO_RETURNS_SHORT}</p>
          {hasBlockingIssue && (
            <p className="mt-4 text-sm text-sale">Please update or remove the unavailable items in your bag before placing the order.</p>
          )}
          <button type="submit" className="btn-primary mt-4 w-full" disabled={submitting || hasBlockingIssue}>
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
