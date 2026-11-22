import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTestimonials } from '../api/client.js'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx'
import Reveal from './Reveal.jsx'

function Stars({ rating }) {
  return (
    <p className="shrink-0 text-[14px] leading-none tracking-wide text-gold" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? 'text-gold' : 'text-black/15'}>
          ★
        </span>
      ))}
    </p>
  )
}

function initials(name) {
  const parts = String(name || '')
    .replace(/\./g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'C'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

function useVisibleCount() {
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setVisible(3)
      else if (window.innerWidth >= 768) setVisible(2)
      else setVisible(1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return visible
}

function TestimonialCard({ item }) {
  return (
    <article className="flex h-full gap-4 rounded-lg bg-white px-6 py-4 shadow-[0_0_10px_rgba(0,0,0,0.15)]">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center self-center rounded-full bg-blush font-heading text-xl text-gold"
        aria-hidden="true"
      >
        {initials(item.customer_name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Stars rating={item.rating} />
          <p className="truncate text-sm font-bold leading-[17px]">{item.customer_name}</p>
        </div>
        {item.comment ? (
          <p className="mt-2 line-clamp-3 text-sm leading-[21px] font-normal text-primary">{item.comment}</p>
        ) : null}
        {item.product?.name ? (
          <p className="mt-2 truncate text-[13px]">
            <span className="text-muted">Review for </span>
            {item.product.slug ? (
              <Link to={`/product/${item.product.slug}`} className="text-primary hover:text-gold">
                {item.product.name}
              </Link>
            ) : (
              <span>{item.product.name}</span>
            )}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export default function Testimonials() {
  const [items, setItems] = useState(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()
  const visible = useVisibleCount()
  const touchX = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    getTestimonials({ signal: controller.signal })
      .then((payload) => setItems(Array.isArray(payload?.data) ? payload.data : []))
      .catch(() => setItems([]))
    return () => controller.abort()
  }, [])

  const count = items?.length || 0
  const canSlide = count > visible
  const maxIndex = Math.max(0, count - visible)

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex))
  }, [maxIndex])

  const go = useCallback((step) => {
    if (!canSlide) return
    setIndex((current) => {
      const next = current + step
      if (next < 0) return maxIndex
      if (next > maxIndex) return 0
      return next
    })
  }, [canSlide, maxIndex])

  useEffect(() => {
    if (!canSlide || paused || reduced) return undefined
    const timer = setInterval(() => go(1), 5000)
    return () => clearInterval(timer)
  }, [canSlide, paused, reduced, go])

  if (!items || items.length === 0) return null

  const slidePercent = 100 / visible

  return (
    <Reveal
      as="section"
      className="bg-white"
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-page py-12 sm:py-16">
        <div className="text-center">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Testimonials</p>
          <h2 id="testimonials-heading" className="mt-2 font-heading text-[28px] font-normal sm:text-[34px]">
            What Our Customers Say
          </h2>
        </div>

        <div
          className="relative mt-8 px-8 sm:px-10"
          onTouchStart={(event) => { touchX.current = event.touches[0].clientX }}
          onTouchEnd={(event) => {
            const delta = event.changedTouches[0].clientX - touchX.current
            if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1)
          }}
        >
          <div className="overflow-hidden">
            <div
              className={`flex items-stretch ${reduced ? '' : 'transition-transform duration-500 ease-out'}`}
              style={{
                transform: `translateX(-${index * slidePercent}%)`,
                justifyContent: canSlide || count >= visible ? undefined : 'center',
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 px-2.5"
                  style={{ width: `${slidePercent}%`, maxWidth: count < visible ? `${slidePercent}%` : undefined }}
                  aria-hidden={false}
                >
                  <TestimonialCard item={item} />
                </div>
              ))}
            </div>
          </div>

          {canSlide && (
            <>
              <button
                type="button"
                aria-label="Previous testimonials"
                className="absolute top-1/2 left-0 z-10 flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_0_10px_rgba(0,0,0,0.15)] hover:text-gold"
                onClick={() => go(-1)}
              >
                <ChevronLeftIcon width={14} height={14} />
              </button>
              <button
                type="button"
                aria-label="Next testimonials"
                className="absolute top-1/2 right-0 z-10 flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_0_10px_rgba(0,0,0,0.15)] hover:text-gold"
                onClick={() => go(1)}
              >
                <ChevronRightIcon width={14} height={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </Reveal>
  )
}
