const STYLES = {
  pending: 'bg-blush text-primary',
  confirmed: 'bg-gold/15 text-gold-dark',
  shipped: 'bg-primary/10 text-primary',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-black/10 text-muted',
  verified: 'bg-success/15 text-success',
  rejected: 'bg-sale/15 text-sale',
  approved: 'bg-success/15 text-success',
}

export default function StatusBadge({ value }) {
  const label = String(value || '').replace(/_/g, ' ')
  const style = STYLES[value] || 'bg-black/5 text-muted'
  return (
    <span className={`inline-flex rounded-sm px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ${style}`}>
      {label}
    </span>
  )
}
