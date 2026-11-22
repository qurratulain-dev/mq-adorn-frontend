import { useParams } from 'react-router-dom'
import ProductGridPage from '../components/shop/ProductGridPage.jsx'
import { occasionBySlug } from '../lib/occasions.js'

export default function Occasion() {
  const { slug } = useParams()
  const occasion = occasionBySlug(slug)
  const title = occasion?.name || (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Occasion')

  return (
    <ProductGridPage
      title={title}
      eyebrow="Shop by Occasion"
      crumbs={[{ label: title }]}
      params={{ occasion: slug }}
      emptyTitle="Pieces for this occasion are on their way"
      emptyBody="Please explore the rest of the collection, or check back shortly."
    />
  )
}
