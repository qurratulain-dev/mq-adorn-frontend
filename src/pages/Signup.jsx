import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { isPakistaniPhone } from '../lib/phone.js'
import Seo from '../components/Seo.jsx'

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function Signup() {
  const { isLoggedIn, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next = location.state?.from || '/account'
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isLoggedIn) return <Navigate to={next} replace />

  const fieldClass = (key) =>
    `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold ${errors[key] ? 'border-sale' : 'border-black/15'}`

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const nextErrors = { ...current }
      delete nextErrors[key]
      return nextErrors
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Please enter your full name.'
    if (!form.email.trim()) nextErrors.email = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Please enter a valid email address.'
    if (!form.phone.trim()) nextErrors.phone = 'Please enter your mobile number.'
    else if (!isPakistaniPhone(form.phone)) nextErrors.phone = 'Please enter a valid Pakistani mobile number, for example 03XX XXXXXXX.'
    if (!form.password) nextErrors.password = 'Please choose a password.'
    else if (form.password.length < 8) nextErrors.password = 'Please use at least 8 characters for your password.'
    if (form.password !== form.password_confirmation) nextErrors.password_confirmation = 'The password confirmation does not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      navigate(next, { replace: true })
    } catch (error) {
      setErrors(error.errors || {})
      setFormError(firstError(error.errors) || error.message || 'We could not create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream">
      <Seo title="Create account | MQ Adorn" description="Create an MQ Adorn account." path="/signup" noindex />
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Account</p>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">Create an account</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            You can still check out as a guest. An account lets you see your orders and leave a review after delivery.
          </p>
        </div>
      </header>
      <div className="container-page py-10 sm:py-14">
        <form className="mx-auto max-w-md border border-black/5 bg-card p-6 sm:p-8" onSubmit={submit} noValidate>
          <label className="block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Full name</span>
            <input autoComplete="name" className={fieldClass('name')} value={form.name} onChange={(e) => setField('name', e.target.value)} />
            {errors.name && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Email</span>
            <input type="email" autoComplete="email" className={fieldClass('email')} value={form.email} onChange={(e) => setField('email', e.target.value)} />
            {errors.email && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Mobile number</span>
            <input autoComplete="tel" placeholder="03XX XXXXXXX" className={fieldClass('phone')} value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            {errors.phone && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}</p>}
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Password</span>
            <input type="password" autoComplete="new-password" className={fieldClass('password')} value={form.password} onChange={(e) => setField('password', e.target.value)} />
            {errors.password && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Confirm password</span>
            <input type="password" autoComplete="new-password" className={fieldClass('password_confirmation')} value={form.password_confirmation} onChange={(e) => setField('password_confirmation', e.target.value)} />
            {errors.password_confirmation && (
              <p className="mt-1 text-xs text-sale">{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</p>
            )}
          </label>
          {formError && <p className="mt-4 text-sm text-sale">{formError}</p>}
          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
          <p className="mt-5 text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" state={{ from: next }} className="text-primary underline decoration-gold underline-offset-2 hover:text-gold">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
