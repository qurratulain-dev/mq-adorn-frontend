import { Link } from 'react-router-dom'
import { SparkleIcon } from './Icons.jsx'

export default function ComingSoon({ eyebrow = 'MQ Adorn', title, description, children }) {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-2xl rounded-sm border border-gold/30 bg-card px-6 py-14 text-center shadow-[0_20px_60px_-30px_rgba(26,26,26,0.25)] sm:px-12">
        <SparkleIcon className="mx-auto text-gold" width={30} height={30} />
        <p className="mt-4 text-xs font-medium tracking-[0.3em] text-gold uppercase">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <div className="mx-auto my-5 h-px w-16 bg-gold" />
        <p className="text-sm leading-relaxed text-muted sm:text-base">
          {description || 'This page is being crafted with care and will be available soon.'}
        </p>
        {children}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/shop" className="btn-outline">Browse Shop</Link>
        </div>
      </div>
    </section>
  )
}
