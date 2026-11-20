import { PRICE_RANGES, DRESS_SIZES, SUB_LINKS, currentPriceRangeId } from '../../lib/shopParams.js'

function Section({ title, children }) {
  return (
    <section className="border-b border-black/10 py-5">
      <h3 className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  )
}

function CheckRow({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-[#D4AF37]"
      />
      <span>{children}</span>
    </label>
  )
}

export default function ShopFilters({ values, onChange, onClear }) {
  const subs = SUB_LINKS[values.category] || []
  const rangeId = currentPriceRangeId(values)
  const hasFilters = Boolean(
    values.sub || values.q || values.min_price || values.max_price || values.on_sale || values.in_stock || values.size,
  )

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-medium">Filters</h2>
        {hasFilters && (
          <button type="button" className="text-xs font-medium tracking-wide text-muted uppercase hover:text-gold" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <Section title="Category">
        {subs.map((link) => {
          const slug = new URLSearchParams(link.to.split('?')[1]).get('sub')
          const selected = values.sub === slug
          return (
            <label key={slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="shop-sub"
                checked={selected}
                onChange={() => onChange({ sub: slug })}
                className="h-4 w-4 shrink-0 accent-[#D4AF37]"
              />
              <span className={selected ? 'font-medium' : ''}>{link.label}</span>
            </label>
          )
        })}
        {values.sub && (
          <button type="button" className="mt-1 text-xs text-muted hover:text-gold" onClick={() => onChange({ sub: '' })}>
            All {values.category === 'dresses' ? 'dresses' : 'jewellery'}
          </button>
        )}
      </Section>

      <Section title="Price">
        {PRICE_RANGES.map((range) => (
          <label key={range.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="radio"
              name="shop-price"
              checked={rangeId === range.id}
              onChange={() => onChange({ min_price: range.min, max_price: range.max })}
              className="h-4 w-4 shrink-0 accent-[#D4AF37]"
            />
            <span>{range.label}</span>
          </label>
        ))}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min"
            defaultValue={values.min_price}
            key={`min-${values.min_price}`}
            className="w-full border border-black/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-gold"
            onBlur={(event) => onChange({ min_price: event.target.value.trim() })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onChange({ min_price: event.currentTarget.value.trim() })
            }}
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max"
            defaultValue={values.max_price}
            key={`max-${values.max_price}`}
            className="w-full border border-black/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-gold"
            onBlur={(event) => onChange({ max_price: event.target.value.trim() })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onChange({ max_price: event.currentTarget.value.trim() })
            }}
          />
        </div>
      </Section>

      <Section title="Availability">
        <CheckRow checked={values.on_sale} onChange={(event) => onChange({ on_sale: event.target.checked })}>
          On sale only
        </CheckRow>
        <CheckRow checked={values.in_stock} onChange={(event) => onChange({ in_stock: event.target.checked })}>
          In stock only
        </CheckRow>
      </Section>

      {values.category === 'dresses' && (
        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {DRESS_SIZES.map((size) => {
              const selected = values.size === size
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selected}
                  className={`min-w-10 border px-3 py-1.5 text-sm transition ${
                    selected ? 'border-gold bg-gold text-white' : 'border-black/15 bg-white hover:border-gold'
                  }`}
                  onClick={() => onChange({ size: selected ? '' : size })}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
