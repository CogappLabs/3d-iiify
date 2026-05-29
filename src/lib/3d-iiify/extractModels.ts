export interface ExtractedModel {
  canvasId: string
  canvasLabel: string
  glb: string
  format: string
}

const localised = (label: any): string => {
  if (!label || typeof label !== 'object') return ''
  const codes = Object.keys(label)
  if (codes.length === 0) return ''
  const first = label[codes[0]]
  return Array.isArray(first) ? first.join(' ') : String(first ?? '')
}

const SUPPORTED = new Set(['model/gltf-binary', 'model/gltf+json'])

export const extractModels = (manifestJson: any): ExtractedModel[] => {
  const results: ExtractedModel[] = []
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
        if (!body || typeof body.id !== 'string') continue
        const isModel =
          body.type === 'Model' ||
          (typeof body.format === 'string' && body.format.startsWith('model/'))
        if (!isModel) continue
        if (body.format && !SUPPORTED.has(body.format)) continue
        results.push({
          canvasId,
          canvasLabel,
          glb: body.id,
          format: body.format ?? 'model/gltf-binary',
        })
      }
    }
  }
  return results
}
