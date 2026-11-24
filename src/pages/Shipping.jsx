import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { DELIVERY_COPY, NO_RETURNS_SHORT, shippingChargesCopy } from '../content/policies.js'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import Seo from '../components/Seo.jsx'
import { PAGE_SEO } from '../lib/seo.js'

export default function Shipping() {
  const { freeShippingThreshold, shippingFee } = useStoreSettings()
  return (
    <div className="bg-cream">
      <Seo title={PAGE_SEO['shipping'].title} description={PAGE_SEO['shipping'].description} path={PAGE_SEO['shipping'].path} />
      <PageHero eyebrow="Customer care" title="Shipping">
        Delivery across Pakistan, with a simple shipping charge.
      </PageHero>
      <div className="container-page py-10 sm:py-14">
        <article className="mx-auto max-w-2xl space-y-5 text-sm leading-relaxed sm:text-base">
          <p>{DELIVERY_COPY}</p>
          <p>{shippingChargesCopy(freeShippingThreshold, shippingFee)}</p>
          <p>
            {NO_RETURNS_SHORT} Please read the{' '}
            <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">
              Return Policy
            </Link>{' '}
            before you order.
          </p>
        </article>
      </div>
    </div>
  )
}
