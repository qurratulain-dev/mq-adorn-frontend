import { useEffect, useState } from 'react'
import { changeAdminPassword, getAdminSettings, updateAdminSettings } from '../../api/client.js'
import { applyWhatsAppSettings } from '../../lib/whatsapp.js'
import { DEFAULT_ANNOUNCEMENT_LINES } from '../../lib/announcements.js'

const emptyMethod = (id, label) => ({ id, label, account_name: '', account_number: '', bank_name: '', iban: '', instructions: '' })

function firstError(errors) {
  if (!errors) return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? value[0] : String(value || '')
}

export default function AdminSettings() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)

  useEffect(() => {
    getAdminSettings()
      .then((payload) => {
        const data = payload.data
        const methods = data.payment_methods || []
        const byId = Object.fromEntries(methods.map((item) => [item.id, item]))
        setForm({
          shipping_fee: data.shipping_fee,
          free_shipping_threshold: data.free_shipping_threshold,
          whatsapp_number: data.whatsapp_number,
          announcement_lines: Array.isArray(data.announcement_lines) && data.announcement_lines.length
            ? data.announcement_lines.map((line) => ({
                text: line.text || '',
                href: line.href || '',
                show_if_deal: Boolean(line.show_if_deal),
              }))
            : DEFAULT_ANNOUNCEMENT_LINES.map((line) => ({ ...line, href: line.href || '' })),
          payment_methods: [
            { ...emptyMethod('jazzcash', 'JazzCash'), ...byId.jazzcash },
            { ...emptyMethod('easypaisa', 'Easypaisa'), ...byId.easypaisa },
            { ...emptyMethod('bank_transfer', 'Bank Transfer'), ...byId.bank_transfer },
          ],
        })
      })
      .catch((err) => setError(err.message || 'Settings could not be loaded.'))
  }, [])

  const setMethod = (id, key, value) => {
    setForm((current) => ({
      ...current,
      payment_methods: current.payment_methods.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    setError('')
    setSaved('')
    setSaving(true)
    try {
      const payload = await updateAdminSettings({
        ...form,
        announcement_lines: (form.announcement_lines || [])
          .map((line) => ({
            text: (line.text || '').trim(),
            href: (line.href || '').trim() || null,
            show_if_deal: Boolean(line.show_if_deal),
          }))
          .filter((line) => line.text),
      })
      const data = payload.data
      applyWhatsAppSettings({ number: data.whatsapp_number, display: data.whatsapp_display })
      setForm((current) => ({
        ...current,
        announcement_lines: Array.isArray(data.announcement_lines)
          ? data.announcement_lines.map((line) => ({
              text: line.text || '',
              href: line.href || '',
              show_if_deal: Boolean(line.show_if_deal),
            }))
          : current.announcement_lines,
      }))
      setSaved('Settings saved. Checkout and the shop will use these details.')
    } catch (err) {
      setError(firstError(err.errors) || err.message || 'Settings could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMsg('')
    setPasswordBusy(true)
    try {
      await changeAdminPassword(password)
      setPassword({ current_password: '', password: '', password_confirmation: '' })
      setPasswordMsg('Your password has been updated.')
    } catch (err) {
      setPasswordError(firstError(err.errors) || err.message || 'The password could not be updated.')
    } finally {
      setPasswordBusy(false)
    }
  }

  if (!form && !error) return <p className="text-sm text-muted">Loading settings…</p>

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted">These details are shown at checkout and on the shop.</p>
      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      {saved && <p className="mt-4 text-sm text-success">{saved}</p>}

      {form && (
        <form onSubmit={save} className="mt-6 space-y-8">
          <section className="border border-black/5 bg-card p-5">
            <h2 className="font-heading text-xl">Shipping</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Flat shipping fee (PKR)</span>
                <input type="number" min="0" className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.shipping_fee} onChange={(e) => setForm({ ...form, shipping_fee: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Free shipping above (PKR)</span>
                <input type="number" min="0" className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.free_shipping_threshold} onChange={(e) => setForm({ ...form, free_shipping_threshold: e.target.value })} />
              </label>
            </div>
          </section>

          <section className="border border-black/5 bg-card p-5">
            <h2 className="font-heading text-xl">WhatsApp</h2>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">WhatsApp number</span>
              <input className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
            </label>
          </section>

          <section className="border border-black/5 bg-card p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl">Announcement bar</h2>
                <p className="mt-1 text-sm text-muted">These lines rotate at the top of the shop. Use {'{free_shipping_threshold}'} or {'{whatsapp_display}'} to insert the current values.</p>
              </div>
              <button
                type="button"
                className="text-xs underline underline-offset-2 disabled:opacity-50"
                disabled={(form.announcement_lines || []).length >= 8}
                onClick={() => setForm({ ...form, announcement_lines: [...form.announcement_lines, { text: '', href: '', show_if_deal: false }] })}
              >
                Add message
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {(form.announcement_lines || []).map((line, index) => (
                <div key={index} className="border border-black/5 bg-cream/40 p-3 sm:p-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto] sm:items-end">
                    <label className="block">
                      <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Message</span>
                      <input className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" value={line.text} onChange={(e) => setForm({ ...form, announcement_lines: form.announcement_lines.map((item, i) => i === index ? { ...item, text: e.target.value } : item) })} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Link (optional)</span>
                      <input className="w-full border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" placeholder="/#deal-of-the-week or whatsapp" value={line.href || ''} onChange={(e) => setForm({ ...form, announcement_lines: form.announcement_lines.map((item, i) => i === index ? { ...item, href: e.target.value } : item) })} />
                    </label>
                    {form.announcement_lines.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-sale underline underline-offset-2 sm:mb-3"
                        onClick={() => setForm({ ...form, announcement_lines: form.announcement_lines.filter((_, i) => i !== index) })}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(line.show_if_deal)}
                      onChange={(e) => setForm({ ...form, announcement_lines: form.announcement_lines.map((item, i) => i === index ? { ...item, show_if_deal: e.target.checked } : item) })}
                    />
                    Only show while a deal is live
                  </label>
                </div>
              ))}
            </div>
          </section>

          {form.payment_methods.map((method) => (
            <section key={method.id} className="border border-black/5 bg-card p-5">
              <h2 className="font-heading text-xl">{method.label}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Account title</span>
                  <input className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={method.account_name || ''} onChange={(e) => setMethod(method.id, 'account_name', e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Account number</span>
                  <input className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={method.account_number || ''} onChange={(e) => setMethod(method.id, 'account_number', e.target.value)} />
                </label>
                {method.id === 'bank_transfer' && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Bank name</span>
                      <input className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={method.bank_name || ''} onChange={(e) => setMethod(method.id, 'bank_name', e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">IBAN</span>
                      <input className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={method.iban || ''} onChange={(e) => setMethod(method.id, 'iban', e.target.value)} />
                    </label>
                  </>
                )}
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Instructions</span>
                  <textarea rows={3} className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={method.instructions || ''} onChange={(e) => setMethod(method.id, 'instructions', e.target.value)} />
                </label>
              </div>
            </section>
          ))}

          <button type="submit" className="btn-primary px-6 py-2.5 text-xs" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
        </form>
      )}

      <form onSubmit={savePassword} className="mt-12 border border-black/5 bg-card p-5">
        <h2 className="font-heading text-xl">Change password</h2>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Current password</span>
          <input type="password" autoComplete="current-password" className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">New password</span>
          <input type="password" autoComplete="new-password" className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={password.password} onChange={(e) => setPassword({ ...password, password: e.target.value })} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs tracking-wide text-muted uppercase">Confirm new password</span>
          <input type="password" autoComplete="new-password" className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-gold" value={password.password_confirmation} onChange={(e) => setPassword({ ...password, password_confirmation: e.target.value })} />
        </label>
        {passwordError && <p className="mt-3 text-sm text-sale">{passwordError}</p>}
        {passwordMsg && <p className="mt-3 text-sm text-success">{passwordMsg}</p>}
        <button type="submit" className="btn-primary mt-5 px-6 py-2.5 text-xs" disabled={passwordBusy}>{passwordBusy ? 'Updating…' : 'Update password'}</button>
      </form>
    </div>
  )
}
