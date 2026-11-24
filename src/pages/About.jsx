import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import Seo from '../components/Seo.jsx'
import { SOCIAL_LINKS } from '../components/navLinks.js'
import { PAGE_SEO } from '../lib/seo.js'
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from '../lib/whatsapp.js'

export default function About() {
  const seo = PAGE_SEO.about

  return (
    <div className="bg-cream">
      <Seo title={seo.title} description={seo.description} path={seo.path} />
      <PageHero eyebrow="MQ Adorn" title="About MQ Adorn">
        An online shop for jewellery and dresses, delivered across Pakistan.
      </PageHero>
      <div className="container-page py-10 sm:py-14">
        <article className="mx-auto max-w-2xl space-y-5 text-sm leading-relaxed sm:text-base">
          <p>
            MQ Adorn is a small online shop for jewellery and dresses. The collection is jewellery-first — earrings,
            necklaces, rings, bracelets, bangles and jewellery sets — and also includes dresses. Pieces are meant for
            everyday wear and for moments you want to feel dressed up. We deliver across Pakistan.
          </p>
          <p>
            You can browse the shop, check out as a guest or with an account, and pay by JazzCash, Easypaisa or bank
            transfer. We do not offer Cash on Delivery, and we do not take card payments on the website. After we
            confirm your payment, we share the delivery details with you on WhatsApp.
          </p>
          <p>
            If you would like help choosing a piece, or anything on a product page is unclear, message us on{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            . You can also find us on{' '}
            <a href={SOCIAL_LINKS.find((item) => item.Icon === 'instagram' || item.label === 'Instagram')?.href || 'https://www.instagram.com/mqadorn.pk/'} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              Instagram
            </a>{' '}
            and{' '}
            <a href={SOCIAL_LINKS.find((item) => item.Icon === 'tiktok' || item.label === 'TikTok')?.href || 'https://www.tiktok.com/@mqadorn.pk'} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold">
              TikTok
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
