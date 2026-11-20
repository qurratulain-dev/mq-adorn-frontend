// Fallback defaults. Live values come from GET /api/settings (admin-editable).
export const FREE_SHIPPING_THRESHOLD = 5000
export const SHIPPING_FEE = 250

export function shippingFeeFor(subtotal, threshold = FREE_SHIPPING_THRESHOLD, fee = SHIPPING_FEE) {
  const amount = Number(subtotal) || 0
  return amount >= threshold ? 0 : fee
}

export function remainingForFreeShipping(subtotal, threshold = FREE_SHIPPING_THRESHOLD) {
  const amount = Number(subtotal) || 0
  return Math.max(0, threshold - amount)
}
