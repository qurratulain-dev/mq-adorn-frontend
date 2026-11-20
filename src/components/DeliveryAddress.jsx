export default function DeliveryAddress({ order }) {
  if (!order) return null

  const lines = Array.isArray(order.delivery_lines) && order.delivery_lines.length
    ? order.delivery_lines
    : [order.shipping_address, [order.city, order.province].filter(Boolean).join(', ')].filter(Boolean)

  return (
    <div className="mt-2 space-y-1 text-sm">
      {order.customer_phone_alt && <p className="text-muted">Alternate phone: {order.customer_phone_alt}</p>}
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}
