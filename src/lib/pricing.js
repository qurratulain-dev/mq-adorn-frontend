import { salePercent } from './format.js'

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100
}

export function productPricing(product, variant) {
  const regular = Number(variant?.price || product?.price || 0)
  const deal = product?.deal
  let current = Number(variant?.price || product?.sale_price || product?.price || 0)
  let isDeal = false
  let isSale = false

  if (deal && deal.deal_price != null) {
    const percent = deal.percent_off != null ? Number(deal.percent_off) : null
    if (variant?.price && percent != null) {
      current = roundMoney(Number(variant.price) * (1 - percent / 100))
    } else if (variant?.price && Number(product?.price) > 0 && Number(variant.price) !== Number(product.price)) {
      current = roundMoney(Number(variant.price) * (Number(deal.deal_price) / Number(product.price)))
    } else {
      current = Number(deal.deal_price)
    }
    if (current < regular) {
      isDeal = true
    } else {
      current = Number(variant?.price || product?.sale_price || product?.price || 0)
    }
  }

  if (!isDeal && product?.sale_price && !variant?.price) {
    current = Number(product.sale_price)
    isSale = current < regular
  }

  if (!isDeal && variant?.price) {
    current = Number(variant.price)
  }

  const compare = (isDeal || isSale) && current < regular ? regular : null
  const percent = compare ? salePercent(regular, current) : null

  return {
    current,
    compare,
    regular,
    isDeal,
    isSale,
    percent,
    badge: isDeal ? 'Deal' : isSale ? (percent ? `${percent}% Off` : 'Sale') : null,
  }
}
