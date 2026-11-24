import { productPricing } from './pricing.js'

export function uniqueValues(variants, key) {
  return [...new Set((variants || []).map((item) => item[key]).filter(Boolean))]
}

export function findVariant(variants, color, size) {
  const list = variants || []
  return (
    list.find((item) => (color ? item.color === color : true) && (size ? item.size === size : !item.size || item.size === size)) ||
    list.find((item) => item.color === color) ||
    list[0] ||
    null
  )
}

export function availableStock(product, variant) {
  if (variant && typeof variant.stock === 'number') return variant.stock
  if (typeof product?.stock === 'number') return product.stock
  const fromVariants = (product?.variants || []).reduce((sum, item) => sum + (Number(item.stock) || 0), 0)
  return fromVariants
}

export function firstAvailableSelection(variants) {
  const list = variants || []
  const inStock = list.find((item) => Number(item.stock) > 0) || list[0]
  return {
    color: inStock?.color || '',
    size: inStock?.size || '',
  }
}

const COLOR_HEX = {
  Gold: '#D4AF37',
  Silver: '#C0C0C0',
  Pearl: '#F5F0E6',
  Red: '#B91C1C',
  Green: '#166534',
  Emerald: '#065F46',
  Black: '#1A1A1A',
  Maroon: '#7F1D1D',
  Pink: '#E091A8',
  Ivory: '#FFFEF8',
  White: '#FFFFFF',
  Blue: '#1E3A8A',
  Sky: '#7DD3FC',
  Mint: '#A7F3D0',
  Beige: '#E8D9C4',
  Mustard: '#C9A227',
  Sand: '#D4C4A8',
  Olive: '#6B7B4A',
  Lavender: '#B39EB5',
  Multicolor: '#C9A227',
  Clear: '#F4F1EA',
  'White/Clear': '#F4F1EA',
  'White / Clear': '#F4F1EA',
}

export function colorHex(name) {
  return COLOR_HEX[name] || null
}

export function inStockVariants(product) {
  return (product?.variants || []).filter((item) => Number(item.stock) > 0)
}

/** How a product card should add this item so checkout never gets an incomplete line. */
export function addToCartStrategy(product) {
  const variants = product?.variants || []
  if (variants.length === 0) return { type: 'direct' }

  const inStock = inStockVariants(product)
  if (inStock.length === 0) return { type: 'oos' }
  if (inStock.length === 1) return { type: 'single', variant: inStock[0] }
  return { type: 'picker', variants: inStock }
}

export function imagesForColor(product, color) {
  const variants = product?.variants || []
  const variant = color ? variants.find((item) => item.color === color) : null
  const fromVariant = (variant?.images || []).filter(Boolean)
  if (fromVariant.length) return fromVariant
  return (product?.images || []).filter(Boolean)
}

export function lineFromVariant(product, variant) {
  const pricing = productPricing(product, variant)
  return {
    color: variant?.color || null,
    size: variant?.size || null,
    price: pricing.current,
    compare_price: pricing.compare,
    is_deal: pricing.isDeal,
  }
}
