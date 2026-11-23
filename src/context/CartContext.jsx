import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { addWishlistItem, getWishlist, quoteCartPrices, removeWishlistItem, syncWishlist } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'
import { productPricing } from '../lib/pricing.js'
import { useStoreSettings } from './StoreSettingsContext.jsx'

const CartContext = createContext(null)
const CART_KEY = 'mq-adorn-cart'
const WISHLIST_KEY = 'mq-adorn-wishlist'

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

function money(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : null
}

export function sameCartLine(item, slug, color, size) {
  return item.slug === slug && (item.color || null) === (color || null) && (item.size || null) === (size || null)
}

export function cartLineKey(item) {
  return [item.slug, item.color || '', item.size || ''].join('::')
}

export function cartLineIssue(item) {
  if (item?.unavailable) {
    return item.stock === 0
      ? 'This item is out of stock. Please remove it from your bag.'
      : 'This item is no longer available. Please remove it from your bag.'
  }
  if (item?.stock != null && Number(item.quantity || 1) > Number(item.stock)) {
    return `Only ${item.stock} left. Please update the quantity.`
  }
  return null
}

function quoteMatchesItem(quote, item) {
  if (quote?.slug && sameCartLine({ slug: quote.slug, color: quote.color, size: quote.size }, item.slug, item.color, item.size)) {
    return true
  }
  if (item.product_id && Number(quote?.product_id) === Number(item.product_id)) {
    return (quote.color || null) === (item.color || null) && (quote.size || null) === (item.size || null)
  }
  return false
}

function applyQuotes(current, quotes) {
  const unused = [...(quotes || [])]
  let priceChanged = false
  let dealEnded = false
  let unavailableChanged = false

  const next = current.map((item) => {
    const index = unused.findIndex((quote) => quoteMatchesItem(quote, item))
    const quote = index >= 0 ? unused.splice(index, 1)[0] : null
    if (!quote) return item

    const unit = money(quote.unit_price)
    const compare = money(quote.compare_price)
    const wasDeal = Boolean(item.is_deal)
    const isDeal = Boolean(quote.is_deal)
    const priceChangedOnLine = unit != null && money(item.price) !== unit
    const nowUnavailable = !quote.available

    if (priceChangedOnLine) {
      priceChanged = true
      if (wasDeal && !isDeal) dealEnded = true
    }
    if (nowUnavailable && !item.unavailable) unavailableChanged = true

    const issue = nowUnavailable
      ? null
      : cartLineIssue({ ...item, stock: quote.stock, unavailable: false, quantity: item.quantity })

    return {
      ...item,
      slug: quote.slug || item.slug,
      name: quote.name || item.name,
      product_id: quote.product_id || item.product_id,
      variant_id: quote.variant_id || item.variant_id,
      color: quote.color ?? item.color,
      size: quote.size ?? item.size,
      price: unit ?? item.price,
      compare_price: compare != null && unit != null && compare > unit ? compare : null,
      is_deal: isDeal,
      deal_ends_at: isDeal ? quote.deal?.ends_at || null : null,
      stock: quote.stock,
      available: quote.available,
      unavailable: nowUnavailable,
      price_notice: nowUnavailable
        ? null
        : priceChangedOnLine
          ? wasDeal && !isDeal
            ? 'Deal ended — price updated'
            : 'Price updated'
          : item.price_notice && !issue
            ? item.price_notice
            : null,
    }
  })

  return { next, priceChanged, dealEnded, unavailableChanged }
}


function wishlistSnapshot(product) {
  if (!product?.slug) return null
  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : []
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    images,
    price: product.price,
    sale_price: product.sale_price ?? null,
    deal: product.deal || null,
    variants: product.variants || [],
    stock: product.stock,
    is_new: product.is_new,
    is_active: product.is_active !== false,
  }
}

