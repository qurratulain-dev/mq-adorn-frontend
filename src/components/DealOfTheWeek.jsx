import { useEffect, useMemo, useState } from 'react'
import { getCurrentDeal } from '../api/client.js'
import ProductCard, { ProductCardSkeleton } from './ProductCard.jsx'
import Reveal from './Reveal.jsx'

function remainingParts(endsAt) {
  const end = new Date(endsAt).getTime()
  const diff = Math.max(0, end - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    expired: totalSeconds <= 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function Countdown({ endsAt, onExpire }) {
  const [parts, setParts] = useState(() => remainingParts(endsAt))

  useEffect(() => {
    setParts(remainingParts(endsAt))
    const timer = window.setInterval(() => {
      const next = remainingParts(endsAt)
      setParts(next)
      if (next.expired) {
        window.clearInterval(timer)
        onExpire?.()
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [endsAt, onExpire])

  const units = [
    { label: 'Days', value: parts.days },
    { label: 'Hrs', value: parts.hours },
    { label: 'Min', value: parts.minutes },
    { label: 'Sec', value: parts.seconds },
  ]

  return (
    <div className="mt-6 flex justify-center gap-2 sm:gap-3" aria-live="polite" aria-label="Time remaining">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex w-16 flex-col items-center border border-gold/35 bg-cream px-2 py-3 shadow-[0_10px_28px_-18px_rgba(26,26,26,0.45)] sm:w-[4.75rem]"
        >
          <span className="font-heading text-2xl font-medium tabular-nums text-primary sm:text-3xl">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="mt-1 text-[10px] tracking-[0.16em] text-muted uppercase">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function DealOfTheWeek() {
  const [deal, setDeal] = useState(null)
  const [status, setStatus] = useState('loading')

  const load = () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60000)
    getCurrentDeal({ signal: controller.signal })
      .then((payload) => {
        const current = payload?.data || null
        const products = Array.isArray(current?.products) ? current.products : []
        if (!current || !products.length) {
          setDeal(null)
          setStatus('empty')
          return
        }
        setDeal({ ...current, products })
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }

  useEffect(() => load(), [])

  const gridClass = useMemo(() => {
    const count = deal?.products?.length || 0
    if (count >= 4) return 'grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4'
    if (count === 3) return 'grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3'
    return 'grid-cols-2 gap-3 sm:gap-5'
  }, [deal])

  if (status === 'error' || status === 'empty' || (status === 'ready' && !deal)) {
    return null
  }

  return (
    <Reveal as="section" id="deal-of-the-week" className="relative scroll-mt-28 overflow-hidden bg-card" aria-labelledby="deal-of-the-week-heading">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.14),transparent_58%)]" aria-hidden="true" />
      <div className="container-page relative py-12 sm:py-16">
        {status === 'loading' && (
          <>
            <div className="mx-auto h-4 w-28 animate-pulse bg-cream" />
            <div className="mx-auto mt-4 h-10 w-72 animate-pulse bg-cream" />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {status === 'ready' && deal && (
          <>
            <div className="text-center">
              <p className="text-[11px] font-medium tracking-[0.28em] text-gold uppercase">Limited time</p>
              <h2 id="deal-of-the-week-heading" className="mt-3 font-heading text-3xl font-medium sm:text-5xl">
                🔥 Deal of the Week 🔥
              </h2>
              {deal.title && deal.title !== 'Deal of the Week' && (
                <p className="mt-2 text-sm text-muted">{deal.title}</p>
              )}
              <div className="mx-auto mt-4 h-px w-16 bg-gold/60" />
              <p className="mt-3 text-sm text-muted">Hurry — this offer ends in</p>
              <Countdown endsAt={deal.ends_at} onExpire={() => setStatus('empty')} />
            </div>

            <div className={`mt-10 grid ${gridClass}`}>
              {deal.products.map((product, index) => (
                <Reveal key={product.id || product.slug} delay={index * 70}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </Reveal>
  )
}
