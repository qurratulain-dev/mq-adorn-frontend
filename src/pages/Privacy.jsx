import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import { whatsappDisplay, whatsappLink } from '../lib/whatsapp.js'
import Seo from '../components/Seo.jsx'
import { PAGE_SEO } from '../lib/seo.js'

export default function Privacy() {
  const settings = useStoreSettings()
  const display = settings.whatsappDisplay || whatsappDisplay()
  const link = whatsappLink()

  return (
    <div>
      <Seo title={PAGE_SEO['privacy'].title} description={PAGE_SEO['privacy'].description} path={PAGE_SEO['privacy'].path} />
      <PageHero eyebrow="Policies" title="Privacy Policy" />
      <div className="container-page max-w-3xl space-y-6 py-10 text-sm leading-relaxed text-primary/90 sm:py-14">
        <p>
          This page explains what information MQ Adorn collects when you use this website, and how we use it. We keep this as simple and honest as we can. We have not formed a registered company address to list here.
        </p>
        <h2 className="font-heading text-2xl">What we collect</h2>
        <p>When you place an order, we ask for your name, mobile number, email (optional but helpful), city and delivery address. You also upload a screenshot of your payment and may add a transaction ID. If you create an account, we store your name, email, mobile number and a password.</p>
        <h2 className="font-heading text-2xl">How we use it</h2>
        <p>We use this information to confirm your payment, pack and send your order, and to contact you about that order on WhatsApp or by email. Payment screenshots are only for verifying the transfer. We do not take card payments on this website, and we do not offer Cash on Delivery.</p>
        <h2 className="font-heading text-2xl">Who we share it with</h2>
        <p>We do not sell your information. We may share what a courier needs in order to deliver your order. Our website is hosted by our technical providers, who store the order information we collect.</p>
        <h2 className="font-heading text-2xl">How long we keep it</h2>
        <p>We keep order and account records for as long as we need them to fulfil orders, answer questions and keep a basic history of sales. If you would like us to review or remove an account, message us on WhatsApp.</p>
        <h2 className="font-heading text-2xl">Contact</h2>
        <p>
          Questions about this policy can be sent on{' '}
          <a href={link} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
            WhatsApp {display}
          </a>
          . You can also read our{' '}
          <Link to="/terms" className="underline decoration-gold underline-offset-2 hover:text-gold">Terms &amp; Conditions</Link>
          {' '}and{' '}
          <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">Return Policy</Link>.
        </p>
      </div>
    </div>
  )
}
