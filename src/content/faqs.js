import { formatRs } from '../lib/format.js'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../config/shipping.js'
import { DELIVERY_COPY, NO_RETURNS_ADVICE, NO_RETURNS_INTRO, NO_RETURNS_POINTS } from './policies.js'
import { WHATSAPP_DISPLAY } from '../lib/whatsapp.js'

export function faqEntries({
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD,
  shippingFee = SHIPPING_FEE,
  whatsappDisplay = WHATSAPP_DISPLAY,
} = {}) {
  const shipping =
    `Shipping is free on orders above ${formatRs(freeShippingThreshold)}. Orders under this amount have a flat shipping fee of ${formatRs(shippingFee)}.`

  return [
    {
      id: 'what',
      question: 'What does MQ Adorn sell?',
      answer:
        'MQ Adorn is an online shop for jewellery and dresses, delivered across Pakistan. The collection is jewellery-first — earrings, necklaces, rings, bracelets, bangles and jewellery sets — and also includes dresses.',
    },
    {
      id: 'order',
      question: 'How do I place an order?',
      answer:
        'Browse the shop, add items to your bag, and go to checkout. You can pay by JazzCash, Easypaisa or bank transfer and upload a screenshot of the payment. After we confirm the payment, we will get in touch about delivery.',
    },
    {
      id: 'guest',
      question: 'Do I need an account?',
      answer:
        'No. Guest checkout is available — you only need your name, mobile number, city and full address. Creating an account is optional and lets you see your orders under My Orders.',
    },
    {
      id: 'payment',
      question: 'Which payment methods do you accept?',
      answer:
        'We only accept JazzCash, Easypaisa or bank transfer. You must upload a screenshot of the payment when you place the order. We do not offer Cash on Delivery, and we do not take card payments on the website.',
    },
    {
      id: 'verification',
      question: 'What happens after I pay?',
      answer:
        'Your order is first marked “Payment verification pending” while we check the screenshot. Once the payment is verified, we will confirm the order and share the next steps on WhatsApp.',
    },
    {
      id: 'shipping',
      question: 'Do you deliver across Pakistan, and what does shipping cost?',
      answer: `${DELIVERY_COPY} ${shipping}`,
    },
    {
      id: 'returns',
      question: 'Can I return, refund or exchange an order?',
      answer: `${NO_RETURNS_INTRO} ${NO_RETURNS_POINTS.join(' ')} ${NO_RETURNS_ADVICE}`,
    },
    {
      id: 'tracking',
      question: 'How can I track my order?',
      answer: `If you have an account, open My Orders to see the status. You can also message us on WhatsApp ${whatsappDisplay} with your order number. Guest checkout does not have a separate tracking page.`,
    },
    {
      id: 'password',
      question: 'I have an account or I forgot my password.',
      answer:
        'You can create an account or log in from the header. If you forgot your password, use the forgot password page and we will email you a reset link. Still stuck? Message us on WhatsApp.',
    },
    {
      id: 'contact',
      question: 'How do I contact MQ Adorn?',
      answer: `Message us on WhatsApp ${whatsappDisplay} for help before you order. You can also use the Contact page on the website.`,
    },
  ]
}

export function homeFaqEntries(settings) {
  const all = faqEntries(settings)
  const ids = ['what', 'payment', 'shipping', 'returns', 'contact']
  return ids.map((id) => all.find((item) => item.id === id)).filter(Boolean)
}
