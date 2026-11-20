import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from '../lib/whatsapp.js'

export default function About() {
  return (
    <div className="bg-cream">
      <PageHero eyebrow="MQ Adorn" title="About">
        Jewellery and dresses, delivered across Pakistan.
      </PageHero>
      <div className="container-page py-10 sm:py-14">
        <article className="mx-auto max-w-2xl space-y-5 text-sm leading-relaxed sm:text-base">
          <p>
            MQ Adorn is a small shop for jewellery and dresses, made for everyday wear and for moments you want to feel
            dressed up. We deliver across Pakistan.
          </p>
          <p>
            We keep things simple: you can browse the collection, check out as a guest or with an account, and pay by
            JazzCash, Easypaisa or bank transfer. If you would like help choosing a piece, message us on{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            .
          </p>
          <p>
            Please read our{' '}
            <Link to="/return-policy" className="underline decoration-gold underline-offset-2 hover:text-gold">
              Return Policy
            </Link>{' '}
            before you order. All sales are final — we do not accept returns, refunds or exchanges.
          </p>
        </article>
      </div>
    </div>
  )
}
