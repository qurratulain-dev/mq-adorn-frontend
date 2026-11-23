import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/client.js'
import { ArrowRightIcon } from './Icons.jsx'
import ProductCard, { ProductCardSkeleton } from './ProductCard.jsx'
import Reveal from './Reveal.jsx'

export default function BestSellers() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60000)

    getProducts({ best_sellers: 1, sort: 'best_selling', per_page: 16 }, { signal: controller.signal })
      .then((payload) => {
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        const featured = list.filter((item) => item.is_best_seller)
        setProducts((featured.length >= 8 ? featured : [...featured, ...list]).slice(0, 8))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
      .finally(() => clearTimeout(timer))

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  return (
    <Reveal as="section" className="bg-cream" aria-labelledby="best-sellers-heading">
      <div className="container-page py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <h2 id="best-sellers-heading" className="font-heading text-3xl font-medium sm:text-4xl">
            Best Sellers
          </h2>
          <Link to="/best-selling" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-gold">
            View All <ArrowRightIcon />
          </Link>
        </div>

        {status === 'loading' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <p className="border border-black/5 bg-card px-6 py-10 text-center text-sm text-muted">
            Best sellers will appear here shortly. The shop is warming up — please try again in a moment.
          </p>
        )}

        {status === 'ready' && products.length === 0 && (
          <p className="border border-black/5 bg-card px-6 py-10 text-center text-sm text-muted">
            New best sellers are on their way.
          </p>
        )}

        {status === 'ready' && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product, index) => (
              <Reveal key={product.id || product.slug} delay={index * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  )
}
