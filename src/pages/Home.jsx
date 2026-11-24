import Hero from '../components/Hero.jsx'
import CategoryRow from '../components/CategoryRow.jsx'
import ShopByOccasion from '../components/ShopByOccasion.jsx'
import OfferBanners from '../components/OfferBanners.jsx'
import BestSellers from '../components/BestSellers.jsx'
import DealOfTheWeek from '../components/DealOfTheWeek.jsx'
import ShopDresses from '../components/ShopDresses.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Seo from '../components/Seo.jsx'
import { PAGE_SEO } from '../lib/seo.js'

export default function Home() {
  const seo = PAGE_SEO.home

  return (
    <>
      <Seo title={seo.title} description={seo.description} path={seo.path} />
      <Hero />
      <CategoryRow />
      <OfferBanners />
      <BestSellers />
      <DealOfTheWeek />
      <ShopDresses />
      <ShopByOccasion />
      <Testimonials />
    </>
  )
}
