import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { NO_RETURNS_ADVICE, NO_RETURNS_INTRO, NO_RETURNS_POINTS, NO_RETURNS_SHORT } from '../content/policies.js'
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from '../lib/whatsapp.js'

export default function ReturnPolicy() {
  return (
    <div className="bg-cream">
      <PageHero eyebrow="Customer care" title="Return Policy">
        {NO_RETURNS_SHORT}
      </PageHero>
      <div className="container-page py-10 sm:py-14">
        <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed sm:text-base">
          <p>{NO_RETURNS_INTRO}</p>
          <ul className="list-disc space-y-2 pl-5">
            {NO_RETURNS_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p>{NO_RETURNS_ADVICE}</p>
          <p>
            This rule has no exceptions. Please only place an order if you are sure about the piece, including the
            colour and size.
          </p>
          <p>
            Questions before you order? Message us on{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            . You can also read our{' '}
            <Link to="/faqs" className="underline decoration-gold underline-offset-2 hover:text-gold">
              FAQs
            </Link>{' '}
            or{' '}
            <Link to="/contact" className="underline decoration-gold underline-offset-2 hover:text-gold">
              Contact
            </Link>{' '}
            page.
          </p>
        </article>
      </div>
    </div>
  )
}
