import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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

// Minimal cart/wishlist state persisted in localStorage. Expanded in the cart step.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readList(CART_KEY))
  const [wishlist, setWishlist] = useState(() => readList(WISHLIST_KEY))

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const value = useMemo(
    () => ({
      items,
      setItems,
      wishlist,
      setWishlist,
      cartCount: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      addToCart: (product, options = {}) => {
        const quantity = Math.max(1, Number(options.quantity) || 1)
        const color = options.color || null
        const size = options.size || null
        const sameLine = (item) =>
          item.slug === product.slug && (item.color || null) === color && (item.size || null) === size

        setItems((current) => {
          const index = current.findIndex(sameLine)
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
      },
      toggleWishlist: (product) => {
        setWishlist((current) => {
          const exists = current.some((item) => item.slug === product.slug)
          if (exists) return current.filter((item) => item.slug !== product.slug)
          return [...current, { slug: product.slug, name: product.name, image: product.images?.[0] }]
        })
      },
      isWishlisted: (slug) => wishlist.some((item) => item.slug === slug),
    }),
    [items, wishlist],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
