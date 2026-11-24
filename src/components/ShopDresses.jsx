import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/client.js'
import { ArrowRightIcon } from './Icons.jsx'
import ProductCard, { ProductCardSkeleton } from './ProductCard.jsx'
import Reveal from './Reveal.jsx'

export default function ShopDresses() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60000)

    getProducts({ category: 'dresses', per_page: 8 }, { signal: controller.signal })
      .then((payload) => {
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        setProducts(list.slice(0, 8))
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
    <Reveal as="section" className="bg-blush" aria-labelledby="shop-dresses-heading">
      <div className="container-page py-10 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="text-xs tracking-[0.22em] text-muted uppercase">Coming into the shop</p>
            <h2 id="shop-dresses-heading" className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
              Shop Dresses
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Preview pieces so you can see how the dresses section will look. These are dummy sample photos and will be
              replaced when the real collection is ready.
            </p>
          </div>
          <Link to="/shop?category=dresses" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-gold">
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
            Dresses will appear here shortly. The shop is warming up — please try again in a moment.
          </p>
        )}

        {status === 'ready' && products.length === 0 && (
          <p className="border border-black/5 bg-card px-6 py-10 text-center text-sm text-muted">
            The dresses collection is on its way.
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
