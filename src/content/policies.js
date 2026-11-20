import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../config/shipping.js'
import { formatRs } from '../lib/format.js'
import { WHATSAPP_DISPLAY } from '../lib/whatsapp.js'

// Single source of truth for the no-returns rule (Qurat, 20 Nov 2026).
// Strictly no returns, refunds or exchanges — no exceptions.

export const NO_RETURNS_SHORT = 'All sales are final — no returns, refunds or exchanges.'

export const NO_RETURNS_CHECKBOX =
  'I agree — all sales are final. There are no returns, refunds or exchanges once an order is placed and paid.'

export const NO_RETURNS_INTRO =
  'MQ Adorn does not accept returns, refunds or exchanges. Once an order is placed and paid, the sale is final.'

export const NO_RETURNS_POINTS = [
  'The items in your order will not be taken back.',
  'The money you paid will not be refunded.',
  'The order will not be exchanged for another colour, size, style or product.',
  'An order cannot be cancelled for a refund after it has been placed and paid.',
]

export const NO_RETURNS_ADVICE = `Please look carefully at the product photos, details, colour and size before you order. If anything is unclear, message us on WhatsApp ${WHATSAPP_DISPLAY} before you place the order.`

export const DELIVERY_COPY =
  'We deliver across Pakistan. After your payment is confirmed, we will share the delivery timeline with you on WhatsApp. We do not publish a fixed number of days, as timing can vary.'

export function shippingChargesCopy() {
  return `Shipping is free on orders above ${formatRs(FREE_SHIPPING_THRESHOLD)}. Orders under this amount have a flat shipping fee of ${formatRs(SHIPPING_FEE)}.`
}
