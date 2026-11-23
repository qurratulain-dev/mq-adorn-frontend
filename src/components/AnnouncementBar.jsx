import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentDeal } from '../api/client.js'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import {
  DEFAULT_ANNOUNCEMENT_LINES,
  interpolateAnnouncement,
  announcementTo,
  resolveAnnouncementHref,
} from '../lib/announcements.js'
import { SOCIAL_LINKS } from './navLinks.js'
import { InstagramIcon, TikTokIcon } from './Icons.jsx'

const ICONS = {
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
}

const HOLD_MS = 3500
const SLIDE_MS = 450

function AnnouncementMessage({ line, className, style }) {
  const href = resolveAnnouncementHref(line.href)
  const to = announcementTo(line.href)
  const classes = `absolute inset-0 flex items-center justify-center px-2 ${className}`
  const text = <span className="block max-w-full truncate">{line.text}</span>

  if (to && typeof to === 'object') {
    return (
      <Link to={to} className={`${classes} transition hover:text-gold`} style={style}>
        {text}
      </Link>
    )
  }
  if (href && (href.startsWith('http') || href.startsWith('mailto:'))) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${classes} transition hover:text-gold`} style={style}>
        {text}
      </a>
    )
  }
  if (href && href.startsWith('/')) {
    return (
      <Link to={href} className={`${classes} transition hover:text-gold`} style={style}>
        {text}
      </Link>
    )
  }
  return (
    <p className={classes} style={style}>
      {text}
    </p>
  )
}

export default function AnnouncementBar() {
  const { freeShippingThreshold, whatsappDisplay, announcementLines } = useStoreSettings()
  const [dealLive, setDealLive] = useState(false)
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getCurrentDeal({ signal: controller.signal })
      .then((payload) => {
        const deal = payload?.data
        const ends = deal?.ends_at ? new Date(deal.ends_at).getTime() : 0
        setDealLive(Boolean(deal) && Array.isArray(deal.products) && deal.products.length > 0 && ends > Date.now())
      })
      .catch(() => setDealLive(false))
    return () => controller.abort()
  }, [])

  const messages = useMemo(() => {
    const source = Array.isArray(announcementLines) && announcementLines.length
      ? announcementLines
      : DEFAULT_ANNOUNCEMENT_LINES
    return source
      .map((line) => ({
        text: interpolateAnnouncement(line.text, { freeShippingThreshold, whatsappDisplay }),
        href: line.href || null,
        show_if_deal: Boolean(line.show_if_deal),
      }))
      .filter((line) => line.text && (!line.show_if_deal || dealLive))
  }, [announcementLines, freeShippingThreshold, whatsappDisplay, dealLive])

  useEffect(() => {
    if (index >= messages.length) setIndex(0)
  }, [index, messages.length])

  useEffect(() => {
    if (paused || leaving || messages.length < 2) return undefined
    const hold = window.setTimeout(() => {
      if (reduced) {
        setIndex((current) => (current + 1) % messages.length)
        return
      }
      setLeaving(true)
    }, HOLD_MS)
    return () => window.clearTimeout(hold)
  }, [index, paused, leaving, messages.length, reduced])

  useEffect(() => {
    if (!leaving) return undefined
    const slide = window.setTimeout(() => {
      setIndex((current) => (current + 1) % Math.max(messages.length, 1))
      setLeaving(false)
    }, SLIDE_MS)
    return () => window.clearTimeout(slide)
  }, [leaving, messages.length])

  const current = messages[index] || null
  const next = messages.length > 1 ? messages[(index + 1) % messages.length] : null
  const slideClass = reduced
    ? ''
    : 'motion-safe:transition-transform motion-safe:duration-[450ms] motion-safe:ease-in-out'

  return (
    <div
      className="bg-primary text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-page relative flex h-10 items-center sm:h-11">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 sm:px-36">
          {current && (
            <div className="pointer-events-auto relative h-5 w-full max-w-xl overflow-hidden text-center text-[11px] leading-5 sm:h-6 sm:text-xs sm:leading-6" aria-live="polite">
              <AnnouncementMessage
                line={current}
                className={`${slideClass} ${leaving && !reduced ? '-translate-y-full' : 'translate-y-0'}`}
              />
              {next && !reduced && (
                <AnnouncementMessage
                  line={next}
                  className={`${slideClass} ${leaving ? 'translate-y-0' : 'translate-y-full'}`}
                  style={{ visibility: leaving ? 'visible' : 'hidden' }}
                />
              )}
            </div>
          )}
        </div>

        <div className="relative z-10 ml-auto hidden shrink-0 items-center gap-3 sm:flex sm:gap-4">
          <nav className="flex items-center gap-2 text-[11px] text-white/85 sm:text-xs" aria-label="Quick links">
            <Link to="/account" className="transition hover:text-gold">
              Track Order
            </Link>
            <span className="text-white/40" aria-hidden="true">
              |
            </span>
            <Link to="/faqs" className="transition hover:text-gold">
              FAQs
            </Link>
          </nav>
          <nav className="flex items-center gap-2" aria-label="Social media">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => {
              const Svg = ICONS[Icon]
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`MQ Adorn on ${label}`}
                  className="text-white/85 transition hover:text-gold"
                >
                  <Svg width={15} height={15} />
                </a>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
