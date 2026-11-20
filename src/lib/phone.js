export function isPakistaniPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return (digits.length === 11 && digits.startsWith('03')) || (digits.length === 12 && digits.startsWith('923'))
}
