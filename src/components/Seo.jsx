import { useEffect, useMemo } from 'react'
import { useStoreSettings } from '../context/StoreSettingsContext.jsx'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_IMAGE_ALT,
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_TITLE,
  OG_LOCALE,
  SITE_NAME,
  absoluteImage,
  absoluteUrl,
  graphJsonLd,
  organizationJsonLd,
  truncateMeta,
  websiteJsonLd,
} from '../lib/seo.js'
import { WHATSAPP_NUMBER } from '../lib/whatsapp.js'

const MANAGED = 'data-mq-seo'
const JSON_LD_ATTR = 'data-mq-jsonld'

function upsertMeta(selector, attrs, content) {
  if (content == null || content === '') return
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
    element.setAttribute(MANAGED, 'true')
    document.head.appendChild(element)
  }
  element.setAttribute('content', String(content))
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    link.setAttribute(MANAGED, 'true')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function sanitizeVerification(value) {
  const raw = String(value || '').trim()
  const fromTag = raw.match(/content=["']([^"']+)["']/i)
  const code = fromTag ? fromTag[1] : raw
  return code.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 100)
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image,
  imageAlt = DEFAULT_IMAGE_ALT,
  type = 'website',
  noindex = false,
  jsonLd,
  price,
  currency = 'PKR',
  imageWidth,
  imageHeight,
}) {
  const settings = useStoreSettings()
  const jsonLdKey = useMemo(() => JSON.stringify(jsonLd || null), [jsonLd])
  const verification = sanitizeVerification(
    settings?.googleSiteVerification || import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '',
  )

  useEffect(() => {
    const fullTitle = title || DEFAULT_TITLE
    const desc = truncateMeta(description || DEFAULT_DESCRIPTION)
    const url = absoluteUrl(path)
    const img = absoluteImage(image || DEFAULT_IMAGE)
    const isDefaultImage = img === DEFAULT_IMAGE
    const width = imageWidth || (isDefaultImage ? DEFAULT_IMAGE_WIDTH : undefined)
    const height = imageHeight || (isDefaultImage ? DEFAULT_IMAGE_HEIGHT : undefined)

    document.title = fullTitle
    document.documentElement.lang = 'en-PK'

    upsertMeta('meta[name="description"]', { name: 'description' }, desc)
    upsertMeta('meta[name="robots"]', { name: 'robots' }, noindex ? 'noindex, nofollow' : 'index, follow')
    setCanonical(url)

    const og = {
      'og:type': type,
      'og:site_name': SITE_NAME,
      'og:locale': OG_LOCALE,
      'og:url': url,
      'og:title': fullTitle,
      'og:description': desc,
      'og:image': img,
      'og:image:secure_url': img,
      'og:image:alt': imageAlt,
      'og:image:type': img.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg',
    }
    if (width) og['og:image:width'] = String(width)
    if (height) og['og:image:height'] = String(height)
    if (type === 'product' && price != null && price !== '') {
      og['product:price:amount'] = String(price)
      og['product:price:currency'] = currency
    }
    Object.entries(og).forEach(([property, content]) => {
      upsertMeta(`meta[property="${property}"]`, { property }, content)
    })

    Object.entries({
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': desc,
      'twitter:image': img,
      'twitter:image:alt': imageAlt,
    }).forEach(([name, content]) => {
      upsertMeta(`meta[name="${name}"]`, { name }, content)
    })

    if (verification) {
      upsertMeta('meta[name="google-site-verification"]', { name: 'google-site-verification' }, verification)
    }

    const extra = jsonLdKey ? JSON.parse(jsonLdKey) : null
    const extras = Array.isArray(extra) ? extra : extra ? [extra] : []
    const digits = String(settings?.whatsappNumber || WHATSAPP_NUMBER).replace(/\D+/g, '')
    const telephone = digits ? `+${digits}` : undefined
    const graph = graphJsonLd(organizationJsonLd({ telephone }), websiteJsonLd(), ...extras)

    let script = document.head.querySelector(`script[${JSON_LD_ATTR}]`)
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute(JSON_LD_ATTR, 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(graph)
  }, [
    title,
    description,
    path,
    image,
    imageAlt,
    type,
    noindex,
    jsonLdKey,
    price,
    currency,
    imageWidth,
    imageHeight,
    verification,
    settings?.whatsappNumber,
  ])

  return null
}
