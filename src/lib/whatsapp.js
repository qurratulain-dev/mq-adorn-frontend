// Single source of truth for the MQ Adorn store WhatsApp (Qurat, 20 Nov 2026).
export const WHATSAPP_DISPLAY = '+92 329 5349850'
export const WHATSAPP_NUMBER = '923295349850'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

export function whatsappNumber() {
  return WHATSAPP_NUMBER
}

export function whatsappHref(details = {}) {
  const { name, url } = details
  if (!name && !url) return WHATSAPP_LINK
  const lines = ['Hello MQ Adorn,']
  if (name) lines.push(`I would like to know more about "${name}".`)
  if (url) lines.push(url)
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(lines.join('\n'))}`
}
