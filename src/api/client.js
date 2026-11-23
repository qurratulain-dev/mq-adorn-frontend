// Thin fetch wrapper around the Laravel API.
// Accepts either https://host or https://host/api (Vercel env was first set without /api).
function resolveApiUrl() {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

export const API_URL = resolveApiUrl()

export const AUTH_TOKEN_KEY = 'mq-adorn-token'
export const SESSION_EXPIRED_MESSAGE = 'Your session expired, please log in again'

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

function currentPath() {
  if (typeof window === 'undefined') return ''
  return `${window.location.pathname}${window.location.search}`
}

function alreadyOnLogin(kind) {
  const path = typeof window === 'undefined' ? '' : window.location.pathname
  return kind === 'admin'
    ? path === '/admin/login' || path.startsWith('/admin/login/')
    : path === '/login'
}

export function handleExpiredSession(kind) {
  const tokenKey = kind === 'admin' ? ADMIN_TOKEN_KEY : AUTH_TOKEN_KEY
  try {
    localStorage.removeItem(tokenKey)
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined' || alreadyOnLogin(kind)) return
  const loginPath = kind === 'admin' ? '/admin/login' : '/login'
  const from = currentPath()
  const params = new URLSearchParams({ expired: '1' })
  if (from && from !== loginPath) params.set('from', from)
  window.location.assign(`${loginPath}?${params.toString()}`)
}

export async function apiFetch(path, options = {}) {
  const { headers: optionHeaders, ...rest } = options
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeaders(), ...(optionHeaders || {}) },
    ...rest,
  })
  if (!res.ok) {
    if (res.status === 401 && (getAuthToken() || optionHeaders?.Authorization)) {
      handleExpiredSession('customer')
    }
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
export const getCurrentDeal = (options = {}) => apiFetch('/deals/current', options)
export const quoteCartPrices = (items, options = {}) =>
  apiFetch('/cart/prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify({ items }),
    signal: options.signal,
  })

export async function createOrder(formData, options = {}) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { Accept: 'application/json', ...authHeaders(), ...(options.headers || {}) },
    body: formData,
    signal: options.signal,
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && (getAuthToken() || options.headers?.Authorization)) {
      handleExpiredSession('customer')
    }
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
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && headers.Authorization) {
      handleExpiredSession('customer')
    }
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
export const forgotPassword = (body) => sendJson('/forgot-password', body)
export const resetPassword = (body) => sendJson('/reset-password', body)
export const getWishlist = (options = {}) => apiFetch('/wishlist', options)
export const addWishlistItem = (body) => sendJson('/wishlist', body)
export const removeWishlistItem = (slug) => sendJson(`/wishlist/${encodeURIComponent(slug)}`, null, 'DELETE')
export const syncWishlist = (body) => sendJson('/wishlist/sync', body)
export const logoutUser = () => sendJson('/logout', null, 'POST')
export const getUser = (options = {}) => apiFetch('/user', options)
export const getAccountOrders = (options = {}) => apiFetch('/account/orders', options)
export const getAccountOrder = (orderNumber, options = {}) => apiFetch(`/account/orders/${orderNumber}`, options)
export const submitReview = (orderNumber, body) => sendJson(`/account/orders/${orderNumber}/reviews`, body)

export const getStoreSettings = (options = {}) => apiFetch('/settings', options)
export const getTestimonials = (options = {}) => apiFetch('/testimonials', options)

export const ADMIN_TOKEN_KEY = 'mq-adorn-admin-token'

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function adminHeaders() {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function adminRequest(path, { method = 'GET', body, headers, formData } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: formData
      ? { Accept: 'application/json', ...adminHeaders(), ...(headers || {}) }
      : { Accept: 'application/json', 'Content-Type': 'application/json', ...adminHeaders(), ...(headers || {}) },
    body: formData ? formData : body ? JSON.stringify(body) : undefined,
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && adminHeaders().Authorization) {
      handleExpiredSession('admin')
    }
    const error = new Error(payload.message || `API ${res.status}: ${res.statusText}`)
    error.status = res.status
    error.errors = payload.errors
    error.body = payload
    throw error
  }
  return payload
}

