import Hero from '../components/Hero.jsx'
import CategoryRow from '../components/CategoryRow.jsx'
import ShopByOccasion from '../components/ShopByOccasion.jsx'
import OfferBanners from '../components/OfferBanners.jsx'
import BestSellers from '../components/BestSellers.jsx'
import DealOfTheWeek from '../components/DealOfTheWeek.jsx'
import Testimonials from '../components/Testimonials.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryRow />
      <OfferBanners />
      <BestSellers />
      <DealOfTheWeek />
      <ShopByOccasion />
      <Testimonials />
    </>
  )
}
