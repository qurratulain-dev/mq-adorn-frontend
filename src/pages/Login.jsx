import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from '../lib/whatsapp.js'

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function Login() {
  const { isLoggedIn, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next = location.state?.from || '/account'
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isLoggedIn) return <Navigate to={next} replace />

  const fieldClass = (key) =>
    `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold ${errors[key] ? 'border-sale' : 'border-black/15'}`

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Please enter your email address.'
    if (!form.password) nextErrors.password = 'Please enter your password.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(next, { replace: true })
    } catch (error) {
      setErrors(error.errors || {})
      setFormError(firstError(error.errors) || error.message || 'We could not log you in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream">
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Account</p>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">Log in</h1>
        </div>
      </header>
      <div className="container-page py-10 sm:py-14">
        <form className="mx-auto max-w-md border border-black/5 bg-card p-6 sm:p-8" onSubmit={submit} noValidate>
          <label className="block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Email</span>
            <input type="email" autoComplete="email" className={fieldClass('email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Password</span>
            <input type="password" autoComplete="current-password" className={fieldClass('password')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
          </label>
          {formError && <p className="mt-4 text-sm text-sale">{formError}</p>}
          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
          <p className="mt-5 text-sm text-muted">
            New here?{' '}
            <Link to="/signup" state={{ from: next }} className="text-primary underline decoration-gold underline-offset-2 hover:text-gold">
              Create an account
            </Link>
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Forgot your password? Email reset is not set up yet (there is no mail service on the server). Please message us on{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>{' '}
            if you need help with your account.
          </p>
        </form>
      </div>
    </div>
  )
}
