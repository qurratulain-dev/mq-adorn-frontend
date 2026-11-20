// Keep in sync with backend/config/store.php
export const FREE_SHIPPING_THRESHOLD = 5000
export const SHIPPING_FEE = 250

export function shippingFeeFor(subtotal) {
  const amount = Number(subtotal) || 0
  return amount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

export function remainingForFreeShipping(subtotal) {
  const amount = Number(subtotal) || 0
  return Math.max(0, FREE_SHIPPING_THRESHOLD - amount)
}
