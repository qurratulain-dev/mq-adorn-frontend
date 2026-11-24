import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/client.js'
import Seo from '../components/Seo.jsx'

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = (params.get('token') || '').trim()
  const email = (params.get('email') || '').trim()
  const linkLooksValid = Boolean(token && email)

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fieldClass = (key) =>
    `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold ${errors[key] ? 'border-sale' : 'border-black/15'}`

  const missingLinkMessage = useMemo(
    () => 'This reset link is invalid or has expired. Please request a new one.',
    [],
  )

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    setMessage('')
    if (!linkLooksValid) {
      setFormError(missingLinkMessage)
      return
    }
    const nextErrors = {}
    if (!form.password) nextErrors.password = 'Please choose a new password.'
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation = 'The password confirmation does not match.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      const payload = await resetPassword({
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setErrors({})
      setMessage(payload.message || 'Your password has been updated. You can log in now.')
    } catch (error) {
      if (error.status === 429) {
        setFormError('Please wait a moment before trying again.')
      } else {
        setErrors(error.errors || {})
        setFormError(firstError(error.errors) || error.message || 'This reset link is invalid or has expired.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream">
      <Seo title="Reset password | MQ Adorn" description="Choose a new password for your MQ Adorn account." path="/reset-password" noindex />
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Account</p>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">Reset password</h1>
        </div>
      </header>
      <div className="container-page py-10 sm:py-14">
        <form className="mx-auto max-w-md border border-black/5 bg-card p-6 sm:p-8" onSubmit={submit} noValidate>
          {!linkLooksValid ? (
            <>
              <p className="text-sm leading-relaxed text-muted">{missingLinkMessage}</p>
              <p className="mt-5 text-sm text-muted">
                <Link to="/forgot-password" className="text-primary underline decoration-gold underline-offset-2 hover:text-gold">
                  Request a new reset link
                </Link>
              </p>
            </>
          ) : message ? (
            <>
              <p className="text-sm leading-relaxed text-primary">{message}</p>
              <p className="mt-5 text-sm text-muted">
                <Link to="/login" className="text-primary underline decoration-gold underline-offset-2 hover:text-gold">
                  Log in
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-muted">
                Choose a new password for {email}. This link expires 60 minutes after it was sent.
              </p>
              <label className="mt-6 block">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={fieldClass('password')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={fieldClass('password_confirmation')}
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                />
                {errors.password_confirmation && (
                  <p className="mt-1 text-xs text-sale">
                    {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
                  </p>
                )}
              </label>
              {formError && <p className="mt-4 text-sm text-sale">{formError}</p>}
              <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
                {submitting ? 'Updating…' : 'Update password'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
