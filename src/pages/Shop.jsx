import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts } from '../api/client.js'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx'
import Reveal from '../components/Reveal.jsx'
import ShopFilters from '../components/shop/ShopFilters.jsx'
import { CloseIcon, FilterIcon, Grid2Icon, Grid3Icon, Grid4Icon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons.jsx'
import { useDebouncedValue } from '../lib/hooks.js'
import {
  PRICE_RANGES,
  SORT_OPTIONS,
  currentPriceRangeId,
  parseShopParams,
  shopPath,
  subLabel,
} from '../lib/shopParams.js'

const PER_PAGE = 12

function useShopState() {
  const [searchParams, setSearchParams] = useSearchParams()
  const values = useMemo(() => parseShopParams(searchParams), [searchParams])

  const update = (patch, { replace = false } = {}) => {
    const next = { ...values, ...patch }
    if (!('page' in patch)) next.page = 1
    const query = shopPath(next).replace(/^\/shop\??/, '')
    const params = new URLSearchParams(query)
    setSearchParams(params, { replace })
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams({ category: values.category }))
  }

  return { values, update, clearFilters }
}

function Breadcrumbs({ values }) {
  const categoryLabel = values.category === 'dresses' ? 'Dresses' : 'Jewellery'
  const categoryTo = shopPath({ category: values.category, sort: 'featured', page: 1 })
  const sub = values.sub ? subLabel(values.category, values.sub) : null

  return (
    <nav aria-label="Breadcrumb" className="text-xs tracking-wide text-muted uppercase">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-gold">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to={shopPath({ category: 'jewellery' })} className="hover:text-gold">
            Shop
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          {sub ? (
            <Link to={categoryTo} className="hover:text-gold">
              {categoryLabel}
            </Link>
          ) : (
            <span className="text-primary">{categoryLabel}</span>
          )}
        </li>
        {sub && (
          <>
            <li aria-hidden="true">/</li>
            <li className="text-primary">{sub}</li>
          </>
        )}
      </ol>
    </nav>
  )
}

function FilterChips({ values, update, clearFilters }) {
  const chips = []
  if (values.sub) chips.push({ key: 'sub', label: subLabel(values.category, values.sub), clear: { sub: '' } })
  if (values.q) chips.push({ key: 'q', label: `“${values.q}”`, clear: { q: '' } })
  const range = PRICE_RANGES.find((item) => item.id === currentPriceRangeId(values))
  if (range) {
    chips.push({ key: 'price', label: range.label, clear: { min_price: '', max_price: '' } })
  } else if (values.min_price || values.max_price) {
    const label = [values.min_price && `From Rs ${Number(values.min_price).toLocaleString('en-PK')}`, values.max_price && `Up to Rs ${Number(values.max_price).toLocaleString('en-PK')}`]
      .filter(Boolean)
      .join(' ')
    chips.push({ key: 'price', label, clear: { min_price: '', max_price: '' } })
  }
  if (values.on_sale) chips.push({ key: 'sale', label: 'On sale', clear: { on_sale: false } })
  if (values.in_stock) chips.push({ key: 'stock', label: 'In stock', clear: { in_stock: false } })
  if (values.size) chips.push({ key: 'size', label: `Size ${values.size}`, clear: { size: '' } })

  if (chips.length === 0) return null

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="inline-flex items-center gap-1.5 border border-black/10 bg-white px-2.5 py-1 text-xs hover:border-gold"
          onClick={() => update(chip.clear)}
        >
          {chip.label}
          <CloseIcon width={12} height={12} />
        </button>
      ))}
      <button type="button" className="text-xs font-medium text-muted uppercase hover:text-gold" onClick={clearFilters}>
        Clear all
      </button>
    </div>
  )
}

