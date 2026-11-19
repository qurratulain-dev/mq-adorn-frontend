import { useParams } from 'react-router-dom'
import ComingSoon from '../components/ComingSoon.jsx'

export default function Product() {
  const { slug } = useParams()
  const name = slug.replace(/-/g, ' ')
  return (
    <ComingSoon
      eyebrow="Product"
      title={<span className="capitalize">{name}</span>}
      description="Product gallery, colour and size variants, wishlist and WhatsApp order — coming soon."
    />
  )
}
