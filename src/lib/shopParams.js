import { DRESSES_LINKS, JEWELLERY_LINKS } from '../components/navLinks.js'

export const PRICE_RANGES = [
  { id: 'under-999', label: 'Under Rs 999', min: '', max: '999' },
  { id: '1000-2499', label: 'Rs 1,000–2,499', min: '1000', max: '2499' },
  { id: '2500-4999', label: 'Rs 2,500–4,999', min: '2500', max: '4999' },
  { id: '5000-plus', label: 'Rs 5,000+', min: '5000', max: '' },
]

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'best_selling', label: 'Best selling' },
]

export const DRESS_SIZES = ['S', 'M', 'L', 'XL']

export const SUB_LINKS = {
  jewellery: JEWELLERY_LINKS.filter((link) => link.to.includes('sub=')),
  dresses: DRESSES_LINKS.filter((link) => link.to.includes('sub=')),
}

export function parseShopParams(searchParams) {
  let category = searchParams.get('category') || ''
  let sub = searchParams.get('sub') || ''

  if (category === 'gifts') {
    category = 'jewellery'
    sub = sub || 'gifts'
  }
  if (category !== 'dresses') {
    category = 'jewellery'
  }

  let sort = searchParams.get('sort') || 'featured'
  if (sort === 'new') sort = 'newest'

  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  return {
    category,
    sub,
    q: searchParams.get('q') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    on_sale: searchParams.get('on_sale') === '1' || searchParams.get('sale') === '1',
    in_stock: searchParams.get('in_stock') === '1',
    size: searchParams.get('size') || '',
    sort,
    page,
  }
}

export function buildShopSearch(values) {
  const params = new URLSearchParams()
  params.set('category', values.category || 'jewellery')
  if (values.sub) params.set('sub', values.sub)
  if (values.q) params.set('q', values.q)
  if (values.min_price) params.set('min_price', String(values.min_price))
  if (values.max_price) params.set('max_price', String(values.max_price))
  if (values.on_sale) params.set('on_sale', '1')
  if (values.in_stock) params.set('in_stock', '1')
  if (values.size) params.set('size', values.size)
  if (values.sort && values.sort !== 'featured') params.set('sort', values.sort)
  if (values.page && Number(values.page) > 1) params.set('page', String(values.page))
  return params.toString()
}

export function shopPath(values) {
  const query = buildShopSearch(values)
  return query ? `/shop?${query}` : '/shop'
}

export function currentPriceRangeId(values) {
  return (
    PRICE_RANGES.find((range) => (range.min || '') === (values.min_price || '') && (range.max || '') === (values.max_price || ''))
      ?.id || null
  )
}

export function subLabel(category, sub) {
  const list = SUB_LINKS[category] || []
  return list.find((link) => link.to.includes(`sub=${sub}`))?.label || sub
}
