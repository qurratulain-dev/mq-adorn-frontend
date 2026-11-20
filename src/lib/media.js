import { API_URL } from '../api/client.js'

export function mediaUrl(src) {
  if (!src) return ''
  if (typeof src === 'object') {
    src = src.url || (src.id ? `/api/media/${src.id}` : '')
  }
  if (!src) return ''
  if (/^(https?:|data:|blob:)/i.test(src)) return src
  if (src.startsWith('/api/')) return `${API_URL}${src.slice(4)}`
  return src
}