export function CartProvider({ children }) {
  const { shippingFeeFor } = useStoreSettings()
  const { isLoggedIn, loading: authLoading, user } = useAuth()
  const { pathname } = useLocation()
  const [items, setItems] = useState(() => readList(CART_KEY))
  const [wishlist, setWishlist] = useState(() => readList(WISHLIST_KEY))
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const itemsRef = useRef(items)
  const inFlightRef = useRef(false)
  const lastRefreshRef = useRef(0)
  const toastTimerRef = useRef(0)
  const noticeTimerRef = useRef(0)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const syncedUserRef = useRef(null)

  useEffect(() => {
    if (authLoading) return undefined
    if (!isLoggedIn) {
      syncedUserRef.current = null
      return undefined
    }
    const userId = user?.id ?? 'logged-in'
    if (syncedUserRef.current === userId) return undefined
    syncedUserRef.current = userId

    const slugs = (readList(WISHLIST_KEY) || []).map((item) => item.slug).filter(Boolean)
    let cancelled = false
    syncWishlist({ slugs })
      .then((payload) => {
        if (cancelled) return
        setWishlist((payload.data || []).map(wishlistSnapshot).filter(Boolean))
      })
      .catch(() => {
        if (!cancelled) syncedUserRef.current = null
      })
    return () => {
      cancelled = true
    }
  }, [authLoading, isLoggedIn, user?.id])

  const showToast = useCallback((message) => {
    if (!message) return
    setToast(message)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 4500)
  }, [])

  const refreshPrices = useCallback(async ({ force = false } = {}) => {
    const current = itemsRef.current
    if (!current.length) return
    const now = Date.now()
    if (!force && (inFlightRef.current || now - lastRefreshRef.current < 2000)) return

    inFlightRef.current = true
    lastRefreshRef.current = now
    try {
      const payload = await quoteCartPrices(
        current.map((item) => ({
          slug: item.slug,
          product_id: item.product_id || undefined,
          variant_id: item.variant_id || undefined,
          color: item.color || undefined,
          size: item.size || undefined,
          quantity: item.quantity || 1,
        })),
      )
      const { next, priceChanged, dealEnded, unavailableChanged } = applyQuotes(current, payload?.data || [])
      const changed = next.some((item, index) => JSON.stringify(item) !== JSON.stringify(current[index]))
      if (changed) {
        setItems(next)
        window.clearTimeout(noticeTimerRef.current)
        if (next.some((item) => item.price_notice)) {
          noticeTimerRef.current = window.setTimeout(() => {
            setItems((itemsNow) =>
              itemsNow.map((item) => (item.price_notice ? { ...item, price_notice: null } : item)),
            )
          }, 12000)
        }
      }
      if (dealEnded) showToast('Deal ended — a price in your bag was updated')
      else if (priceChanged) showToast('A price in your bag was updated')
      else if (unavailableChanged) showToast('An item in your bag is no longer available')
    } catch {
      // Keep the stored prices if the quote request fails; checkout still recomputes server-side.
    } finally {
      inFlightRef.current = false
    }
  }, [showToast])

  useEffect(() => {
    if (cartOpen) refreshPrices()
  }, [cartOpen, refreshPrices])

  useEffect(() => {
    if (pathname === '/cart' || pathname === '/checkout') refreshPrices()
  }, [pathname, refreshPrices])

  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState === 'hidden') return
      if (itemsRef.current.length) refreshPrices()
    }
    window.addEventListener('focus', onShow)
    document.addEventListener('visibilitychange', onShow)
    return () => {
      window.removeEventListener('focus', onShow)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [refreshPrices])

  useEffect(() => {
    const times = items
      .map((item) => (item.deal_ends_at ? new Date(item.deal_ends_at).getTime() : NaN))
      .filter((time) => Number.isFinite(time) && time > Date.now())
    if (!times.length) return undefined
    const wait = Math.min(Math.min(...times) - Date.now() + 750, 2147483647)
    const timer = window.setTimeout(() => refreshPrices({ force: true }), wait)
    return () => window.clearTimeout(timer)
  }, [items, refreshPrices])

  useEffect(
    () => () => {
      window.clearTimeout(toastTimerRef.current)
      window.clearTimeout(noticeTimerRef.current)
    },
    [],
  )

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      if (item.unavailable && money(item.price) == null) return sum
      return sum + Number(item.price || 0) * (item.quantity || 1)
    }, 0)
    const shippingFee = shippingFeeFor(subtotal)
    const total = subtotal + shippingFee
    const hasBlockingIssue = items.some((item) => Boolean(cartLineIssue(item)))

    return {
      items,
      setItems,
      wishlist,
      setWishlist,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      toggleCart: () => setCartOpen((open) => !open),
      cartCount: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      subtotal,
      shippingFee,
      total,
      hasBlockingIssue,
      refreshPrices,
      addToCart: (product, options = {}) => {
        const quantity = Math.max(1, Number(options.quantity) || 1)
        const color = options.color || null
        const size = options.size || null
        const pricing = productPricing(product)
        setItems((current) => {
          const index = current.findIndex((item) => sameCartLine(item, product.slug, color, size))
          if (index === -1) {
            return [
              ...current,
              {
                slug: product.slug,
                product_id: product.id,
                name: product.name,
                price: options.price || pricing.current,
                compare_price: options.compare_price ?? pricing.compare,
                is_deal: options.is_deal ?? pricing.isDeal,
                deal_ends_at: product.deal?.ends_at || null,
                image: product.images?.[0],
                quantity,
                color,
                size,
              },
            ]
          }
          return current.map((item, i) =>
            i === index ? { ...item, quantity: (item.quantity || 1) + quantity } : item,
          )
        })
        if (options.open !== false) setCartOpen(true)
      },
      updateQuantity: (slug, color, size, quantity) => {
        const next = Math.max(1, Number(quantity) || 1)
        setItems((current) =>
          current.map((item) => (sameCartLine(item, slug, color, size) ? { ...item, quantity: next } : item)),
        )
      },
      removeItem: (slug, color, size) => {
        setItems((current) => current.filter((item) => !sameCartLine(item, slug, color, size)))
      },
      clearCart: () => setItems([]),
      toggleWishlist: (product) => {
        if (!product?.slug) return
        const snapshot = wishlistSnapshot(product)
        const exists = wishlist.some((item) => item.slug === product.slug)
        setWishlist((current) => {
          const already = current.some((item) => item.slug === product.slug)
          if (already) return current.filter((item) => item.slug !== product.slug)
          return snapshot ? [...current, snapshot] : current
        })
        if (!isLoggedIn) return
        const request = exists
          ? removeWishlistItem(product.slug)
          : addWishlistItem({ slug: product.slug, product_id: product.id || undefined })
        request.catch(() => {
          setWishlist((current) => {
            const nowExists = current.some((item) => item.slug === product.slug)
            if (exists) return nowExists ? current : snapshot ? [...current, snapshot] : current
            return current.filter((item) => item.slug !== product.slug)
          })
          showToast('We could not update your wishlist. Please try again.')
        })
      },
      isWishlisted: (slug) => wishlist.some((item) => item.slug === slug),
      refreshWishlist: async () => {
        if (isLoggedIn) {
          const payload = await getWishlist()
          const next = (payload.data || []).map(wishlistSnapshot).filter(Boolean)
          setWishlist(next)
          return next
        }
        return wishlist
      },
    }
  }, [items, wishlist, cartOpen, shippingFeeFor, refreshPrices, isLoggedIn, showToast])

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[80] max-w-[min(90vw,28rem)] -translate-x-1/2 border border-black/10 bg-primary px-4 py-2.5 text-center text-sm text-white shadow-[0_12px_40px_-16px_rgba(26,26,26,0.6)]"
        >
          {toast}
        </div>
      )}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
