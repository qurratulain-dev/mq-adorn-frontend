import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTestimonials } from '../api/client.js'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx'
import Reveal from './Reveal.jsx'

function Stars({ rating }) {
  return (
    <p className="text-lg tracking-widest text-gold" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? 'text-gold' : 'text-black/15'}>
          ★
        </span>
      ))}
    </p>
  )
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

export default function Testimonials() {
  const [items, setItems] = useState(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()
  const touchX = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    getTestimonials({ signal: controller.signal })
      .then((payload) => setItems(Array.isArray(payload?.data) ? payload.data : []))
      .catch(() => setItems([]))
    return () => controller.abort()
  }, [])

  const count = items?.length || 0
  const go = useCallback((step) => {
    if (!count) return
    setIndex((current) => (current + step + count) % count)
  }, [count])

  useEffect(() => {
    if (count <= 1 || paused || reduced) return undefined
    const timer = setInterval(() => go(1), 5500)
    return () => clearInterval(timer)
  }, [count, paused, reduced, go])

  if (!items || items.length === 0) return null

  return (
    <Reveal
      as="section"
      className="bg-blush/50"
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-page py-10 sm:py-14">
        <p className="text-xs tracking-[0.22em] text-muted uppercase">Testimonials</p>
        <h2 id="testimonials-heading" className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
          What Our Customers Say
        </h2>

        <div
          className="relative mt-8"
          onTouchStart={(event) => { touchX.current = event.touches[0].clientX }}
          onTouchEnd={(event) => {
            const delta = event.changedTouches[0].clientX - touchX.current
            if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1)
          }}
        >
          <div className="overflow-hidden">
            <div
              className={`flex ${reduced ? '' : 'transition-transform duration-500 ease-out'}`}
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((item) => (
                <article key={item.id} className="w-full shrink-0 px-1" aria-hidden={item !== items[index]}>
                  <div className="mx-auto max-w-2xl border border-black/5 bg-card px-6 py-8 text-center sm:px-10">
                    <Stars rating={item.rating} />
                    <p className="mt-4 font-heading text-xl leading-relaxed sm:text-2xl">“{item.comment}”</p>
                    <p className="mt-6 text-sm font-medium">{item.customer_name}</p>
                    {item.product?.slug ? (
                      <Link to={`/product/${item.product.slug}`} className="mt-1 inline-block text-sm text-muted hover:text-gold">
                        {item.product.name}
                      </Link>
                    ) : item.product?.name ? (
                      <p className="mt-1 text-sm text-muted">{item.product.name}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous testimonial"
                className="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-black/10 bg-white/90 text-primary hover:border-gold hover:text-gold sm:-left-2"
                onClick={() => go(-1)}
              >
                <ChevronLeftIcon width={18} height={18} />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                className="absolute top-1/2 right-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-black/10 bg-white/90 text-primary hover:border-gold hover:text-gold sm:-right-2"
                onClick={() => go(1)}
              >
                <ChevronRightIcon width={18} height={18} />
              </button>
              <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Testimonials">
                {items.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-label={`Show testimonial ${itemIndex + 1}`}
                    aria-selected={itemIndex === index}
                    className={`h-2.5 w-2.5 rounded-full ${itemIndex === index ? 'bg-gold' : 'bg-black/20'}`}
                    onClick={() => setIndex(itemIndex)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Reveal>
  )
}
