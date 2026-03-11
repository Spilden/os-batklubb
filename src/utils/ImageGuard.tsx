import { Media } from '@/payload-types'

type ImageData = {
  url: string
  width: number
  height: number
  alt: string
}

export function imageGuard(photo: unknown): ImageData | null {
  if (!photo || typeof photo !== 'object') return null
  const image = photo as Media
  if (image.url && image.width && image.height) {
    return { url: image.url, width: image.width, height: image.height, alt: image.alt || '' }
  }
  return null
}