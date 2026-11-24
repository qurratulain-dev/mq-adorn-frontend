import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'

const CATEGORIES = [
  { label: 'Rings', slug: 'rings', image: '/categories/rings.jpg' },
  { label: 'Necklaces', slug: 'necklaces', image: '/categories/necklaces.jpg' },
  { label: 'Earrings', slug: 'earrings', image: '/categories/earrings.jpg' },
  { label: 'Bracelets', slug: 'bracelets', image: '/categories/bracelets.jpg' },
  { label: 'Bangles', slug: 'bangles', image: '/categories/bangles.jpg' },
  { label: 'Sets', slug: 'jewellery-sets', image: '/categories/sets.jpg' },
  { label: 'Gifts', slug: 'gifts', image: '/categories/gifts.jpg' },
]

export default function CategoryRow() {
  return (
    <Reveal as="section" className="bg-card" aria-labelledby="shop-by-category">
      <div className="container-page py-10 sm:py-14">
        <h2 id="shop-by-category" className="sr-only">
          Shop by category
        </h2>
        <ul className="flex gap-5 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-7 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
          {CATEGORIES.map((item, index) => (
            <Reveal as="li" key={item.slug} delay={index * 60} className="flex w-[5.5rem] shrink-0 flex-col items-center sm:w-auto">
              <Link
                to={`/shop?category=jewellery&sub=${item.slug}`}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <span className="block aspect-square w-20 overflow-hidden rounded-full bg-cream shadow-[0_8px_24px_-12px_rgba(26,26,26,0.35)] ring-1 ring-black/5 transition group-hover:shadow-[0_12px_28px_-10px_rgba(26,26,26,0.4)] sm:w-[6.5rem] lg:w-28">
                  <img src={item.image} alt={item.label} className="img-zoom h-full w-full object-cover" />
                </span>
                <span className="text-sm text-primary">{item.label}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}
