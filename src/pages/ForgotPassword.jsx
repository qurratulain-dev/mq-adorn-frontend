import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/client.js'

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fieldClass = (key) =>
    `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold ${errors[key] ? 'border-sale' : 'border-black/15'}`

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    setMessage('')
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Please enter your email address.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      const payload = await forgotPassword({ email: email.trim() })
      setErrors({})
      setMessage(payload.message || 'If an account exists for that email, we have sent a password reset link. Please check your inbox and spam folder.')
    } catch (error) {
      if (error.status === 429) {
        setFormError('Please wait a moment before requesting another reset email.')
      } else {
        setErrors(error.errors || {})
        setFormError(firstError(error.errors) || error.message || 'We could not send a reset email. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream">
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Account</p>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">Forgot password</h1>
        </div>
      </header>
      <div className="container-page py-10 sm:py-14">
        <form className="mx-auto max-w-md border border-black/5 bg-card p-6 sm:p-8" onSubmit={submit} noValidate>
          <p className="text-sm leading-relaxed text-muted">
            Enter the email address on your MQ Adorn account and we will send you a link to reset your password. The link expires in 60 minutes.
          </p>
          <label className="mt-6 block">
            <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Email</span>
            <input
              type="email"
              autoComplete="email"
              className={fieldClass('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="mt-1 text-xs text-sale">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
          </label>
          {formError && <p className="mt-4 text-sm text-sale">{formError}</p>}
          {message && <p className="mt-4 text-sm text-primary">{message}</p>}
          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="mt-5 text-sm text-muted">
            Remembered it?{' '}
            <Link to="/login" className="text-primary underline decoration-gold underline-offset-2 hover:text-gold">
              Back to log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
