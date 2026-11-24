import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import { whatsappDisplay, whatsappLink } from '../lib/whatsapp.js'
import Seo from '../components/Seo.jsx'
import { PAGE_SEO } from '../lib/seo.js'

export default function Terms() {
  const settings = useStoreSettings()
  const display = settings.whatsappDisplay || whatsappDisplay()
  const link = whatsappLink()

  return (
    <div>
      <Seo title={PAGE_SEO['terms'].title} description={PAGE_SEO['terms'].description} path={PAGE_SEO['terms'].path} />
      <PageHero eyebrow="Policies" title="Terms & Conditions" />
      <div className="container-page max-w-3xl space-y-6 py-10 text-sm leading-relaxed text-primary/90 sm:py-14">
        <p>
          These terms apply when you browse or place an order on the MQ Adorn website. By placing an order you agree to them. We have not listed a registered legal entity or postal address here because we have not provided one.
        </p>
        <h2 className="font-heading text-2xl">Orders and payment</h2>
        <p>Orders are placed on this website and paid for in Pakistani Rupees by JazzCash, Easypaisa or bank transfer. After you transfer the amount, you must upload a screenshot of the payment. We check payments by hand. We do not offer Cash on Delivery, and we do not take card payments on the site. An order stays pending until we verify the payment. If we cannot verify it, we may reject the payment and cancel the order.</p>
        <h2 className="font-heading text-2xl">Prices and stock</h2>
        <p>Prices and stock can change. The amount you pay is the total shown at checkout, including any shipping fee. If an item is no longer available after you order, we will contact you on WhatsApp.</p>
        <h2 className="font-heading text-2xl">Delivery</h2>
        <p>We deliver across Pakistan. After your payment is confirmed, we will share the delivery timeline with you on WhatsApp. We do not publish a fixed number of days, as timing can vary.</p>
        <h2 className="font-heading text-2xl">Returns</h2>
        <p>
          All sales are final. We do not accept returns, refunds or exchanges, and there are no exceptions. Please read the{' '}
          <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">Return Policy</Link>
          {' '}before you order.
        </p>
        <h2 className="font-heading text-2xl">Accounts and reviews</h2>
        <p>If you create an account, you are responsible for keeping your password private. Product reviews can be submitted after an order is marked delivered. Reviews appear on the website only after we approve them.</p>
        <h2 className="font-heading text-2xl">Contact</h2>
        <p>
          If anything is unclear, message us on{' '}
          <a href={link} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
            WhatsApp {display}
          </a>
          {' '}before you place an order. Our{' '}
          <Link to="/privacy" className="underline decoration-gold underline-offset-2 hover:text-gold">Privacy Policy</Link>
          {' '}explains how we use the information you give us.
        </p>
      </div>
    </div>
  )
}
