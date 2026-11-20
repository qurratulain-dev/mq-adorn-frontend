import { Link } from 'react-router-dom'

// Dummy wordmark logo — replace with the real brand logo later.
export default function Logo({ light = false, className = '' }) {
  const text = light ? 'text-white' : 'text-primary'
  return (
    <Link to="/" aria-label="MQ Adorn home" className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 48 48" className="hidden h-9 w-9 shrink-0 sm:block sm:h-10 sm:w-10" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="18" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.6" />
        <path d="M24 6.5l1.6 3.2L24 12.5l-1.6-2.8z" fill="#D4AF37" />
        <text x="24" y="30" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="15" fontWeight="600" fill="#D4AF37">
          MQ
        </text>
      </svg>
      <span className={`whitespace-nowrap font-heading text-[1.55rem] leading-none font-semibold tracking-wide sm:text-[1.85rem] ${text}`}>
        MQ <span className={light ? 'text-white' : 'text-gold'}>Adorn</span>
      </span>
    </Link>
  )
}
