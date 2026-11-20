import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ADMIN_TOKEN_KEY, adminLogin, adminLogout, getAdminMe, getAdminToken } from '../api/client.js'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => getAdminToken())
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setAdmin(null)
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    getAdminMe()
      .then((payload) => setAdmin(payload.data))
      .catch(() => {
        try { localStorage.removeItem(ADMIN_TOKEN_KEY) } catch { /* ignore */ }
        setToken('')
        setAdmin(null)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [token])

  const login = useCallback(async (credentials) => {
    const payload = await adminLogin(credentials)
    try { localStorage.setItem(ADMIN_TOKEN_KEY, payload.token) } catch { /* ignore */ }
    setAdmin(payload.data)
    setToken(payload.token)
    return payload
  }, [])

  const logout = useCallback(async () => {
    try { await adminLogout() } catch { /* ignore */ }
    try { localStorage.removeItem(ADMIN_TOKEN_KEY) } catch { /* ignore */ }
    setToken('')
    setAdmin(null)
  }, [])

  const value = useMemo(() => ({
    token,
    admin,
    loading,
    isLoggedIn: Boolean(token && admin),
    login,
    logout,
  }), [token, admin, loading, login, logout])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
