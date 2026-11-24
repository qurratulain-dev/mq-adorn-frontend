import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { SESSION_EXPIRED_MESSAGE } from '../../api/client.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import Seo from '../../components/Seo.jsx'

function safeNext(value, fallback) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function AdminLogin() {
  const { isLoggedIn, loading, login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const expired = params.get('expired') === '1' || Boolean(location.state?.sessionExpired)
  const next = safeNext(location.state?.from || params.get('from'), '/admin')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isLoggedIn) return <Navigate to={next} replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(next, { replace: true })
    } catch (err) {
      setError(firstError(err.errors) || err.message || 'We could not log you in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <Seo title="Admin login | MQ Adorn" description="MQ Adorn admin login." path="/admin/login" noindex />
      <form className="w-full max-w-md border border-black/5 bg-card p-6 sm:p-8" onSubmit={submit} noValidate>
        <p className="text-xs tracking-[0.22em] text-muted uppercase">MQ Adorn</p>
        <h1 className="mt-2 font-heading text-3xl">Admin login</h1>
        <p className="mt-2 text-sm text-muted">This area is only for the shop owner.</p>
        {expired && (
          <p className="mt-4 border border-gold/40 bg-blush/70 px-3 py-2.5 text-sm text-primary">
            {SESSION_EXPIRED_MESSAGE}
          </p>
        )}
        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Email</span>
          <input type="email" autoComplete="username" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Password</span>
          <input type="password" autoComplete="current-password" className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="mt-4 text-sm text-sale">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
