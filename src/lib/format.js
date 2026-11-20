export function formatRs(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Rs. 0'
  return `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

export function salePercent(price, salePrice) {
  const full = Number(price)
  const sale = Number(salePrice)
  if (!full || !sale || sale >= full) return null
  return Math.round((1 - sale / full) * 100)
}
