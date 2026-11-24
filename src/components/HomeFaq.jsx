import { Link } from 'react-router-dom'
import { homeFaqEntries } from '../content/faqs.js'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import Reveal from './Reveal.jsx'

export default function HomeFaq() {
  const { freeShippingThreshold, shippingFee, whatsappDisplay } = useStoreSettings()
  const items = homeFaqEntries({ freeShippingThreshold, shippingFee, whatsappDisplay })

  return (
    <Reveal as="section" className="bg-card" aria-labelledby="home-faq-heading">
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Help</p>
          <h2 id="home-faq-heading" className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm text-muted">
            A few things people usually want to know before they order.
          </p>
        </div>
        <dl className="mx-auto mt-8 max-w-2xl space-y-5">
          {items.map((item) => (
            <div key={item.id} className="border-b border-black/5 pb-5">
              <dt className="font-heading text-lg font-medium">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-center text-sm">
          <Link to="/faqs" className="underline decoration-gold underline-offset-4 hover:text-gold">
            See all FAQs
          </Link>
        </p>
      </div>
    </Reveal>
  )
}
