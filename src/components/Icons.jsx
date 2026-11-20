// Lightweight inline SVG icons (stroke style).
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const UserIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
)
export const HeartIcon = (p) => (
  <svg {...base} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
)
export const BagIcon = (p) => (
  <svg {...base} {...p}><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
)
export const MenuIcon = (p) => (
  <svg {...base} {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
)
export const CloseIcon = (p) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const SparkleIcon = (p) => (
  <svg {...base} {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
)
export const ChevronDownIcon = (p) => (
  <svg {...base} width={14} height={14} {...p}><path d="M6 9l6 6 6-6" /></svg>
)
export const ChevronLeftIcon = (p) => (
  <svg {...base} {...p}><path d="M15 6l-6 6 6 6" /></svg>
)
export const ChevronRightIcon = (p) => (
  <svg {...base} {...p}><path d="M9 6l6 6-6 6" /></svg>
)
export const InstagramIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
  </svg>
)
export const TikTokIcon = (p) => (
  <svg {...base} width={18} height={18} fill="currentColor" stroke="none" {...p}>
    <path d="M14.6 4.2A4.4 4.4 0 0 1 12.7 2H10.2v11.2a2.15 2.15 0 1 1-1.85-2.13v-2.6a4.75 4.75 0 1 0 4.15 4.73V8.15a6.8 6.8 0 0 0 3.9 1.23V6.7a4.4 4.4 0 0 1-1.8-.5z" />
  </svg>
)

export const ArrowRightIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}><path d="M5 12h12M13 6l6 6-6 6" /></svg>
)
export const TruckIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
)
export const FilterIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
)
export const Grid2Icon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <rect x="3" y="3" width="7" height="18" />
    <rect x="14" y="3" width="7" height="18" />
  </svg>
)
export const Grid3Icon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <rect x="3" y="3" width="5" height="18" />
    <rect x="9.5" y="3" width="5" height="18" />
    <rect x="16" y="3" width="5" height="18" />
  </svg>
)
export const Grid4Icon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <rect x="3" y="3" width="3.5" height="18" />
    <rect x="8.2" y="3" width="3.5" height="18" />
    <rect x="13.3" y="3" width="3.5" height="18" />
    <rect x="18.5" y="3" width="3.5" height="18" />
  </svg>
)
export const SpinnerIcon = (p) => (
  <svg {...base} className={`animate-spin ${p.className || ''}`} width={p.width || 20} height={p.height || 20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const WhatsAppIcon = (p) => (
  <svg {...base} fill="currentColor" stroke="none" viewBox="0 0 24 24" {...p}>
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.5 2 2 6.48 2 12c0 1.77.47 3.5 1.36 5.01L2 22l5.13-1.33A10 10 0 0 0 12.04 22c5.54 0 10.04-4.48 10.04-10 0-2.67-1.05-5.18-2.99-7.09zM12.04 20.15a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.04.8.81-2.96-.2-.3A8.13 8.13 0 0 1 3.89 12c0-4.5 3.66-8.15 8.15-8.15 2.18 0 4.22.85 5.76 2.39a8.1 8.1 0 0 1 2.39 5.76c0 4.5-3.66 8.15-8.15 8.15zm4.47-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.29.18-.53.06-.24-.12-1.02-.37-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28z" />
  </svg>
)
export const MinusIcon = (p) => (
  <svg {...base} {...p}><path d="M5 12h14" /></svg>
)
export const PlusIcon = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const ZoomIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
  </svg>
)
