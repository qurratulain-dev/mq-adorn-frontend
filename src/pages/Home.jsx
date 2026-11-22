import Hero from '../components/Hero.jsx'
import CategoryRow from '../components/CategoryRow.jsx'
import ShopByOccasion from '../components/ShopByOccasion.jsx'
import OfferBanners from '../components/OfferBanners.jsx'
import BestSellers from '../components/BestSellers.jsx'
import Testimonials from '../components/Testimonials.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryRow />
      <ShopByOccasion />
      <OfferBanners />
      <BestSellers />
      <Testimonials />
    </>
  )
}
