export const OCCASIONS = [
  {
    slug: 'bridal',
    name: 'Bridal',
    blurb: 'Jewellery and formal looks for your most important day.',
    image: '/occasions/bridal.jpg',
  },
  {
    slug: 'party-wear',
    name: 'Party Wear',
    blurb: 'Statement pieces made to shine at every celebration.',
    image: '/occasions/party-wear.jpg',
  },
  {
    slug: 'daily-wear',
    name: 'Daily Wear',
    blurb: 'Easy, elegant pieces for every day of the week.',
    image: '/occasions/daily-wear.jpg',
  },
  {
    slug: 'gifts',
    name: 'Gifts',
    blurb: 'Thoughtful jewellery and gift sets, ready to wrap.',
    image: '/occasions/gifts.jpg',
  },
  {
    slug: 'eid',
    name: 'Eid',
    blurb: 'Festive picks to celebrate Eid in style.',
    image: '/occasions/eid.jpg',
  },
]

export function occasionBySlug(slug) {
  return OCCASIONS.find((item) => item.slug === slug) || null
}

export function occasionPath(slug) {
  return `/occasion/${slug}`
}
