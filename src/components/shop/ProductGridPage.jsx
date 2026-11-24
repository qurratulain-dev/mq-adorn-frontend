import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../api/client.js'
import ProductCard, { ProductCardSkeleton } from '../ProductCard.jsx'
import Reveal from '../Reveal.jsx'
import { ChevronLeftIcon, ChevronRightIcon, Grid2Icon, Grid3Icon, Grid4Icon } from '../Icons.jsx'
import Seo from '../Seo.jsx'

const PER_PAGE = 12

function Pagination({ page, lastPage, onPage }) {
  if (lastPage <= 1) return null
  return (
    <nav className="mt-10 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
      <button type="button" className="inline-flex items-center gap-1 disabled:text-muted" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeftIcon width={14} height={14} /> Previous
      </button>
      <span className="text-muted">
        Page {page} of {lastPage}
      </span>
      <button type="button" className="inline-flex items-center gap-1 disabled:text-muted" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
        Next <ChevronRightIcon width={14} height={14} />
      </button>
    </nav>
  )
}

export default function ProductGridPage({
  title,
  eyebrow,
  crumbs = [],
  params = {},
  emptyTitle = 'Nothing to show just yet',
  emptyBody = 'Please check back in a moment.',
  seoTitle,
  seoDescription,
  seoPath,
}) {
  const [page, setPage] = useState(1)
  const [cols, setCols] = useState(4)
  const [payload, setPayload] = useState(null)
  const [status, setStatus] = useState('loading')
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    setPage(1)
  }, [JSON.stringify(params), title])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    getProducts(
      { ...params, page, per_page: PER_PAGE },
      { signal: controller.signal },
    )
      .then((data) => {
        setPayload(data)
        setStatus('ready')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus('error')
      })
    return () => controller.abort()
  }, [JSON.stringify(params), page, reloadTick])

  const products = Array.isArray(payload?.data) ? payload.data : []
  const total = Number(payload?.total) || 0
  const lastPage = Number(payload?.last_page) || 1
  const gridClass =
    cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="bg-cream">
      <Seo
        title={seoTitle || `${title} | MQ Adorn`}
        description={seoDescription || `Shop ${title} at MQ Adorn, jewellery and dresses online in Pakistan.`}
        path={seoPath || '/shop'}
      />
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="text-xs tracking-wide text-muted uppercase">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-gold">Home</Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.to || crumb.label} className="contents">
                  <span aria-hidden="true">/</span>
                  <span>
                    {crumb.to ? (
                      <Link to={crumb.to} className="hover:text-gold">{crumb.label}</Link>
                    ) : (
                      <span className="text-primary">{crumb.label}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
          {eyebrow ? <p className="mt-3 text-xs tracking-[0.22em] text-muted uppercase">{eyebrow}</p> : null}
          <h1 className={`${eyebrow ? 'mt-2' : 'mt-3'} font-heading text-3xl font-medium sm:text-4xl`}>{title}</h1>
        </div>
      </header>

      <div className="container-page py-6 sm:py-8 lg:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {status === 'ready' ? (
              <>
                <span className="font-medium text-primary">{total}</span> {total === 1 ? 'product' : 'products'}
              </>
            ) : (
              'Looking through the collection…'
            )}
          </p>
          <div className="hidden items-center border border-black/10 bg-white md:flex" role="group" aria-label="Grid size">
            {[[2, Grid2Icon], [3, Grid3Icon], [4, Grid4Icon]].map(([value, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={cols === value}
                aria-label={`${value} column grid`}
                className={`p-2 ${cols === value ? 'bg-primary text-white' : 'text-muted hover:text-primary'}`}
                onClick={() => setCols(value)}
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>

        {status === 'loading' && (
          <div className={`grid gap-3 sm:gap-5 ${gridClass}`}>
            {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        )}

        {status === 'error' && (
          <div className="border border-black/5 bg-card px-6 py-16 text-center">
            <p className="font-heading text-2xl">The shop is warming up</p>
            <p className="mt-2 text-sm text-muted">We could not load products just now. Please try again in a moment.</p>
            <button type="button" className="btn-primary mt-6 px-6" onClick={() => setReloadTick((tick) => tick + 1)}>
              Retry
            </button>
          </div>
        )}

        {status === 'ready' && products.length === 0 && (
          <div className="border border-black/5 bg-card px-6 py-16 text-center">
            <p className="font-heading text-2xl">{emptyTitle}</p>
            <p className="mt-2 text-sm text-muted">{emptyBody}</p>
          </div>
        )}

        {status === 'ready' && products.length > 0 && (
          <>
            <div className={`grid gap-3 sm:gap-5 ${gridClass}`}>
              {products.map((product, index) => (
                <Reveal key={product.id || product.slug} delay={(index % 4) * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
            <Pagination page={page} lastPage={lastPage} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
