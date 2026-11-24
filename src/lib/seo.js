export const SITE_URL = 'https://mqadorn.vercel.app'
export const SITE_NAME = 'MQ Adorn'
export const DEFAULT_TITLE = 'MQ Adorn | Jewellery & Dresses Online in Pakistan'
export const DEFAULT_DESCRIPTION =
  'Shop MQ Adorn for timeless jewellery and graceful dresses, delivered across Pakistan. Jewellery comes first — earrings, necklaces, rings, bracelets, bangles and sets — with a dresses collection too. Pay by JazzCash, Easypaisa or bank transfer.'
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`
export const DEFAULT_IMAGE_ALT = 'MQ Adorn jewellery on blush satin — jewellery and dresses online in Pakistan'
export const DEFAULT_IMAGE_WIDTH = 1200
export const DEFAULT_IMAGE_HEIGHT = 630
export const INSTAGRAM_URL = 'https://www.instagram.com/mqadorn.pk/'
export const TIKTOK_URL = 'https://www.tiktok.com/@mqadorn.pk'
export const WHATSAPP_E164 = '+923295349850'
export const OG_LOCALE = 'en_PK'

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return `${SITE_URL}/`
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const prefix = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${prefix}`
}

export function absoluteImage(src) {
  if (!src) return DEFAULT_IMAGE
  if (typeof src === 'object') src = src.url || ''
  if (!src) return DEFAULT_IMAGE
  const value = String(src)
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('/api/')) return `https://mq-adorn-backend.onrender.com${value}`
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
}

export function truncateMeta(text, max = 160) {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trim()}…`
}

export function organizationJsonLd({ telephone = WHATSAPP_E164 } = {}) {
  return {
    '@type': ['Organization', 'OnlineStore'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.svg`,
    },
    image: DEFAULT_IMAGE,
    sameAs: [INSTAGRAM_URL, TIKTOK_URL],
    areaServed: 'PK',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone,
      areaServed: 'PK',
      availableLanguage: ['en', 'ur'],
    },
  }
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'en-PK',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function graphJsonLd(...nodes) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  }
}

export function faqJsonLd(items) {
  const entities = (items || [])
    .map((item) => ({
      '@type': 'Question',
      name: item.question || item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer || item.a,
      },
    }))
    .filter((item) => item.name && item.acceptedAnswer.text)

  if (!entities.length) return null

  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faqs#faq`,
    mainEntity: entities,
  }
}

export function productJsonLd(product, extras = {}) {
  if (!product) return null
  const url = extras.url || absoluteUrl(`/product/${product.slug}`)
  const images = (product.images || []).map(absoluteImage).filter(Boolean)
  if (extras.image) images.unshift(absoluteImage(extras.image))
  const uniqueImages = [...new Set(images)]
  const price = extras.price ?? product.sale_price ?? product.price
  const availability =
    extras.availability ||
    (Number(product.stock) > 0 || (product.variants || []).some((item) => Number(item.stock) > 0)
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock')

  const data = {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    url,
    image: uniqueImages.length ? uniqueImages : [DEFAULT_IMAGE],
    description: truncateMeta(extras.description || product.description || `${product.name} at MQ Adorn.`, 300),
    brand: { '@type': 'Brand', name: SITE_NAME },
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PKR',
      price: Number(price || 0).toFixed(2),
      availability,
      seller: { '@id': `${SITE_URL}/#organization` },
    },
  }

  const reviews = (extras.reviews || []).filter((review) => review && (review.comment || review.rating))
  const ratingCount = Number(extras.rating?.count) || reviews.length
  const ratingAverage = extras.rating?.average != null ? Number(extras.rating.average) : null
  if (ratingCount > 0 && ratingAverage && ratingAverage > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingAverage,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    }
  }
  if (reviews.length) {
    data.review = reviews.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.customer_name || review.author || 'Customer' },
      reviewBody: review.comment || undefined,
      reviewRating: review.rating
        ? {
            '@type': 'Rating',
            ratingValue: Number(review.rating),
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    }))
  }

  return data
}

