import Hero from '../components/Hero.jsx'
import CategoryRow from '../components/CategoryRow.jsx'
import ShopByOccasion from '../components/ShopByOccasion.jsx'
import OfferBanners from '../components/OfferBanners.jsx'
import BestSellers from '../components/BestSellers.jsx'
import DealOfTheWeek from '../components/DealOfTheWeek.jsx'
import ShopDresses from '../components/ShopDresses.jsx'
import Testimonials from '../components/Testimonials.jsx'
import HomeFaq from '../components/HomeFaq.jsx'
import Seo from '../components/Seo.jsx'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import { faqJsonLd, PAGE_SEO } from '../lib/seo.js'
import { homeFaqEntries } from '../content/faqs.js'

export default function Home() {
  const { freeShippingThreshold, shippingFee, whatsappDisplay } = useStoreSettings()
  const seo = PAGE_SEO.home
  const faqs = homeFaqEntries({ freeShippingThreshold, shippingFee, whatsappDisplay })

  return (
    <>
      <Seo title={seo.title} description={seo.description} path={seo.path} jsonLd={faqJsonLd(faqs)} />
      <Hero />
      <CategoryRow />
      <OfferBanners />
      <BestSellers />
      <DealOfTheWeek />
      <ShopDresses />
      <ShopByOccasion />
      <Testimonials />
      <HomeFaq />
    </>
  )
}
