import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import ProductGallery from '../components/product/ProductGallery.jsx'
import Reveal from '../components/Reveal.jsx'
import { BagIcon, HeartIcon, MinusIcon, PlusIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatRs } from '../lib/format.js'
import { productPricing } from '../lib/pricing.js'
import { availableStock, colorHex, firstAvailableSelection, findVariant, uniqueValues } from '../lib/product.js'
import { shopPath } from '../lib/shopParams.js'
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp.js'
import { DELIVERY_COPY, NO_RETURNS_INTRO, NO_RETURNS_ADVICE } from '../content/policies.js'
import Seo from '../components/Seo.jsx'
import { productJsonLd, truncateMeta } from '../lib/seo.js'

const DETAIL_SECTIONS = (product) => {
  const isDress = product.type === 'dress'
  return [
    {
      id: 'description',
      title: 'Description',
      body: product.description || 'Product details will be added soon.',
    },
    {
      id: 'materials',
      title: isDress ? 'Fabric & care' : 'Materials & care',
      body: product.materials || (isDress
        ? 'Dummy fabric notes — replace with the real composition. For most pieces we recommend a gentle hand wash or a professional laundry, and ironing on a low setting on the reverse. Keep embroidered or embellished areas away from rough surfaces.'
        : 'Dummy material notes — replace with the real finish and stones. Wipe with a soft dry cloth after wearing, keep away from perfume, water and hairspray, and store separately in a pouch so pieces do not scratch one another.'),
    },
    {
      id: 'delivery',
      title: 'Delivery & returns',
      body: (
        <>
          {DELIVERY_COPY} {NO_RETURNS_INTRO} {NO_RETURNS_ADVICE}{' '}
          <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">
            Read the Return Policy
          </Link>
          .
        </>
      ),
    },
    {
      id: 'payment',
      title: 'Payment',
      body: 'Payment is taken manually at checkout by JazzCash, Easypaisa or bank transfer. You will be asked to upload a screenshot of the payment. We do not offer Cash on Delivery.',
    },
  ]
}

function Breadcrumbs({ product }) {
  const isDress = product.type === 'dress'
  const categoryTo = shopPath({ category: isDress ? 'dresses' : 'jewellery' })
  const subTo = product.category?.slug
    ? shopPath({ category: isDress ? 'dresses' : 'jewellery', sub: product.category.slug })
    : null

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
          <Link to="/shop" className="hover:text-gold">
            Shop
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to={categoryTo} className="hover:text-gold">
            {isDress ? 'Dresses' : 'Jewellery'}
          </Link>
        </li>
        {product.category && (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link to={subTo} className="hover:text-gold">
                {product.category.name}
              </Link>
            </li>
          </>
        )}
        <li aria-hidden="true">/</li>
        <li className="text-primary">{product.name}</li>
      </ol>
    </nav>
  )
}