function Pagination({ page, lastPage, onPage }) {
  if (lastPage <= 1) return null
  const pages = []
  for (let i = 1; i <= lastPage; i += 1) {
    if (i === 1 || i === lastPage || Math.abs(i - page) <= 1) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        className="flex h-10 w-10 items-center justify-center border border-black/10 bg-white disabled:opacity-40"
        aria-label="Previous page"
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeftIcon />
      </button>
      {pages.map((item, index) =>
        item === '…' ? (
          <span key={`e-${index}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            className={`h-10 min-w-10 px-2 text-sm ${item === page ? 'bg-gold text-white' : 'border border-black/10 bg-white hover:border-gold'}`}
            onClick={() => onPage(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= lastPage}
        className="flex h-10 w-10 items-center justify-center border border-black/10 bg-white disabled:opacity-40"
        aria-label="Next page"
        onClick={() => onPage(page + 1)}
      >
        <ChevronRightIcon />
      </button>
    </nav>
  )
}

export default function Shop() {
  const { values, update, clearFilters } = useShopState()
  const [status, setStatus] = useState('loading')
  const [payload, setPayload] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)
  const [cols, setCols] = useState(4)
  const [searchDraft, setSearchDraft] = useState(values.q)
  const debouncedSearch = useDebouncedValue(searchDraft, 400)

  useEffect(() => {
    setSearchDraft(values.q)
  }, [values.q])

  useEffect(() => {
    if (debouncedSearch === values.q) return undefined
    update({ q: debouncedSearch }, { replace: true })
    return undefined
    // values.q and update are stable enough per render; we only sync when the draft settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 60000)
    setStatus('loading')

    getProducts(
      {
        category: values.category,
        sub: values.sub,
        q: values.q,
        min_price: values.min_price,
        max_price: values.max_price,
        on_sale: values.on_sale ? 1 : undefined,
        in_stock: values.in_stock ? 1 : undefined,
        size: values.size,
        sort: values.sort,
        page: values.page,
        per_page: PER_PAGE,
      },
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
      .finally(() => window.clearTimeout(timer))

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [values, reloadTick])

  useEffect(() => {
    const title = values.sub ? subLabel(values.category, values.sub) : values.category === 'dresses' ? 'Dresses' : 'Jewellery'
    document.title = `${title} | MQ Adorn`
    return () => {
      document.title = 'MQ Adorn — Jewellery & Dresses'
    }
  }, [values.category, values.sub])

  useEffect(() => {
    if (!filtersOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [filtersOpen])

  const products = Array.isArray(payload?.data) ? payload.data : []
  const total = Number(payload?.total) || 0
  const lastPage = Number(payload?.last_page) || 1
  const heading = values.sub ? subLabel(values.category, values.sub) : values.category === 'dresses' ? 'Dresses' : 'Jewellery'
  const gridClass =
    cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  const switchCategory = (category) => {
    update({ category, sub: '', size: category === 'dresses' ? values.size : '' })
  }

  return (
    <div className="bg-cream">
      <header className="border-b border-black/5 bg-blush/60">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs values={values} />
          <h1 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">{heading}</h1>
        </div>
      </header>

      <div className="container-page py-6 sm:py-8 lg:py-10">
        <div className="mb-6 flex border-b border-black/10" role="tablist" aria-label="Product type">
          {[
            { id: 'jewellery', label: 'Jewellery' },
            { id: 'dresses', label: 'Dresses' },
          ].map((tab) => {
            const active = values.category === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`relative px-5 py-3 text-sm font-medium tracking-wide uppercase transition ${
                  active ? 'text-primary' : 'text-muted hover:text-primary'
                }`}
                onClick={() => switchCategory(tab.id)}
              >
                {tab.label}
                <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-gold transition ${active ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            )
          })}
        </div>

        <div className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <ShopFilters values={values} onChange={update} onClear={clearFilters} />
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-black/15 bg-white px-3 py-2 text-sm lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  <FilterIcon width={16} height={16} /> Filters
                </button>
                <p className="text-sm text-muted">
                  {status === 'ready' ? (
                    <>
                      <span className="font-medium text-primary">{total}</span> {total === 1 ? 'product' : 'products'}
                    </>
                  ) : (
                    'Looking through the collection…'
                  )}
                </p>
              </div>

              <div className="flex flex-1 items-center gap-2 sm:max-w-xl sm:justify-end">
                <label className="relative min-w-0 flex-1 sm:max-w-xs">
                  <span className="sr-only">Search products</span>
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" width={16} height={16} />
                  <input
                    type="search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search this collection"
                    className="w-full border border-black/10 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-gold"
                  />
                </label>
                <label className="shrink-0 text-sm text-muted">
                  <span className="sr-only">Sort</span>
                  <select
                    value={values.sort}
                    onChange={(event) => update({ sort: event.target.value })}
                    className="border border-black/10 bg-white px-2 py-2 text-sm outline-none focus:border-gold"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="hidden items-center border border-black/10 bg-white md:flex" role="group" aria-label="Grid size">
                  {[
                    [2, Grid2Icon],
                    [3, Grid3Icon],
                    [4, Grid4Icon],
                  ].map(([value, Icon]) => (
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
            </div>

            <FilterChips values={values} update={update} clearFilters={clearFilters} />

            {status === 'loading' && (
              <div className={`grid gap-3 sm:gap-5 ${gridClass}`}>
                {Array.from({ length: 8 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
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
                <p className="font-heading text-2xl">No products found</p>
                <p className="mt-2 text-sm text-muted">Try a different search or clear the filters to see more of the collection.</p>
                <button type="button" className="btn-outline mt-6 px-6" onClick={clearFilters}>
                  Clear filters
                </button>
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
                <Pagination page={values.page} lastPage={lastPage} onPage={(page) => update({ page })} />
              </>
            )}
          </div>
        </div>
      </div>

      {createPortal(
        <div className={`fixed inset-0 z-[60] lg:hidden ${filtersOpen ? '' : 'pointer-events-none'}`} aria-hidden={!filtersOpen}>
          <button
            type="button"
            aria-label="Close filters"
            className={`absolute inset-0 bg-primary/40 transition-opacity duration-300 motion-reduce:transition-none ${
              filtersOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setFiltersOpen(false)}
          />
          <aside
            className={`absolute inset-y-0 left-0 flex w-80 max-w-[90%] flex-col bg-cream shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
              filtersOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            aria-label="Filters"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <p className="font-heading text-xl">Filters</p>
              <button type="button" aria-label="Close filters" className="p-2" onClick={() => setFiltersOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              <ShopFilters values={values} onChange={update} onClear={clearFilters} />
            </div>
            <div className="border-t border-black/10 px-5 py-4">
              <button type="button" className="btn-primary w-full" onClick={() => setFiltersOpen(false)}>
                View {status === 'ready' ? total : ''} results
              </button>
            </div>
          </aside>
        </div>,
        document.body,
      )}
    </div>
  )
}
