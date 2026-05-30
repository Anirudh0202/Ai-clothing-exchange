const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1525026198546-ebb0aa5d6cf6?auto=format&fit=crop&w=900&q=60'

const BACKEND_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '')
  }
})()

export function getImageUrl(imagePath: string | null | undefined, fallback = FALLBACK_IMAGE_URL) {
  if (!imagePath) {
    return fallback
  }

  const trimmed = imagePath.trim()
  if (!trimmed) {
    return fallback
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (/^\/\//.test(trimmed)) {
    return `${window.location.protocol}${trimmed}`
  }

  if (!BACKEND_ORIGIN) {
    return trimmed
  }

  return `${BACKEND_ORIGIN}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}
