// Thin fetch wrapper around the Laravel API.
// Accepts either https://host or https://host/api (Vercel env was first set without /api).
function resolveApiUrl() {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

export const API_URL = resolveApiUrl()

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const error = new Error(`API ${res.status}: ${res.statusText}`)
    error.status = res.status
    throw error
  }
  return res.json()
}

export const getHealth = () => apiFetch('/health')
export const getCategories = (type) => apiFetch(`/categories${type ? `?type=${type}` : ''}`)
export const getProducts = (params = {}, options = {}) => apiFetch(`/products?${new URLSearchParams(params)}`, options)
export const getProduct = (slug) => apiFetch(`/products/${slug}`)
