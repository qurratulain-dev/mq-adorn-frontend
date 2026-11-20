import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { SOCIAL_LINKS } from '../components/navLinks.js'
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp.js'

const ICONS = { tiktok: TikTokIcon, instagram: InstagramIcon }

export default function Contact() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const openWhatsApp = (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text) {
      setError('Please write a short message before opening WhatsApp.')
      return
    }
    const lines = ['Hello MQ Adorn,']
    if (name.trim()) lines.push(`My name is ${name.trim()}.`)
    lines.push('', text)
    window.open(whatsappHref({ message: lines.join('\n') }), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-cream">
      <PageHero eyebrow="Customer care" title="Contact">
        The quickest way to reach us is WhatsApp. You can also find us on Instagram and TikTok.
      </PageHero>
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-6">
          <div className="border border-black/5 bg-card p-5 sm:p-6">
            <h2 className="font-heading text-xl">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted">Message us about a product, an order, or anything that is unclear before you buy.</p>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 inline-flex"
            >
              <WhatsAppIcon width={18} height={18} /> WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </div>
          <div className="border border-black/5 bg-card p-5 sm:p-6">
            <h2 className="font-heading text-xl">Social</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => {
                const Svg = ICONS[Icon]
                return (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold">
                      <Svg width={16} height={16} /> {label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
          <p className="text-xs text-muted">
            All sales are final. Please read the{' '}
            <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">
              Return Policy
            </Link>{' '}
            before you order.
          </p>
        </div>

        <form className="border border-black/5 bg-card p-5 sm:p-6" onSubmit={openWhatsApp} noValidate>
          <h2 className="font-heading text-xl">Send a message</h2>
          <p className="mt-2 text-sm text-muted">
            This form opens WhatsApp with your words already filled in. Nothing is sent by email.
          </p>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Your name (optional)</span>
            <input
              className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Message</span>
            <textarea
              className="min-h-32 w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (error) setError('')
              }}
            />
          </label>
          {error && <p className="mt-2 text-xs text-sale">{error}</p>}
          <button type="submit" className="btn-primary mt-5 w-full">
            <WhatsAppIcon width={18} height={18} /> Open in WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}
