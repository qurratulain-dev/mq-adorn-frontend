import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx'

// Dummy royalty-free Unsplash photos — replace with real MQ Adorn product pictures later.
const SLIDES = [
  {
    src: '/heroes/jewellery-set.jpg',
    alt: 'Traditional gold necklace and earrings set',
    position: 'center',
  },
  {
    src: '/heroes/necklaces.jpg',
    alt: 'Layered gold pendant necklaces',
    position: 'center',
  },
  {
    src: '/heroes/ring.jpg',
    alt: 'Diamond halo ring on a dark box',
    position: 'center',
  },
]

const INTERVAL = 5500

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return undefined
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, INTERVAL)
    return () => window.clearInterval(id)
  }, [paused])

  const go = (next) => setIndex((next + SLIDES.length) % SLIDES.length)

  return (
    <section
      className="relative isolate h-[70vh] min-h-[28rem] overflow-hidden bg-primary sm:h-[78vh] sm:min-h-[32rem] lg:max-h-[46rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={i === index ? slide.alt : ''}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: slide.position }}
          aria-hidden={i !== index}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      <div className="container-page relative z-10 flex h-full flex-col justify-center text-white">
        <p className="text-[11px] font-medium tracking-[0.35em] text-gold uppercase sm:text-xs">
          Jewellery &amp; Dresses
        </p>
        <h1 className="mt-4 max-w-xl font-heading text-4xl leading-tight font-semibold sm:text-5xl lg:text-7xl">
          Elegance in Every Detail
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
          Timeless jewellery and graceful dresses, crafted to make every moment shine. Delivered across Pakistan.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/shop?category=jewellery"
            className="inline-flex items-center justify-center bg-gold px-7 py-3 text-sm font-medium tracking-wide text-primary uppercase transition hover:bg-white"
          >
            Shop Jewellery
          </Link>
          <Link
            to="/shop?category=dresses"
            className="inline-flex items-center justify-center border border-white px-7 py-3 text-sm font-medium tracking-wide text-white uppercase transition hover:bg-white hover:text-primary"
          >
            Explore Dresses
          </Link>
        </div>
      </div>

      <div className="absolute right-4 bottom-5 left-4 z-10 flex items-center justify-between sm:right-8 sm:bottom-7 sm:left-8">
        <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-7 bg-gold' : 'w-2 bg-white/50 hover:bg-white'
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center border border-white/40 text-white transition hover:border-gold hover:text-gold"
            onClick={() => go(index - 1)}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center border border-white/40 text-white transition hover:border-gold hover:text-gold"
            onClick={() => go(index + 1)}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
