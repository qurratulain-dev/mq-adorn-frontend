/**
 * Post-build prerender so crawlers receive real HTML (title, description, JSON-LD, brand copy)
 * without running JavaScript. The live app uses createRoot, so this #root markup is replaced
 * on load and does not need to hydrate.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const SITE = 'https://mqadorn.vercel.app'
const API = (process.env.VITE_API_URL || 'https://mq-adorn-backend.onrender.com/api').replace(/\/$/, '')

const DEFAULT_TITLE = 'MQ Adorn | Jewellery & Dresses Online in Pakistan'
const DEFAULT_DESCRIPTION =
  'Shop MQ Adorn for timeless jewellery and graceful dresses, delivered across Pakistan. Jewellery comes first — earrings, necklaces, rings, bracelets, bangles and sets — with a dresses collection too. Pay by JazzCash, Easypaisa or bank transfer.'
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`
const DEFAULT_IMAGE_ALT = 'MQ Adorn jewellery on blush satin — jewellery and dresses online in Pakistan'

const STATIC_PAGES = [
  {
    path: '/',
    file: 'index.html',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    heading: 'MQ Adorn',
    body: 'Shop MQ Adorn for timeless jewellery and graceful dresses, delivered across Pakistan. Jewellery comes first — earrings, necklaces, rings, bracelets, bangles and sets — with a dresses collection too. Pay by JazzCash, Easypaisa or bank transfer. All sales are final — no returns, refunds or exchanges. WhatsApp +92 329 5349850.',
  },
  {
    path: '/about',
    title: 'About MQ Adorn | Jewellery & Dresses in Pakistan',
    description:
      'MQ Adorn is an online shop for jewellery and dresses, delivered across Pakistan. Browse the collection, pay by JazzCash, Easypaisa or bank transfer, and message us on WhatsApp for help.',
    heading: 'About MQ Adorn',
    body: 'MQ Adorn is a small online shop for jewellery and dresses. The collection is jewellery-first and also includes dresses. We deliver across Pakistan. Pay by JazzCash, Easypaisa or bank transfer. All sales are final.',
  },
  {
    path: '/faqs',
    title: 'FAQs | MQ Adorn',
    description:
      'Answers about ordering at MQ Adorn, guest checkout, JazzCash, Easypaisa and bank transfer, delivery across Pakistan, and our no-returns policy.',
    heading: 'FAQs',
    body: 'How to order at MQ Adorn, payment by JazzCash, Easypaisa or bank transfer, delivery across Pakistan, and the no-returns policy: all sales are final — no returns, refunds or exchanges.',
  },
  {
    path: '/contact',
    title: 'Contact MQ Adorn | WhatsApp +92 329 5349850',
    description: 'Message MQ Adorn on WhatsApp at +92 329 5349850 for help before you order jewellery or dresses. We deliver across Pakistan.',
    heading: 'Contact MQ Adorn',
    body: 'The quickest way to reach MQ Adorn is WhatsApp at +92 329 5349850. You can also find us on Instagram and TikTok.',
  },
  {
    path: '/shipping',
    title: 'Shipping | MQ Adorn',
    description:
      'MQ Adorn delivers across Pakistan. Shipping is free on orders above Rs. 5,000; a flat fee applies under that amount. The delivery timeline is shared on WhatsApp after payment is confirmed.',
    heading: 'Shipping',
    body: 'We deliver across Pakistan. Shipping is free on orders above Rs. 5,000. Orders under that amount have a flat shipping fee of Rs. 250. After payment is confirmed, we share the delivery timeline on WhatsApp.',
  },
  {
    path: '/return-policy',
    title: 'Return Policy | MQ Adorn',
    description: 'All sales at MQ Adorn are final — no returns, refunds or exchanges. Please read this policy before you order.',
    heading: 'Return Policy',
    body: 'MQ Adorn does not accept returns, refunds or exchanges. Once an order is placed and paid, the sale is final.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | MQ Adorn',
    description: 'How MQ Adorn uses the information you share when you browse or place an order.',
    heading: 'Privacy Policy',
    body: 'This page explains how MQ Adorn uses the information you share when you browse or place an order.',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions | MQ Adorn',
    description: 'Terms for shopping at MQ Adorn, including payment, delivery and our no-returns policy.',
    heading: 'Terms & Conditions',
    body: 'Terms for shopping at MQ Adorn, including payment, delivery and our no-returns policy. All sales are final.',
  },
  {
    path: '/shop',
    title: 'Jewellery | MQ Adorn',
    description: 'Explore MQ Adorn jewellery — earrings, necklaces, rings, bracelets, bangles and sets, delivered across Pakistan.',
    heading: 'Jewellery',
    body: 'Explore MQ Adorn jewellery and dresses, delivered across Pakistan.',
  },
  {
    path: '/best-selling',
    title: 'Best Selling | MQ Adorn',
    description: "Shop MQ Adorn's best selling jewellery and dresses, delivered across Pakistan.",
    heading: 'Best Selling',
    body: "MQ Adorn's best selling jewellery and dresses, delivered across Pakistan.",
  },
]

const OCCASIONS = [
  { slug: 'bridal', name: 'Bridal' },
  { slug: 'party-wear', name: 'Party Wear' },
  { slug: 'daily-wear', name: 'Daily Wear' },
  { slug: 'gifts', name: 'Gifts' },
  { slug: 'eid', name: 'Eid' },
]

const FAQ_ITEMS = [
  {
    question: 'What does MQ Adorn sell?',
    answer:
      'MQ Adorn is an online shop for jewellery and dresses, delivered across Pakistan. The collection is jewellery-first — earrings, necklaces, rings, bracelets, bangles and jewellery sets — and also includes dresses.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Browse the shop, add items to your bag, and go to checkout. You can pay by JazzCash, Easypaisa or bank transfer and upload a screenshot of the payment. After we confirm the payment, we will get in touch about delivery.',
  },
  {
    question: 'Which payment methods do you accept?',
    answer:
      'We only accept JazzCash, Easypaisa or bank transfer. You must upload a screenshot of the payment when you place the order. We do not offer Cash on Delivery, and we do not take card payments on the website.',
  },
  {
    question: 'Do you deliver across Pakistan, and what does shipping cost?',
    answer:
      'We deliver across Pakistan. After your payment is confirmed, we will share the delivery timeline with you on WhatsApp. We do not publish a fixed number of days, as timing can vary. Shipping is free on orders above Rs. 5,000. Orders under this amount have a flat shipping fee of Rs. 250.',
  },
  {
    question: 'Can I return, refund or exchange an order?',
    answer:
      'MQ Adorn does not accept returns, refunds or exchanges. Once an order is placed and paid, the sale is final.',
  },
  {
    question: 'How do I contact MQ Adorn?',
    answer: 'Message us on WhatsApp +92 329 5349850 for help before you order. You can also use the Contact page on the website.',
  },
]

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absoluteImage(src) {
  if (!src) return DEFAULT_IMAGE
  if (String(src).startsWith('http://') || String(src).startsWith('https://')) return src
  if (String(src).startsWith('//')) return `https:${src}`
  return `${SITE}${String(src).startsWith('/') ? src : `/${src}`}`
}

function organizationGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'OnlineStore'],
        '@id': `${SITE}/#organization`,
        name: 'MQ Adorn',
        url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` },
        image: DEFAULT_IMAGE,
        sameAs: ['https://www.instagram.com/mqadorn.pk/', 'https://www.tiktok.com/@mqadorn.pk'],
        areaServed: 'PK',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: '+923295349850',
          areaServed: 'PK',
          availableLanguage: ['en', 'ur'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'MQ Adorn',
        url: `${SITE}/`,
        inLanguage: 'en-PK',
        publisher: { '@id': `${SITE}/#organization` },
      },
    ],
  }
}

function applyHead(template, seo) {
  const title = seo.title || DEFAULT_TITLE
  const description = seo.description || DEFAULT_DESCRIPTION
  const url = seo.path === '/' ? `${SITE}/` : `${SITE}${seo.path}`
  const image = seo.image || DEFAULT_IMAGE
  const imageAlt = seo.imageAlt || DEFAULT_IMAGE_ALT
  const type = seo.type || 'website'
  const robots = seo.noindex ? 'noindex, nofollow' : 'index, follow'
  const jsonLd = seo.jsonLd || organizationGraph()

  let html = template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
  html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
  html = html.replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${robots}" />`)
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
  const replacements = {
    'og:type': type,
    'og:url': url,
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:image:secure_url': image,
    'og:image:alt': imageAlt,
  }
  for (const [property, content] of Object.entries(replacements)) {
    const re = new RegExp(`<meta property="${property}" content="[^"]*" \\/>`)
    html = html.replace(re, `<meta property="${property}" content="${escapeHtml(content)}" />`)
  }
  const twitter = {
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:image:alt': imageAlt,
  }
  for (const [name, content] of Object.entries(twitter)) {
    const re = new RegExp(`<meta name="${name}" content="[^"]*" \\/>`)
    html = html.replace(re, `<meta name="${name}" content="${escapeHtml(content)}" />`)
  }
  if (type === 'product' && seo.price != null) {
    if (!html.includes('product:price:amount')) {
      html = html.replace(
        '<meta name="twitter:card"',
        `<meta property="product:price:amount" content="${escapeHtml(String(seo.price))}" />\n    <meta property="product:price:currency" content="PKR" />\n    <meta name="twitter:card"`,
      )
    }
  }
  html = html.replace(
    /<script type="application\/ld\+json" data-mq-jsonld="true">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" data-mq-jsonld="true">\n      ${JSON.stringify(jsonLd)}\n    </script>`,
  )
  const root = `<div id="root">
      <header>
        <h1>${escapeHtml(seo.heading || 'MQ Adorn')}</h1>
        <p>${escapeHtml(title)}</p>
      </header>
      <p>${escapeHtml(seo.body || description)}</p>
    </div>`
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, root)
  return html
}

async function fetchJson(path) {
  try {
    const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.warn(`[prerender] ${path} skipped: ${error.message}`)
    return null
  }
}

async function fetchAllProducts() {
  const products = []
  let page = 1
  let lastPage = 1
  do {
    const payload = await fetchJson(`/products?page=${page}&per_page=48`)
    if (!payload) break
    const rows = Array.isArray(payload.data) ? payload.data : []
    products.push(...rows)
    lastPage = Number(payload.last_page) || 1
    page += 1
  } while (page <= lastPage && page <= 20)
  return products
}

async function writePage(template, seo) {
  const relative = seo.file || `${seo.path.replace(/^\//, '')}/index.html`
  const target = join(dist, relative)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, applyHead(template, seo), 'utf8')
  console.log(`[prerender] ${seo.path}`)
}

const template = await readFile(join(dist, 'index.html'), 'utf8')
const faqPage = STATIC_PAGES.find((page) => page.path === '/faqs')
const graph = organizationGraph()
graph['@graph'].push({
  '@type': 'FAQPage',
  '@id': `${SITE}/faqs#faq`,
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
})
faqPage.jsonLd = graph

for (const page of STATIC_PAGES) {
  await writePage(template, page)
}

for (const occasion of OCCASIONS) {
  await writePage(template, {
    path: `/occasion/${occasion.slug}`,
    title: `${occasion.name} | MQ Adorn`,
    description: `Shop MQ Adorn jewellery and dresses for ${occasion.name.toLowerCase()}, delivered across Pakistan.`,
    heading: occasion.name,
    body: `Jewellery and dresses at MQ Adorn for ${occasion.name.toLowerCase()}, delivered across Pakistan.`,
  })
}

const products = await fetchAllProducts()
for (const product of products) {
  if (!product?.slug) continue
  const image = absoluteImage(product.images?.[0])
  const price = product.sale_price ?? product.price
  const graphForProduct = organizationGraph()
  graphForProduct['@graph'].push({
    '@type': 'Product',
    '@id': `${SITE}/product/${product.slug}#product`,
    name: product.name,
    url: `${SITE}/product/${product.slug}`,
    image: [image],
    description: product.description || `${product.name} at MQ Adorn.`,
    brand: { '@type': 'Brand', name: 'MQ Adorn' },
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      url: `${SITE}/product/${product.slug}`,
      priceCurrency: 'PKR',
      price: Number(price || 0).toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${SITE}/#organization` },
    },
  })
  await writePage(template, {
    path: `/product/${product.slug}`,
    title: `${product.name} | MQ Adorn`,
    description: (product.description || `Shop ${product.name} at MQ Adorn, jewellery and dresses online in Pakistan.`).replace(/\s+/g, ' ').trim().slice(0, 160),
    heading: product.name,
    body: product.description || `${product.name} at MQ Adorn. Delivered across Pakistan.`,
    image,
    imageAlt: product.name,
    type: 'product',
    price: Number(price || 0).toFixed(2),
    jsonLd: graphForProduct,
  })
}

console.log(`[prerender] done (${STATIC_PAGES.length} static, ${OCCASIONS.length} occasions, ${products.length} products)`)
