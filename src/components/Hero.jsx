import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx'

// The same hero photograph is used on all three slides until real campaign photos arrive.
const SLIDE_SRC = '/heroes/hero.jpg'
const SLIDES = [
  { src: SLIDE_SRC, alt: 'Gold necklace, earrings and ring on blush satin' },
  { src: `${SLIDE_SRC}?slide=2`, alt: 'Gold necklace, earrings and ring on blush satin' },
  { src: `${SLIDE_SRC}?slide=3`, alt: 'Gold necklace, earrings and ring on blush satin' },
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
      className="relative isolate overflow-hidden bg-blush"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="relative h-[26rem] sm:h-[28rem] md:h-auto md:aspect-[1983/793] lg:min-h-[28rem] lg:max-h-[36rem]">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={SLIDE_SRC}
            alt={i === index ? slide.alt : ''}
            className={`absolute inset-0 h-full w-full object-cover object-[84%_center] md:object-center transition-opacity duration-700 ease-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== index}
          />
        ))}

        {/* Soft wash so the dark headline stays readable on mobile, where the jewellery is framed on the right. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8E8E6]/95 via-[#F8E8E6]/70 to-transparent md:from-[#F8E8E6]/25 md:via-transparent md:to-transparent" />

        <div
          key={index}
          className="hero-copy container-page relative z-10 flex h-full flex-col justify-center py-10 text-primary"
        >
          <p className="text-[11px] font-medium tracking-[0.32em] text-gold uppercase sm:text-xs">
            Jewellery & Dresses
          </p>
          <h1 className="mt-3 max-w-lg font-heading text-4xl leading-[1.15] font-medium sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
            Elegance in Every Detail
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-[15px]">
            Timeless jewellery and graceful dresses, crafted to make every moment shine. Delivered across Pakistan.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/shop?category=jewellery" className="btn-primary px-7">
              Shop Jewellery <ArrowRightIcon />
            </Link>
            <Link to="/shop?category=dresses" className="btn-outline px-7">
              Explore Dresses
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 bottom-4 left-4 z-10 flex items-end justify-between sm:right-8 sm:bottom-6 sm:left-8">
        <div className="pointer-events-auto flex items-center gap-2" role="tablist" aria-label="Hero slides">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-7 bg-gold' : 'w-2 bg-primary/25 hover:bg-primary/50'
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="pointer-events-auto hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center border border-primary/20 bg-white/70 text-primary backdrop-blur-sm transition hover:border-gold hover:text-gold"
            onClick={() => go(index - 1)}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center border border-primary/20 bg-white/70 text-primary backdrop-blur-sm transition hover:border-gold hover:text-gold"
            onClick={() => go(index + 1)}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