function InfoTabs({ product }) {
  const sections = DETAIL_SECTIONS(product)
  const [open, setOpen] = useState(sections[0].id)

  return (
    <div className="border-t border-black/10">
      {sections.map((section) => {
        const isOpen = open === section.id
        return (
          <div key={section.id} className="border-b border-black/10">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? '' : section.id)}
            >
              <span className="text-[11px] font-medium tracking-[0.22em] uppercase">{section.title}</span>
              <span className="text-gold" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <p className="overflow-hidden text-sm leading-relaxed text-muted">{section.body}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="container-page py-8 lg:py-12" aria-hidden="true">
      <div className="mb-6 h-3 w-64 animate-pulse bg-blush" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <div className="aspect-square animate-pulse bg-blush" />
        <div>
          <div className="h-8 w-3/4 animate-pulse bg-blush" />
          <div className="mt-4 h-5 w-32 animate-pulse bg-blush" />
          <div className="mt-8 h-24 animate-pulse bg-blush" />
          <div className="mt-6 h-12 animate-pulse bg-blush" />
        </div>
      </div>
    </div>
  )
}

export default function Product() {
  const { slug } = useParams()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const [status, setStatus] = useState('loading')
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState({ average: null, count: 0 })
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 60000)
    setStatus('loading')
    setProduct(null)
    setAdded(false)

    getProduct(slug, { signal: controller.signal })
      .then((payload) => {
        const item = payload?.data
        if (!item) {
          setStatus('notfound')
          return
        }
        const selection = firstAvailableSelection(item.variants)
        setProduct(item)
        setRelated(Array.isArray(payload.related) ? payload.related : [])
        setReviews(Array.isArray(payload.reviews) ? payload.reviews : [])
        setRating(payload.rating || { average: null, count: 0 })
        setColor(selection.color)
        setSize(selection.size)
        setQuantity(1)
        setStatus('ready')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus(error.status === 404 ? 'notfound' : 'error')
      })
      .finally(() => window.clearTimeout(timer))

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [slug])

  const colors = useMemo(() => uniqueValues(product?.variants, 'color'), [product])
  const sizes = useMemo(() => {
    const variants = product?.variants || []
    const inColor = color ? variants.filter((item) => item.color === color) : variants
    const list = uniqueValues(inColor, 'size')
    return list.length ? list : uniqueValues(variants, 'size')
  }, [product, color])

  const variant = useMemo(() => findVariant(product?.variants, color, size), [product, color, size])
  const stock = product ? availableStock(product, variant) : 0
  const inStock = stock > 0
  const pricing = product ? productPricing(product, variant) : { current: 0, compare: null, isDeal: false, badge: null }
  const unitPrice = pricing.current
  const comparePrice = pricing.compare
  const loved = product ? isWishlisted(product.slug) : false
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${slug}` : `/product/${slug}`

  useEffect(() => {
    if (quantity > stock && stock > 0) setQuantity(stock)
  }, [stock, quantity])

  const add = () => {
    if (!product || !inStock) return
    addToCart(product, { quantity, color: color || null, size: size || null, price: unitPrice, compare_price: comparePrice, is_deal: pricing.isDeal })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2500)
  }

  const productPath = `/product/${slug}`
  const productSeo = product
    ? {
        title: `${product.name} | MQ Adorn`,
        description: truncateMeta(
          product.description || `Shop ${product.name} at MQ Adorn, jewellery and dresses online in Pakistan.`,
        ),
        image: product.images?.[0],
        jsonLd: productJsonLd(product, {
          price: unitPrice,
          reviews,
          rating,
          image: product.images?.[0],
          url: `https://mqadorn.vercel.app${productPath}`,
        }),
      }
    : null

  if (status === 'loading') {
    return (
      <>
        <Seo title="MQ Adorn" description="Loading this piece from MQ Adorn." path={productPath} />
        <ProductSkeleton />
      </>
    )
  }

  if (status === 'notfound') {
    return (
      <section className="container-page py-20 sm:py-28">
        <Seo title="Product not found | MQ Adorn" description="This piece may have been removed from MQ Adorn." path={productPath} noindex />
        <div className="mx-auto max-w-2xl border border-gold/30 bg-card px-6 py-14 text-center sm:px-12">
          <p className="text-xs font-medium tracking-[0.3em] text-gold uppercase">404</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">Product not found</h1>
          <p className="mt-4 text-sm text-muted">This piece may have been removed, or the link may be incorrect.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-primary">
              Browse the shop
            </Link>
            <Link to="/" className="btn-outline">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="container-page py-20 sm:py-28">
        <Seo title="MQ Adorn" description="We could not load this product just now." path={productPath} noindex />
        <div className="mx-auto max-w-2xl border border-black/5 bg-card px-6 py-14 text-center sm:px-12">
          <h1 className="font-heading text-3xl font-semibold">The shop is warming up</h1>
          <p className="mt-3 text-sm text-muted">We could not load this product just now. Please try again in a moment.</p>
          <button type="button" className="btn-primary mt-6" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="bg-cream">
      <Seo
        title={productSeo.title}
        description={productSeo.description}
        path={productPath}
        type="product"
        image={productSeo.image}
        imageAlt={product.name}
        price={unitPrice}
        jsonLd={productSeo.jsonLd}
      />
      <div className="container-page py-6 sm:py-8 lg:py-12">
        <Breadcrumbs product={product} />

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <ProductGallery
            images={product.images}
            name={product.name}
            badge={pricing.badge}
          />

          <div>
            {product.category && (
              <p className="text-[11px] font-medium tracking-[0.22em] text-gold uppercase">{product.category.name}</p>
            )}
            <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-lg">
              {comparePrice ? (
                <>
                  <span className="font-medium text-sale">{formatRs(unitPrice)}</span>{' '}
                  <s className="text-base text-muted">{formatRs(comparePrice)}</s>
                  {pricing.isDeal && (
                    <span className="ml-2 align-middle rounded-sm bg-sale px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">Deal</span>
                  )}
                </>
              ) : (
                <span className="font-medium">{formatRs(unitPrice)}</span>
              )}
            </p>
            <p className={`mt-2 text-sm ${inStock ? (stock <= 3 ? 'text-sale' : 'text-success') : 'text-sale'}`}>
              {inStock ? (stock <= 3 ? `Only ${stock} left` : 'In stock') : 'Out of stock'}
            </p>

            {colors.length > 0 && (
              <fieldset className="mt-7">
                <legend className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">
                  Colour{color ? ` — ${color}` : ''}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((value) => {
                    const selected = color === value
                    const hex = colorHex(value)
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        className={`inline-flex items-center gap-2 border px-3 py-2 text-sm transition ${
                          selected ? 'border-gold bg-blush/70' : 'border-black/15 bg-white hover:border-gold'
                        }`}
                        onClick={() => {
                          setColor(value)
                          const nextSizes = uniqueValues(
                            (product.variants || []).filter((item) => item.color === value),
                            'size',
                          )
                          if (nextSizes.length && !nextSizes.includes(size)) setSize(nextSizes[0])
                        }}
                      >
                        {hex && (
                          <span
                            className="h-3.5 w-3.5 border border-black/15"
                            style={{ backgroundColor: hex }}
                            aria-hidden="true"
                          />
                        )}
                        {value}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-6">
                <legend className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">Size</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((value) => {
                    const selected = size === value
                    const option = findVariant(product.variants, color, value)
                    const disabled = option && Number(option.stock) <= 0
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        disabled={disabled}
                        className={`min-w-11 border px-3 py-2 text-sm transition ${
                          selected ? 'border-gold bg-gold text-white' : 'border-black/15 bg-white hover:border-gold'
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                        onClick={() => setSize(value)}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center border border-black/15 bg-white" role="group" aria-label="Quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="px-3 py-3 text-primary disabled:opacity-40"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <MinusIcon width={16} height={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, stock)}
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    if (!Number.isFinite(next)) return
                    setQuantity(Math.min(Math.max(1, next), Math.max(1, stock)))
                  }}
                  className="w-12 border-x border-black/10 bg-transparent py-2 text-center text-sm outline-none"
                  aria-label="Quantity"
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="px-3 py-3 text-primary disabled:opacity-40"
                  disabled={!inStock || quantity >= stock}
                  onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
                >
                  <PlusIcon width={16} height={16} />
                </button>
              </div>
              <button type="button" className="btn-primary min-w-48 flex-1" disabled={!inStock} onClick={add}>
                <BagIcon width={16} height={16} />
                {added ? 'Added to cart' : inStock ? 'Add to Cart' : 'Out of stock'}
              </button>
              <button
                type="button"
                aria-label={loved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                aria-pressed={loved}
                className={`flex h-12 w-12 items-center justify-center border border-black/15 bg-white transition hover:border-gold ${
                  loved ? 'text-sale' : 'text-primary'
                }`}
                onClick={() => toggleWishlist(product)}
              >
                <HeartIcon />
              </button>
            </div>

            {added && (
              <p className="mt-3 text-sm text-success">
                Added to your bag.{' '}
                <Link to="/cart" className="underline decoration-gold underline-offset-2 hover:text-gold">
                  View cart
                </Link>
              </p>
            )}

            <a
              href={whatsappHref({ name: product.name, url: productUrl })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-3 w-full"
            >
              <>
                <WhatsAppIcon width={18} height={18} /> Chat on WhatsApp
                <span className="hidden sm:inline"> · {WHATSAPP_DISPLAY}</span>
              </>
            </a>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              WhatsApp {WHATSAPP_DISPLAY}. Opens a free chat with this product name and link already filled in.
              Payment is by JazzCash, Easypaisa or bank transfer only — no cash on delivery.
            </p>

            <div className="mt-8">
              <InfoTabs product={product} />
            </div>
          </div>
        </div>

        <section className="mt-16 border-t border-black/10 pt-10" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="font-heading text-2xl font-medium sm:text-3xl">
            Reviews
          </h2>
          {rating.count > 0 && (
            <p className="mt-2 text-sm text-muted">
              Average {rating.average} / 5 from {rating.count} {rating.count === 1 ? 'review' : 'reviews'}
            </p>
          )}
          {reviews.length === 0 ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              There are no public reviews for this piece yet. Reviews appear here after an order is delivered and the
              review is approved.
            </p>
          ) : (
            <ul className="mt-6 max-w-2xl space-y-5">
              {reviews.map((review, index) => (
                <li key={`${review.customer_name}-${index}`} className="border-b border-black/5 pb-5">
                  <p className="text-sm font-medium">
                    {review.customer_name} <span className="font-normal text-muted">· {review.rating} / 5</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{review.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {related.length > 0 && (
          <Reveal as="section" className="mt-14" aria-labelledby="related-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="related-heading" className="font-heading text-2xl font-medium sm:text-3xl">
                You may also like
              </h2>
              <Link
                to={shopPath({ category: product.type === 'dress' ? 'dresses' : 'jewellery', sub: product.category?.slug })}
                className="text-sm font-medium hover:text-gold"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((item, index) => (
                <Reveal key={item.id || item.slug} delay={index * 70}>
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}
