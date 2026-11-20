import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({ open, title, body, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape' && !busy) onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={busy ? undefined : onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-full max-w-md border border-black/5 bg-card p-6 shadow-xl">
        <h2 id="confirm-title" className="font-heading text-xl">{title}</h2>
        {body && <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-outline px-4 py-2 text-xs" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            type="button"
            className={`px-4 py-2 text-xs font-medium tracking-wide uppercase text-white ${danger ? 'bg-sale hover:bg-sale/90' : 'bg-gold hover:bg-gold-dark'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