export const adminLogin = (body) => adminRequest('/admin/login', { method: 'POST', body })
export const adminLogout = () => adminRequest('/admin/logout', { method: 'POST' })
export const getAdminMe = () => adminRequest('/admin/me')
export const changeAdminPassword = (body) => adminRequest('/admin/password', { method: 'PUT', body })
export const getAdminDashboard = () => adminRequest('/admin/dashboard')
export const getAdminOrders = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const query = search.toString()
  return adminRequest(`/admin/orders${query ? `?${query}` : ''}`)
}
export const getAdminOrder = (orderNumber) => adminRequest(`/admin/orders/${orderNumber}`)
export const verifyAdminPayment = (orderNumber) => adminRequest(`/admin/orders/${orderNumber}/verify-payment`, { method: 'POST' })
export const rejectAdminPayment = (orderNumber, reason) => adminRequest(`/admin/orders/${orderNumber}/reject-payment`, { method: 'POST', body: { reason } })
export const updateAdminOrderStatus = (orderNumber, status) => adminRequest(`/admin/orders/${orderNumber}/status`, { method: 'PATCH', body: { status } })
export const deleteAdminOrder = (orderNumber) => adminRequest(`/admin/orders/${orderNumber}`, { method: 'DELETE' })
export async function getAdminPaymentProofUrl(orderNumber) {
  const res = await fetch(`${API_URL}/admin/orders/${orderNumber}/payment-proof`, {
    headers: { ...adminHeaders() },
  })
  if (!res.ok) throw new Error('The payment screenshot could not be loaded.')
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
export const getAdminCategories = () => adminRequest('/admin/categories')
export const getAdminProducts = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const query = search.toString()
  return adminRequest(`/admin/products${query ? `?${query}` : ''}`)
}
export const getAdminProduct = (id) => adminRequest(`/admin/products/${id}`)
export const createAdminProduct = (body) => adminRequest('/admin/products', { method: 'POST', body })
export const updateAdminProduct = (id, body) => adminRequest(`/admin/products/${id}`, { method: 'PUT', body })
export const deleteAdminProduct = (id) => adminRequest(`/admin/products/${id}`, { method: 'DELETE' })
export const uploadAdminProductImages = (id, files) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images[]', file))
  return adminRequest(`/admin/products/${id}/images`, { method: 'POST', formData })
}
export const deleteAdminProductImage = (id, url) => adminRequest(`/admin/products/${id}/images`, { method: 'DELETE', body: { url } })
export const getAdminReviews = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const query = search.toString()
  return adminRequest(`/admin/reviews${query ? `?${query}` : ''}`)
}
export const updateAdminReview = (id, body) => adminRequest(`/admin/reviews/${id}`, { method: 'PUT', body })
export const approveAdminReview = (id) => adminRequest(`/admin/reviews/${id}/approve`, { method: 'POST' })
export const rejectAdminReview = (id) => adminRequest(`/admin/reviews/${id}/reject`, { method: 'POST' })
export const deleteAdminReview = (id) => adminRequest(`/admin/reviews/${id}`, { method: 'DELETE' })
export const getAdminCustomers = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const query = search.toString()
  return adminRequest(`/admin/customers${query ? `?${query}` : ''}`)
}
export const deleteAdminCustomer = (id) => adminRequest(`/admin/customers/${id}`, { method: 'DELETE' })
export const getAdminSettings = () => adminRequest('/admin/settings')
export const updateAdminSettings = (body) => adminRequest('/admin/settings', { method: 'PUT', body })

export const getAdminDeals = () => adminRequest('/admin/deals')
export const getAdminDeal = (id) => adminRequest(`/admin/deals/${id}`)
export const createAdminDeal = (body) => adminRequest('/admin/deals', { method: 'POST', body })
export const updateAdminDeal = (id, body) => adminRequest(`/admin/deals/${id}`, { method: 'PUT', body })
export const toggleAdminDeal = (id) => adminRequest(`/admin/deals/${id}/toggle`, { method: 'POST' })
export const deleteAdminDeal = (id) => adminRequest(`/admin/deals/${id}`, { method: 'DELETE' })
