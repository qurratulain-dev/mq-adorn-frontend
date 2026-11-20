import { Link } from 'react-router-dom'

// Dummy wordmark logo — replace with the real brand logo later.
// Below lg: the original monogram + wordmark + tagline.
// At lg and up: the compact reference-rebuild wordmark (no tagline).
function Monogram() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.6" />
      <path d="M24 6.5l1.6 3.2L24 12.5l-1.6-2.8z" fill="#D4AF37" />
      <text x="24" y="30" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="15" fontWeight="600" fill="#D4AF37">
        MQ
      </text>
    </svg>
  )
}

export default function Logo({ light = false, className = '' }) {
  const text = light ? 'text-white' : 'text-primary'
  return (
    <>
      <Link to="/" aria-label="MQ Adorn home" className={`inline-flex items-center gap-2.5 lg:hidden ${className}`}>
        <Monogram />
        <span className="flex flex-col leading-none">
          <span className={`font-heading text-2xl font-semibold tracking-wide ${text}`}>
            MQ <span className="text-gold">Adorn</span>
          </span>
          <span
            className={`mt-1 hidden whitespace-nowrap text-[9px] tracking-[0.35em] uppercase sm:block ${
              light ? 'text-white/60' : 'text-muted'
            }`}
          >
            Jewellery & Dresses
          </span>
        </span>
      </Link>
      <Link to="/" aria-label="MQ Adorn home" className={`hidden items-center gap-2 lg:inline-flex ${className}`}>
        <Monogram />
        <span className={`whitespace-nowrap font-heading text-[1.85rem] leading-none font-semibold tracking-wide ${text}`}>
          MQ <span className={light ? 'text-white' : 'text-gold'}>Adorn</span>
        </span>
      </Link>
    </>
  )
}
