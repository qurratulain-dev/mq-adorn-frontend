// Thin fetch wrapper around the Laravel API.
// Accepts either https://host or https://host/api (Vercel env was first set without /api).
function resolveApiUrl() {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

export const API_URL = resolveApiUrl()

export const AUTH_TOKEN_KEY = 'mq-adorn-token'

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function authHeaders() {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path, options = {}) {
  const { headers: optionHeaders, ...rest } = options
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeaders(), ...(optionHeaders || {}) },
    ...rest,
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
export const getProducts = (params = {}, options = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return
    search.set(key, String(value))
  })
  const query = search.toString()
  return apiFetch(`/products${query ? `?${query}` : ''}`, options)
}
export const getProduct = (slug, options = {}) => apiFetch(`/products/${slug}`, options)

export async function createOrder(formData, options = {}) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { Accept: 'application/json', ...authHeaders(), ...(options.headers || {}) },
    body: formData,
    signal: options.signal,
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(payload.message || `API ${res.status}: ${res.statusText}`)
    error.status = res.status
    error.errors = payload.errors
    error.body = payload
    throw error
  }
  return payload
}

export const getOrder = (orderNumber, options = {}) => apiFetch(`/orders/${orderNumber}`, options)

async function sendJson(path, body, method = 'POST') {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(payload.message || `API ${res.status}: ${res.statusText}`)
    error.status = res.status
    error.errors = payload.errors
    error.body = payload
    throw error
  }
  return payload
}

export const registerUser = (body) => sendJson('/register', body)
export const loginUser = (body) => sendJson('/login', body)
export const logoutUser = () => sendJson('/logout', null, 'POST')
export const getUser = (options = {}) => apiFetch('/user', options)
export const getAccountOrders = (options = {}) => apiFetch('/account/orders', options)
export const getAccountOrder = (orderNumber, options = {}) => apiFetch(`/account/orders/${orderNumber}`, options)
export const submitReview = (orderNumber, body) => sendJson(`/account/orders/${orderNumber}/reviews`, body)
