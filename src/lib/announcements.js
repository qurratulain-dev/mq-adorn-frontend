import { formatRs } from './format.js'
import { whatsappDisplay, whatsappLink } from './whatsapp.js'

export const DEFAULT_ANNOUNCEMENT_LINES = [
  {
    text: 'Free Shipping on Orders Above {free_shipping_threshold}',
    href: null,
    show_if_deal: false,
  },
  {
    text: 'Pay easily via JazzCash, Easypaisa or Bank Transfer',
    href: null,
    show_if_deal: false,
  },
  {
    text: '🔥 Deal of the Week is live — shop now',
    href: '/#deal-of-the-week',
    show_if_deal: true,
  },
  {
    text: 'Order on WhatsApp: {whatsapp_display}',
    href: 'whatsapp',
    show_if_deal: false,
  },
]

export function interpolateAnnouncement(text, { freeShippingThreshold, whatsappDisplay: display } = {}) {
  return String(text || '')
    .replaceAll('{free_shipping_threshold}', formatRs(freeShippingThreshold ?? 5000))
    .replaceAll('{whatsapp_display}', display || whatsappDisplay())
}

export function resolveAnnouncementHref(href) {
  if (!href) return null
  const value = String(href).trim()
  if (!value) return null
  if (value === 'whatsapp') return whatsappLink()
  return value
}

export function announcementTo(href) {
  const value = resolveAnnouncementHref(href)
  if (!value) return null
  if (value.includes('#') && (value.startsWith('/') || value.startsWith('#'))) {
    const hashIndex = value.indexOf('#')
    const pathname = value.slice(0, hashIndex) || '/'
    const hash = value.slice(hashIndex)
    return { pathname, hash }
  }
  return value
}
