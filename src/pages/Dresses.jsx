import ComingSoon from '../components/ComingSoon.jsx'
import Seo from '../components/Seo.jsx'

export default function Dresses() {
  return (
    <>
      <Seo
        title="Dresses Collection | MQ Adorn"
        description="Graceful dresses in sizes S to XL — the MQ Adorn dresses section is coming soon."
        path="/dresses"
      />
      <ComingSoon
        eyebrow="Dresses"
        title="Dresses Collection"
        description="Graceful dresses in sizes S to XL — our dresses section is coming soon."
      />
    </>
  )
}
