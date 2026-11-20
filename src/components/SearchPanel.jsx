import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../api/client.js'
import { formatRs } from '../lib/format.js'
import { useDebouncedValue } from '../lib/hooks.js'
import { CloseIcon, SearchIcon, SpinnerIcon, ArrowRightIcon } from './Icons.jsx'

const POPULAR = [
  { label: 'Earrings', to: '/shop?category=jewellery&sub=earrings' },
  { label: 'Necklaces', to: '/shop?category=jewellery&sub=necklaces' },
  { label: 'Rings', to: '/shop?category=jewellery&sub=rings' },
  { label: 'Bangles', to: '/shop?category=jewellery&sub=bangles' },
  { label: 'Dresses', to: '/shop?category=dresses' },
]

export default function SearchPanel({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const titleId = useId()
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(open)
  const [status, setStatus] = useState('idle')
  const [results, setResults] = useState([])
  const debounced = useDebouncedValue(query.trim(), 300)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setQuery('')
      setResults([])
      setStatus('idle')
      const id = window.setTimeout(() => inputRef.current?.focus(), 60)
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        window.clearTimeout(id)
        document.body.style.overflow = previous
      }
    }
    const hide = window.setTimeout(() => setVisible(false), 280)
    return () => window.clearTimeout(hide)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined
    if (debounced.length < 2) {
      setResults([])
      setStatus(debounced.length ? 'idle' : 'idle')
      return undefined
    }

    const controller = new AbortController()
    setStatus('loading')
    getProducts({ q: debounced, per_page: 6 }, { signal: controller.signal })
      .then((payload) => {
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        setResults(list.slice(0, 6))
        setStatus('ready')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [debounced, open])

  const goToResults = (event) => {
    event?.preventDefault()
    const value = query.trim()
    onClose()
    navigate(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop')
  }

  if (!visible && !open) return null

  const showSuggestions = debounced.length >= 2

  return createPortal(
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} role="presentation">
      <button
        type="button"
        aria-label="Close search"
        className={`absolute inset-0 bg-primary/40 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-x-0 top-0 flex h-full flex-col overflow-hidden bg-cream shadow-[0_24px_60px_-28px_rgba(26,26,26,0.55)] transition-all duration-300 ease-out motion-reduce:transition-none sm:h-auto sm:max-h-[min(52rem,94vh)] ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-6 opacity-0'
        }`}
      >
        <h2 id={titleId} className="sr-only">
          Search the shop
        </h2>
        <form className="container-page flex items-center gap-3 border-b border-black/10 pt-5 pb-4 sm:pt-8 sm:pb-6" onSubmit={goToResults}>
          <SearchIcon className="shrink-0 text-gold" width={26} height={26} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for jewellery, dresses, gifts…"
            className="w-full bg-transparent font-heading text-2xl text-primary outline-none placeholder:text-muted/70 sm:text-3xl"
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="search"
          />
          <button type="button" aria-label="Close search" className="p-2 text-primary transition hover:text-gold" onClick={onClose}>
            <CloseIcon />
          </button>
        </form>

        <div className="container-page min-h-0 flex-1 overflow-y-auto py-5 sm:py-6">
          <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">Popular searches</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className="border border-primary/15 bg-card px-3.5 py-1.5 text-sm transition hover:border-gold hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {showSuggestions && (
            <div className="mt-6">
              {status === 'loading' && (
                <p className="flex items-center gap-2 text-sm text-muted">
                  <SpinnerIcon /> Searching the collection…
                </p>
              )}

              {status === 'error' && (
                <p className="text-sm text-muted">We could not load suggestions just now. Press Enter to search the shop.</p>
              )}

              {status === 'ready' && results.length === 0 && (
                <p className="text-sm text-muted">
                  No results for <span className="font-medium text-primary">“{debounced}”</span>. Try another name or a category above.
                </p>
              )}

              {status === 'ready' && results.length > 0 && (
                <ul className="divide-y divide-black/5 border-t border-black/5">
                  {results.map((product) => {
                    const image = product.images?.[0]
                    const onSale = Boolean(product.sale_price)
                    return (
                      <li key={product.id || product.slug}>
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 py-3 transition hover:bg-white/80"
                        >
                          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-white">
                            {image ? (
                              <img src={image} alt="" className="h-full w-full object-contain p-1" />
                            ) : (
                              <span className="text-[10px] text-muted">No image</span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{product.name}</span>
                            <span className="mt-0.5 block text-sm">
                              {onSale ? (
                                <>
                                  <span className="text-sale">{formatRs(product.sale_price)}</span>{' '}
                                  <s className="text-muted">{formatRs(product.price)}</s>
                                </>
                              ) : (
                                <span>{formatRs(product.price)}</span>
                              )}
                            </span>
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}

            </div>
          )}
        </div>

        {showSuggestions && (status === 'ready' || status === 'loading') && (
          <div className="border-t border-black/10 bg-cream">
            <div className="container-page py-3">
              <Link
                to={`/shop?q=${encodeURIComponent(debounced)}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-gold"
              >
                View all results <ArrowRightIcon />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
