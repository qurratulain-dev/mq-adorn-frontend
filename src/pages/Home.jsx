import Hero from '../components/Hero.jsx'
import CategoryRow from '../components/CategoryRow.jsx'
import OfferBanners from '../components/OfferBanners.jsx'
import BestSellers from '../components/BestSellers.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryRow />
      <OfferBanners />
      <BestSellers />
    </>
  )
}
