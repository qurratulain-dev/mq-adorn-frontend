import { Link } from 'react-router-dom'
import { SOCIAL_LINKS } from './navLinks.js'
import { InstagramIcon, TikTokIcon, TruckIcon } from './Icons.jsx'
import { FREE_SHIPPING_THRESHOLD } from '../config/shipping.js'
import { formatRs } from '../lib/format.js'

const ICONS = {
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
}

export default function AnnouncementBar() {
  return (
    <div className="bg-primary text-white">
      <div className="container-page flex items-center justify-between gap-3 py-1.5 text-[11px] sm:text-xs">
        <p className="flex min-w-0 items-center gap-2 leading-tight">
          <TruckIcon className="hidden shrink-0 text-gold sm:block" width={15} height={15} />
          <span className="truncate">Free Shipping on Orders Above {formatRs(FREE_SHIPPING_THRESHOLD)}</span>
        </p>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <nav className="hidden items-center gap-2 text-white/85 sm:flex" aria-label="Quick links">
            <Link to="/track-order" className="transition hover:text-gold">
              Track Order
            </Link>
            <span className="text-white/40" aria-hidden="true">
              |
            </span>
            <Link to="/faqs" className="transition hover:text-gold">
              Help Center
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
