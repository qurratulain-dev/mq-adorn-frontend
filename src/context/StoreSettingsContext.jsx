import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getStoreSettings } from '../api/client.js'
import { PAYMENT_METHODS } from '../config/payment.js'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, remainingForFreeShipping, shippingFeeFor } from '../config/shipping.js'
import { applyWhatsAppSettings, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '../lib/whatsapp.js'
import { DEFAULT_ANNOUNCEMENT_LINES } from '../lib/announcements.js'

const StoreSettingsContext = createContext(null)

function mapMethods(methods) {
  if (!Array.isArray(methods) || methods.length === 0) return PAYMENT_METHODS
  return methods.map((method) => ({
    id: method.id,
    label: method.label,
    accountName: method.account_name ?? method.accountName,
    accountNumber: method.account_number ?? method.accountNumber,
    bankName: method.bank_name ?? method.bankName,
    iban: method.iban,
    instructions: method.instructions,
  }))
}

const FALLBACK = {
  paymentMethods: PAYMENT_METHODS,
  shippingFee: SHIPPING_FEE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappDisplay: WHATSAPP_DISPLAY,
  announcementLines: DEFAULT_ANNOUNCEMENT_LINES,
}

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK)

  useEffect(() => {
    const controller = new AbortController()
    getStoreSettings({ signal: controller.signal })
      .then((payload) => {
        const data = payload.data || payload
        const next = {
          paymentMethods: mapMethods(data.payment_methods),
          shippingFee: Number(data.shipping_fee) || SHIPPING_FEE,
          freeShippingThreshold: Number(data.free_shipping_threshold) || FREE_SHIPPING_THRESHOLD,
          whatsappNumber: data.whatsapp_number || WHATSAPP_NUMBER,
          whatsappDisplay: data.whatsapp_display || WHATSAPP_DISPLAY,
          announcementLines: Array.isArray(data.announcement_lines) ? data.announcement_lines : DEFAULT_ANNOUNCEMENT_LINES,
        }
        applyWhatsAppSettings({ number: next.whatsappNumber, display: next.whatsappDisplay })
        setSettings(next)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const value = useMemo(() => ({
    ...settings,
    shippingFeeFor: (subtotal) => shippingFeeFor(subtotal, settings.freeShippingThreshold, settings.shippingFee),
    remainingForFreeShipping: (subtotal) => remainingForFreeShipping(subtotal, settings.freeShippingThreshold),
  }), [settings])

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
}

export function useStoreSettings() {
  const ctx = useContext(StoreSettingsContext)
  return ctx || { ...FALLBACK, shippingFeeFor, remainingForFreeShipping }
}
