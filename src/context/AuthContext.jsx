import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_TOKEN_KEY, getUser, loginUser, logoutUser, registerUser } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || ''
    } catch {
      return ''
    }
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    getUser({ signal: controller.signal })
      .then((payload) => setUser(payload.data))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY)
          setToken('')
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [token])

  const value = useMemo(() => {
    const remember = (nextToken, nextUser) => {
      if (nextToken) localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
      else localStorage.removeItem(AUTH_TOKEN_KEY)
      setToken(nextToken || '')
      setUser(nextUser || null)
    }

    return {
      user,
      token,
      loading,
      isLoggedIn: Boolean(user),
      signup: async (body) => {
        const payload = await registerUser(body)
        remember(payload.token, payload.data)
        return payload
      },
      login: async (body) => {
        const payload = await loginUser(body)
        remember(payload.token, payload.data)
        return payload
      },
      logout: async () => {
        try {
          if (token) await logoutUser()
        } catch {
          // Still clear the local session if the API is unreachable.
        }
        remember('', null)
      },
    }
  }, [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
