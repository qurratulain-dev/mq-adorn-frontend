import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="bg-cream">
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-xl border border-gold/30 bg-card px-6 py-14 text-center sm:px-10">
          <p className="text-xs font-medium tracking-[0.28em] text-gold uppercase">404</p>
          <h1 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">Page not found</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            This page is not available. You can go back to the home page or browse the shop.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">
              Back to home
            </Link>
            <Link to="/shop" className="btn-outline">
              Browse the shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
