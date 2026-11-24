import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProduct, getWishlist } from '../api/client.js'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import Seo from '../components/Seo.jsx'

function asProduct(item) {
  if (!item) return null
  if (Array.isArray(item.images) && item.images.length) return item
  if (item.image) return { ...item, images: [item.image] }
  return { ...item, images: item.images || [] }
}

export default function Wishlist() {
  const { wishlist, setWishlist, toggleWishlist } = useCart()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    document.title = 'Wishlist | MQ Adorn'
    return () => {
      document.title = 'MQ Adorn — Jewellery & Dresses'
    }
  }, [])

  useEffect(() => {
    if (authLoading) return undefined
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      try {
        if (isLoggedIn) {
          const payload = await getWishlist()
          if (cancelled) return
          setWishlist((payload.data || []).map(asProduct).filter(Boolean))
          setStatus('ready')
          return
        }

        const slugs = [...new Set(wishlist.map((item) => item.slug).filter(Boolean))]
        if (!slugs.length) {
          if (!cancelled) setStatus('ready')
          return
        }

        const results = await Promise.all(
          slugs.map(async (slug) => {
            try {
              const payload = await getProduct(slug)
              return asProduct(payload.data)
            } catch (error) {
              if (error.status === 404) return null
              return asProduct(wishlist.find((item) => item.slug === slug))
            }
          }),
        )
        if (cancelled) return
        setWishlist(results.filter(Boolean))
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // Hydrate once per session/auth change; wishlist updates stay local/API driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isLoggedIn, setWishlist])

  const products = useMemo(() => wishlist.map(asProduct).filter((item) => item?.slug), [wishlist])

  return (
    <div className="bg-cream">
      <Seo title="Wishlist | MQ Adorn" description="Your saved MQ Adorn pieces." path="/wishlist" noindex />
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="text-xs tracking-wide text-muted uppercase">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-gold">Home</Link>
              </li>
              <li className="contents">
                <span aria-hidden="true">/</span>
                <span className="text-primary">Wishlist</span>
              </li>
            </ol>
          </nav>
          <p className="mt-3 text-xs tracking-[0.22em] text-muted uppercase">Account</p>
          <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">Wishlist</h1>
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        {status === 'loading' || authLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : status === 'error' ? (
          <div className="border border-black/5 bg-card px-6 py-16 text-center">
            <p className="font-heading text-2xl">We could not load your wishlist</p>
            <p className="mt-2 text-sm text-muted">Please try again in a moment.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="border border-black/5 bg-card px-6 py-16 text-center">
            <p className="font-heading text-2xl">Your wishlist is empty</p>
            <p className="mt-2 text-sm text-muted">Save the pieces you love and they will appear here.</p>
            <Link to="/shop" className="btn-primary mt-6 inline-flex">
              Browse shop
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-muted">
              <span className="font-medium text-primary">{products.length}</span>{' '}
              {products.length === 1 ? 'saved piece' : 'saved pieces'}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <Reveal key={product.id || product.slug} delay={(index % 4) * 60} className="flex h-full flex-col">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    className="mt-2 text-xs text-muted underline decoration-black/20 underline-offset-2 hover:text-sale"
                    onClick={() => toggleWishlist(product)}
                  >
                    Remove
                  </button>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
