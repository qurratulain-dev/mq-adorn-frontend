import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Accordion from '../components/Accordion.jsx'
import PageHero from '../components/PageHero.jsx'
import { DELIVERY_COPY, NO_RETURNS_ADVICE, NO_RETURNS_INTRO, NO_RETURNS_POINTS, shippingChargesCopy } from '../content/policies.js'
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from '../lib/whatsapp.js'

export default function Faqs() {
  const location = useLocation()
  const hash = location.hash.replace('#', '')

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const items = useMemo(
    () => [
      {
        id: 'order',
        title: 'How do I place an order?',
        body: (
          <p>
            Browse the shop, add items to your bag, and go to checkout. You can pay by JazzCash, Easypaisa or bank
            transfer and upload a screenshot of the payment. After we confirm the payment, we will get in touch about
            delivery.
          </p>
        ),
      },
      {
        id: 'guest',
        title: 'Do I need an account?',
        body: (
          <p>
            No. Guest checkout is available — you only need your name, mobile number, city and full address. Creating an
            account is optional and lets you see your orders under{' '}
            <Link to="/account" className="underline decoration-gold underline-offset-2 hover:text-gold">
              My Orders
            </Link>
            .
          </p>
        ),
      },
      {
        id: 'payment',
        title: 'Which payment methods do you accept?',
        body: (
          <p>
            We only accept JazzCash, Easypaisa or bank transfer. You must upload a screenshot of the payment when you
            place the order. We do not offer Cash on Delivery, and we do not take card payments on the website.
          </p>
        ),
      },
      {
        id: 'verification',
        title: 'What happens after I pay?',
        body: (
          <p>
            Your order is first marked “Payment verification pending” while we check the screenshot. Once the payment is
            verified, we will confirm the order and share the next steps on WhatsApp.
          </p>
        ),
      },
      {
        id: 'shipping',
        title: 'Do you deliver across Pakistan, and what does shipping cost?',
        body: (
          <div className="space-y-3">
            <p>{DELIVERY_COPY}</p>
            <p>{shippingChargesCopy()}</p>
          </div>
        ),
      },
      {
        id: 'returns',
        title: 'Can I return, refund or exchange an order?',
        body: (
          <div className="space-y-3">
            <p>{NO_RETURNS_INTRO}</p>
            <ul className="list-disc space-y-1 pl-5">
              {NO_RETURNS_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p>{NO_RETURNS_ADVICE}</p>
            <p>
              Read the full{' '}
              <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">
                Return Policy
              </Link>
              .
            </p>
          </div>
        ),
      },
      {
        id: 'tracking',
        title: 'How can I track my order?',
        body: (
          <p>
            If you have an account, open{' '}
            <Link to="/account" className="underline decoration-gold underline-offset-2 hover:text-gold">
              My Orders
            </Link>{' '}
            to see the status. You can also message us on{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>{' '}
            with your order number. Guest checkout does not have a separate tracking page.
          </p>
        ),
      },
      {
        id: 'password',
        title: 'I have an account or I forgot my password.',
        body: (
          <p>
            You can create an account or log in from the header. Password reset by email is not set up yet. If you need
            help with your account, please message us on{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            .
          </p>
        ),
      },
    ],
    [],
  )

  return (
    <div className="bg-cream">
      <PageHero eyebrow="Customer care" title="FAQs">
        Short answers about ordering, payment, delivery and our no-returns policy.
      </PageHero>
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <Accordion items={items} initialId={items.some((item) => item.id === hash) ? hash : undefined} />
        </div>
      </div>
    </div>
  )
}
