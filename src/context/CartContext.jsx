import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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

export function sameCartLine(item, slug, color, size) {
  return item.slug === slug && (item.color || null) === (color || null) && (item.size || null) === (size || null)
}

export function cartLineKey(item) {
  return [item.slug, item.color || '', item.size || ''].join('::')
}

export function CartProvider({ children }) {
  const { shippingFeeFor } = useStoreSettings()
  const [items, setItems] = useState(() => readList(CART_KEY))
  const [wishlist, setWishlist] = useState(() => readList(WISHLIST_KEY))
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0)
    const shippingFee = shippingFeeFor(subtotal)
    const total = subtotal + shippingFee

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
      addToCart: (product, options = {}) => {
        const quantity = Math.max(1, Number(options.quantity) || 1)
        const color = options.color || null
        const size = options.size || null
        setItems((current) => {
          const index = current.findIndex((item) => sameCartLine(item, product.slug, color, size))
          if (index === -1) {
            return [
              ...current,
              {
                slug: product.slug,
                name: product.name,
                price: options.price || product.sale_price || product.price,
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
        setWishlist((current) => {
          const exists = current.some((item) => item.slug === product.slug)
          if (exists) return current.filter((item) => item.slug !== product.slug)
          return [...current, { slug: product.slug, name: product.name, image: product.images?.[0] }]
        })
      },
      isWishlisted: (slug) => wishlist.some((item) => item.slug === slug),
    }
  }, [items, wishlist, cartOpen, shippingFeeFor])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
