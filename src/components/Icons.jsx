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
