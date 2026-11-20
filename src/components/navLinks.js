export const SOCIAL_LINKS = [
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@mqadorn.pk?lang=en',
    Icon: 'tiktok',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/mqadorn.pk/',
    Icon: 'instagram',
  },
]

// Jewellery subs match the backend catalog seeder, plus Anklets (planned).
export const JEWELLERY_LINKS = [
  { label: 'All Jewellery', to: '/shop?category=jewellery' },
  { label: 'Earrings', to: '/shop?category=jewellery&sub=earrings' },
  { label: 'Necklaces', to: '/shop?category=jewellery&sub=necklaces' },
  { label: 'Rings', to: '/shop?category=jewellery&sub=rings' },
  { label: 'Bracelets', to: '/shop?category=jewellery&sub=bracelets' },
  { label: 'Bangles', to: '/shop?category=jewellery&sub=bangles' },
  { label: 'Jewellery Sets', to: '/shop?category=jewellery&sub=jewellery-sets' },
  { label: 'Anklets', to: '/shop?category=jewellery&sub=anklets' },
  { label: 'Gifts', to: '/shop?category=jewellery&sub=gifts' },
]

// Dress type is a single category in the seeder; these subs will be used by the Shop page.
export const DRESSES_LINKS = [
  { label: 'All Dresses', to: '/shop?category=dresses' },
  { label: 'Stitched', to: '/shop?category=dresses&sub=stitched' },
  { label: 'Unstitched', to: '/shop?category=dresses&sub=unstitched' },
  { label: 'Formal', to: '/shop?category=dresses&sub=formal' },
  { label: 'Casual', to: '/shop?category=dresses&sub=casual' },
]

export const NAV_LINKS = [
  { label: 'New In', to: '/shop?sort=new' },
  { label: 'Jewellery', to: '/shop?category=jewellery', children: JEWELLERY_LINKS },
  { label: 'Dresses', to: '/shop?category=dresses', children: DRESSES_LINKS },
  { label: 'Collections', to: '/shop?view=collections' },
  { label: 'Gifts', to: '/shop?category=gifts' },
  { label: 'Sale', to: '/shop?sale=1', highlight: true },
]
