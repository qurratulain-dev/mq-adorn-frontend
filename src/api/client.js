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

export const getStoreSettings = (options = {}) => apiFetch('/settings', options)

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
