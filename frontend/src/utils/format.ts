export function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function shorten(text: string, length = 120) {
  return text.length > length ? `${text.slice(0, length)}...` : text
}