export function shopSeo({ category, sub, heading, path, search }) {
  const label = heading || (sub ? sub : category === 'dresses' ? 'Dresses' : category === 'jewellery' ? 'Jewellery' : 'Shop')
  const isSale = Boolean(search && (search.includes('sale=1') || search.includes('sale=true')))
  const isNew = Boolean(search && search.includes('sort=new'))
  if (isSale) {
    return {
      title: 'Sale | MQ Adorn',
      description: 'Shop the current sale at MQ Adorn — jewellery and dresses online, delivered across Pakistan.',
      path: path || '/shop?sale=1',
    }
  }
  if (isNew && !category) {
    return {
      title: 'New In | MQ Adorn',
      description: 'See the latest jewellery and dresses at MQ Adorn, delivered across Pakistan.',
      path: path || '/shop?sort=new',
    }
  }
  if (label === 'Dresses' || category === 'dresses') {
    return {
      title: `${sub ? `${heading} Dresses` : 'Dresses'} | MQ Adorn`,
      description: `Shop ${heading || 'dresses'} at MQ Adorn. Dresses and jewellery, delivered across Pakistan.`,
      path: path || (sub ? `/shop?category=dresses&sub=${sub}` : '/shop?category=dresses'),
    }
  }
  if (label && label !== 'Jewellery' && label !== 'Shop') {
    return {
      title: `${heading || label} | MQ Adorn`,
      description: `Shop ${heading || label} at MQ Adorn, an online jewellery and dresses boutique in Pakistan.`,
      path: path || (sub ? `/shop?category=jewellery&sub=${sub}` : '/shop'),
    }
  }
  return {
    title: 'Jewellery | MQ Adorn',
    description: 'Explore MQ Adorn jewellery — earrings, necklaces, rings, bracelets, bangles and sets, delivered across Pakistan.',
    path: path || (category ? `/shop?category=${category}` : '/shop'),
  }
}

export const PAGE_SEO = {
  home: {
    path: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  about: {
    path: '/about',
    title: 'About MQ Adorn | Jewellery & Dresses in Pakistan',
    description:
      'MQ Adorn is an online shop for jewellery and dresses, delivered across Pakistan. Browse the collection, pay by JazzCash, Easypaisa or bank transfer, and message us on WhatsApp for help.',
  },
  faqs: {
    path: '/faqs',
    title: 'FAQs | MQ Adorn',
    description:
      'Answers about ordering at MQ Adorn, guest checkout, JazzCash, Easypaisa and bank transfer, delivery across Pakistan, and our no-returns policy.',
  },
  contact: {
    path: '/contact',
    title: 'Contact MQ Adorn | WhatsApp +92 329 5349850',
    description: 'Message MQ Adorn on WhatsApp at +92 329 5349850 for help before you order jewellery or dresses. We deliver across Pakistan.',
  },
  shipping: {
    path: '/shipping',
    title: 'Shipping | MQ Adorn',
    description: 'MQ Adorn delivers across Pakistan. Shipping is free on orders above Rs. 5,000; a flat fee applies under that amount. The delivery timeline is shared on WhatsApp after payment is confirmed.',
  },
  'return-policy': {
    path: '/return-policy',
    title: 'Return Policy | MQ Adorn',
    description: 'All sales at MQ Adorn are final — no returns, refunds or exchanges. Please read this policy before you order.',
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | MQ Adorn',
    description: 'How MQ Adorn uses the information you share when you browse or place an order.',
  },
  terms: {
    path: '/terms',
    title: 'Terms & Conditions | MQ Adorn',
    description: 'Terms for shopping at MQ Adorn, including payment, delivery and our no-returns policy.',
  },
  'best-selling': {
    path: '/best-selling',
    title: 'Best Selling | MQ Adorn',
    description: "Shop MQ Adorn's best selling jewellery and dresses, delivered across Pakistan.",
  },
  contactless: {},
}

export function occasionSeo(name, slug) {
  const label = name || 'Occasion'
  return {
    path: `/occasion/${slug || ''}`,
    title: `${label} | MQ Adorn`,
    description: `Shop MQ Adorn jewellery and dresses for ${label.toLowerCase()}, delivered across Pakistan.`,
  }
}
