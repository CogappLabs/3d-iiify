export interface ExtractedImage {
  canvasId: string
  canvasLabel: string
  imageUrl: string
  textureUrl: string
  format: string
  thumbnail?: string
}

const localised = (label: any): string => {
  if (!label || typeof label !== 'object') return ''
  const codes = Object.keys(label)
  if (codes.length === 0) return ''
  const first = label[codes[0]]
  return Array.isArray(first) ? first.join(' ') : String(first ?? '')
}

const serviceTextureUrl = (body: any, preferredSize = 2048): string | null => {
  const services = body?.service
  if (!Array.isArray(services) || services.length === 0) return null

  for (const svc of services) {
    const id: string | undefined = svc?.id ?? svc?.['@id']
    const type: string | undefined = svc?.type ?? svc?.['@type']
    const profile: string | undefined = svc?.profile
    if (!id) continue
    // Level 0 services only serve pre-baked sizes; arbitrary `!w,h` requests 404.
    if (typeof profile === 'string' && /level0/i.test(profile)) continue
    if (!type || /ImageService/i.test(type)) {
      const base = id.replace(/\/$/, '')
      const w = body?.width
      const h = body?.height
      const size =
        typeof w === 'number' &&
        typeof h === 'number' &&
        Math.max(w, h) > preferredSize
          ? `!${preferredSize},${preferredSize}`
          : 'max'
      return `${base}/full/${size}/0/default.jpg`
    }
  }
  return null
}

/**
 * Walk the raw manifest JSON for painting annotations whose body is an Image
 * (or whose format starts with "image/"). Returns a friendly summary plus a
 * size-bounded `textureUrl` derived from any IIIF Image API service.
 */
export const extractImages = (manifestJson: any): ExtractedImage[] => {
  const results: ExtractedImage[] = []
  const canvases = manifestJson?.items ?? []
  for (const canvas of canvases) {
    if (canvas?.type !== 'Canvas') continue
    const canvasId = canvas.id
    const canvasLabel = localised(canvas.label)
    const pages = canvas.items ?? []
    for (const page of pages) {
      const annos = page?.items ?? []
      for (const anno of annos) {
        const motivation = Array.isArray(anno.motivation)
          ? anno.motivation[0]
          : anno.motivation
        if (motivation !== 'painting') continue
        const body = Array.isArray(anno.body) ? anno.body[0] : anno.body
        if (!body) continue
        const isImage =
          body.type === 'Image' ||
          (typeof body.format === 'string' && body.format.startsWith('image/'))
        if (!isImage || typeof body.id !== 'string') continue

        const textureUrl = serviceTextureUrl(body) ?? body.id
        results.push({
          canvasId,
          canvasLabel,
          imageUrl: body.id,
          textureUrl,
          format: body.format ?? 'image/jpeg',
          thumbnail:
            Array.isArray(canvas.thumbnail) && canvas.thumbnail[0]?.id
              ? canvas.thumbnail[0].id
              : textureUrl,
        })
      }
    }
  }
  return results
}
