// Single source of truth for the MQ Adorn store WhatsApp (Qurat, 20 Nov 2026).
export const WHATSAPP_DISPLAY = '+92 329 5349850'
export const WHATSAPP_NUMBER = '923295349850'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

let runtimeNumber = WHATSAPP_NUMBER
let runtimeDisplay = WHATSAPP_DISPLAY

export function applyWhatsAppSettings({ number, display } = {}) {
  if (number) runtimeNumber = String(number).replace(/\D+/g, '')
  if (display) runtimeDisplay = display
}

export function whatsappNumber() {
  return runtimeNumber || WHATSAPP_NUMBER
}

export function whatsappDisplay() {
  return runtimeDisplay || WHATSAPP_DISPLAY
}

export function whatsappLink() {
  return `https://wa.me/${whatsappNumber()}`
}

export function whatsappHref(details = {}) {
  const base = whatsappLink()
  if (details.message) {
    return `${base}?text=${encodeURIComponent(details.message)}`
  }
  const { name, url } = details
  if (!name && !url) return base
  const lines = ['Hello MQ Adorn,']
  if (name) lines.push(`I would like to know more about "${name}".`)
  if (url) lines.push(url)
  return `${base}?text=${encodeURIComponent(lines.join('\n'))}`
}

export const ORDER_PLACED_MESSAGE = (orderNumber) =>
  `Hello MQ Adorn, I have placed order ${orderNumber}. My payment is pending verification.`

export function orderPlacedMessage(orderNumber) {
  return ORDER_PLACED_MESSAGE(orderNumber)
}

export function orderPlacedHref(orderNumber) {
  return whatsappHref({ message: orderPlacedMessage(orderNumber) })
}

export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
