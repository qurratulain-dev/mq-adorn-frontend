import { Link } from 'react-router-dom'
import { OCCASIONS, occasionPath } from '../lib/occasions.js'
import Reveal from './Reveal.jsx'

export default function ShopByOccasion() {
  return (
    <Reveal as="section" className="bg-blush" aria-labelledby="shop-by-occasion-heading">
      <div className="container-page py-12 sm:py-16">
        <div className="text-center">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">The edit</p>
          <h2 id="shop-by-occasion-heading" className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
            Shop by Occasion
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Find something beautiful for the moments that matter — from bridal days to everyday elegance.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {OCCASIONS.map((item, index) => (
            <Reveal as="li" key={item.slug} delay={index * 70}>
              <Link
                to={occasionPath(item.slug)}
                className="group relative block aspect-[3/4] overflow-hidden bg-blush shadow-[0_16px_40px_-28px_rgba(26,26,26,0.55)]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="img-zoom h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent transition duration-500 group-hover:from-primary/90" />
                <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <span className="block font-heading text-lg text-white sm:text-xl">{item.name}</span>
                  <span className="mt-1 block max-w-[16rem] text-[11px] leading-relaxed text-white/80 opacity-0 transition duration-400 group-hover:translate-y-0 group-hover:opacity-100 sm:text-xs translate-y-1">
                    {item.blurb}
                  </span>
                  <span className="mt-2 inline-block h-px w-6 bg-gold transition-all duration-500 group-hover:w-12" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}
