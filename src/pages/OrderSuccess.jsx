import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getOrder } from '../api/client.js'
import { WhatsAppIcon } from '../components/Icons.jsx'
import { formatRs } from '../lib/format.js'
import { WHATSAPP_DISPLAY, orderPlacedHref } from '../lib/whatsapp.js'

export default function OrderSuccess() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    getOrder(orderNumber, { signal: controller.signal })
      .then((payload) => {
        setOrder(payload.data)
        setStatus('ready')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus(error.status === 404 ? 'notfound' : 'error')
      })
    return () => controller.abort()
  }, [orderNumber])

  const location = useLocation()
  const whatsappUrl = orderPlacedHref(orderNumber)

  useEffect(() => {
    document.title = `Order ${orderNumber} | MQ Adorn`
    return () => {
      document.title = 'MQ Adorn — Jewellery & Dresses'
    }
  }, [orderNumber])

  useEffect(() => {
    if (!location.state?.openWhatsApp || !orderNumber) return undefined
    const timer = window.setTimeout(() => {
      window.location.assign(orderPlacedHref(orderNumber))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [location.state, orderNumber])

  const label = order?.status_label || 'Payment verification pending'

  if (status === 'notfound') {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="font-heading text-3xl">Order not found</h1>
        <p className="mt-3 text-sm text-muted">Please check the order number and try again.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to home
        </Link>
      </section>
    )
  }

  return (
    <div className="bg-cream">
      <div className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-xl border border-gold/30 bg-card px-6 py-12 text-center sm:px-10">
          <p className="text-xs font-medium tracking-[0.28em] text-gold uppercase">Thank you</p>
          <h1 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">Order received</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            We have your order and will check the payment screenshot shortly. You will hear from us once it is verified.
          </p>
          <p className="mt-6 text-[11px] tracking-[0.2em] text-muted uppercase">Order number</p>
          <p className="mt-1 font-heading text-2xl">{orderNumber}</p>
          <p className="mt-3 inline-flex bg-blush px-3 py-1 text-sm">{status === 'loading' ? 'Loading status…' : label}</p>
          {order && (
            <p className="mt-4 text-sm text-muted">
              Total {formatRs(order.total)}
              {Number(order.shipping_fee) === 0 ? ' · Free shipping' : ` · Shipping ${formatRs(order.shipping_fee)}`}
            </p>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 inline-flex"
          >
            <WhatsAppIcon width={18} height={18} /> Message us on WhatsApp
          </a>
          <p className="mt-3 text-xs text-muted">WhatsApp {WHATSAPP_DISPLAY}. The order number is already filled in for you.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-outline">
              Continue shopping
            </Link>
            <Link to="/" className="text-sm hover:text-gold">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
