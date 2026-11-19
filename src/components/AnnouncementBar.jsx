import { SOCIAL_LINKS } from './navLinks.js'
import { InstagramIcon, TikTokIcon } from './Icons.jsx'

const ICONS = {
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
}

export default function AnnouncementBar() {
  return (
    <div className="bg-primary text-white">
      <div className="container-page grid grid-cols-[1fr_auto] items-center gap-3 py-2 sm:grid-cols-3">
        <p className="min-w-0 text-[10px] leading-tight tracking-[0.12em] uppercase sm:col-start-2 sm:text-center sm:text-[11px] sm:leading-normal sm:tracking-[0.2em] sm:whitespace-nowrap md:text-xs">
          <span className="text-gold">✦</span> Free Shipping on Orders Above Rs. 5,000{' '}
          <span className="text-gold">✦</span>
        </p>
        <nav className="flex items-center justify-end gap-2.5 sm:col-start-3" aria-label="Social media">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => {
            const Svg = ICONS[Icon]
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`MQ Adorn on ${label}`}
                className="p-0.5 text-white/80 transition hover:text-gold"
              >
                <Svg />
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
