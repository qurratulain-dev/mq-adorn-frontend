export function whatsappNumber() {
  return String(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')
}

export function whatsappHref({ name, url }) {
  const message = `Hello MQ Adorn, I would like to know more about "${name}".\n${url}`
  const number = whatsappNumber()
  const text = encodeURIComponent(message)
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`
}
