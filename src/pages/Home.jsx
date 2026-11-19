import ComingSoon from '../components/ComingSoon.jsx'

const SWATCHES = [
  ['Primary', 'bg-primary'],
  ['Gold', 'bg-gold'],
  ['Cream', 'bg-cream border border-black/10'],
  ['Blush', 'bg-blush'],
  ['Sale', 'bg-sale'],
  ['Success', 'bg-success'],
]

export default function Home() {
  return (
    <ComingSoon
      eyebrow="Welcome to MQ Adorn"
      title="Elegance in Every Detail"
      description="Our new home page — hero banner, shop by category, best sellers and new arrivals — is coming soon."
    >
      <ul className="mt-8 flex flex-wrap justify-center gap-4" aria-label="Brand colours">
        {SWATCHES.map(([name, cls]) => (
          <li key={name} className="flex flex-col items-center gap-1.5 text-[11px] text-muted">
            <span className={`h-9 w-9 rounded-full ${cls}`} />
            {name}
          </li>
        ))}
      </ul>
    </ComingSoon>
  )
}
