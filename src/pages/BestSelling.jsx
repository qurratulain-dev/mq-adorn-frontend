import ProductGridPage from '../components/shop/ProductGridPage.jsx'
import { PAGE_SEO } from '../lib/seo.js'

export default function BestSelling() {
  const seo = PAGE_SEO['best-selling']
  return (
    <ProductGridPage
      title="Best Selling"
      eyebrow="Shop"
      crumbs={[{ label: 'Best Selling' }]}
      params={{ best_sellers: 1, sort: 'best_selling' }}
      emptyTitle="New best sellers are on their way"
      emptyBody="We will feature our most-loved pieces here as soon as they are ready."
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoPath={seo.path}
    />
  )
}
