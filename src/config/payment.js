// Manual payment details for guest checkout.
// Real JazzCash, Easypaisa and bank account numbers have not been provided yet.
// Every field below is a clearly marked placeholder and must be replaced
// before the shop takes live payments.
export const PAYMENT_METHODS = [
  {
    id: 'jazzcash',
    label: 'JazzCash',
    accountName: 'Account details coming soon',
    accountNumber: 'XXXX',
    instructions:
      'Send the order total to this JazzCash account, then upload a screenshot of the payment. Real account details will be added here before the shop goes live.',
  },
  {
    id: 'easypaisa',
    label: 'Easypaisa',
    accountName: 'Account details coming soon',
    accountNumber: 'XXXX',
    instructions:
      'Send the order total to this Easypaisa account, then upload a screenshot of the payment. Real account details will be added here before the shop goes live.',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    accountName: 'Account details coming soon',
    bankName: 'Bank name coming soon',
    accountNumber: 'XXXX',
    iban: 'XXXX',
    instructions:
      'Transfer the order total to this bank account, then upload a screenshot of the payment. Real account details will be added here before the shop goes live.',
  },
]

export const ACCEPTED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPTED_PROOF_EXTENSIONS = '.jpg,.jpeg,.png,.webp'
export const MAX_PROOF_BYTES = 5 * 1024 * 1024

export function paymentMethodById(id) {
  return PAYMENT_METHODS.find((method) => method.id === id) || null
}
