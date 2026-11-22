import ProductGridPage from '../components/shop/ProductGridPage.jsx'

export default function BestSelling() {
  return (
    <ProductGridPage
      title="Best Selling"
      eyebrow="Shop"
      crumbs={[{ label: 'Best Selling' }]}
      params={{ best_sellers: 1, sort: 'best_selling' }}
      emptyTitle="New best sellers are on their way"
      emptyBody="We will feature our most-loved pieces here as soon as they are ready."
    />
  )
}
