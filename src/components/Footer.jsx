import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { SOCIAL_LINKS } from './navLinks.js'
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './Icons.jsx'
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp.js'

const YEAR = new Date().getFullYear()

const ICONS = {
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
}

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      ['New In', '/shop?sort=new'],
      ['Jewellery', '/shop?category=jewellery'],
      ['Earrings', '/shop?category=jewellery&sub=earrings'],
      ['Necklaces', '/shop?category=jewellery&sub=necklaces'],
      ['Rings', '/shop?category=jewellery&sub=rings'],
      ['Dresses', '/shop?category=dresses'],
      ['Sale', '/shop?sale=1'],
    ],
  },
  {
    title: 'Customer Care',
    links: [
      ['Contact Us', '/contact'],
      ['FAQs', '/faqs'],
      ['Shipping', '/shipping'],
      ['Return Policy', '/return-policy'],
      ['Track Order', '/account'],
    ],
  },
  {
    title: 'About',
    links: [
      ['About', '/about'],
      ['Privacy Policy', '/privacy'],
      ['Terms & Conditions', '/terms'],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-primary text-white/80">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            Timeless jewellery and graceful dresses, crafted to make every moment shine. Delivered across Pakistan.
          </p>
          <nav className="mt-5 flex items-center gap-3" aria-label="Social media">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => {
              const Svg = ICONS[Icon]
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`MQ Adorn on ${label}`}
                  className="text-white/70 transition hover:text-gold"
                >
                  <Svg width={20} height={20} />
                </a>
              )
            })}
          </nav>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-gold"
          >
            <WhatsAppIcon width={18} height={18} />
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <form className="mt-6 flex max-w-sm" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold"
            />
            <button type="submit" className="bg-gold px-5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-gold-dark">
              Subscribe
            </button>
          </form>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-heading text-lg text-white">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-gold">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {YEAR} MQ Adorn. All rights reserved.</p>
          <p>JazzCash · Easypaisa · Bank Transfer</p>
        </div>
      </div>
    </footer>
  )
}
