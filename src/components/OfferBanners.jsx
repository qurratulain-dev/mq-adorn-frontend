import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './Icons.jsx'

export default function OfferBanners() {
  return (
    <section className="bg-cream" aria-label="Featured offers">
      <div className="container-page grid gap-4 py-4 sm:py-6 lg:grid-cols-[1.4fr_1fr] lg:gap-5">
        <Link
          to="/shop?sort=new"
          className="group relative min-h-[16rem] overflow-hidden sm:min-h-[20rem] lg:min-h-[22rem]"
        >
          <img
            src="/banners/new-collection.jpg"
            alt="Traditional gold necklace and earrings from the new collection"
            className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/35 to-black/55" />
          <div className="relative z-10 flex h-full flex-col items-start justify-center p-6 text-white sm:items-end sm:p-10 sm:text-right">
            <p className="text-[11px] font-medium tracking-[0.28em] text-gold uppercase">New Collection</p>
            <h2 className="mt-2 max-w-xs font-heading text-3xl leading-tight font-medium sm:text-4xl">
              Modern Designs for Modern You
            </h2>
            <span className="btn-primary mt-6 bg-primary px-6 text-white hover:bg-gold">
              Explore Now <ArrowRightIcon />
            </span>
          </div>
        </Link>

        <div className="grid gap-4">
          <Link
            to="/shop?category=gifts"
            className="group relative min-h-[9.5rem] overflow-hidden bg-blush sm:min-h-[10.5rem]"
          >
            <img
              src="/banners/gifts.jpg"
              alt="Pink gift box tied with a gold ribbon"
              className="absolute inset-0 h-full w-full object-cover object-[70%_center] transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blush/95 via-blush/80 to-blush/10" />
            <div className="relative z-10 flex h-full max-w-[55%] flex-col justify-center p-5 sm:p-6">
              <h2 className="font-heading text-2xl leading-tight font-medium sm:text-[1.7rem]">
                Special Gifts for Loved Ones
              </h2>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-primary uppercase">
                Shop Gifts <ArrowRightIcon />
              </span>
            </div>
          </Link>

          <Link
            to="/shop"
            className="group relative min-h-[9.5rem] overflow-hidden bg-blush sm:min-h-[10.5rem]"
          >
            <img
              src="/banners/everyday.jpg"
              alt="Gold bracelet on a blush background"
              className="absolute inset-0 h-full w-full object-cover object-[75%_center] transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f6e6df]/95 via-[#f6e6df]/75 to-transparent" />
            <div className="relative z-10 flex h-full max-w-[55%] flex-col justify-center p-5 sm:p-6">
              <h2 className="font-heading text-2xl leading-tight font-medium sm:text-[1.7rem]">Everyday Luxury</h2>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-primary uppercase">
                Shop Now <ArrowRightIcon />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
