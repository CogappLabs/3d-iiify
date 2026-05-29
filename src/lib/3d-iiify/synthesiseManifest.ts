export interface SynthesiseManifestInput {
  modelUrl: string
  modelFormat?: string
  modelLabel?: string
  imageUrl: string
  imageFormat?: string
  imageLabel?: string
}

const hash = (s: string): string => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}

export const synthesiseManifest = ({
  modelUrl,
  modelFormat = 'model/gltf-binary',
  modelLabel = '3D Model',
  imageUrl,
  imageFormat = 'image/jpeg',
  imageLabel = 'Image',
}: SynthesiseManifestInput) => {
  const id = `urn:clover:3d-afy:${hash(modelUrl)}:${hash(imageUrl)}`
  const canvasId = `${id}/canvas/0`
  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id,
    type: 'Manifest',
    label: { en: [`3D-afy: ${imageLabel} on ${modelLabel}`] },
    items: [
      {
        id: canvasId,
        type: 'Canvas',
        height: 1000,
        width: 1000,
        label: { en: [modelLabel] },
        items: [
          {
            id: `${canvasId}/page/0`,
            type: 'AnnotationPage',
            items: [
              {
                id: `${canvasId}/anno/model`,
                type: 'Annotation',
                motivation: 'painting',
                body: {
                  id: modelUrl,
                  type: 'Model',
                  format: modelFormat,
                  label: { en: [modelLabel] },
                },
                target: canvasId,
              },
              {
                id: `${canvasId}/anno/texture`,
                type: 'Annotation',
                motivation: 'painting',
                body: {
                  id: imageUrl,
                  type: 'Image',
                  format: imageFormat,
                  label: { en: [imageLabel] },
                },
                target: {
                  type: 'SpecificResource',
                  source: canvasId,
                  selector: {
                    type: 'FragmentSelector',
                    conformsTo:
                      'https://iiif.io/api/extension/3d-mesh-selector/',
                    value: 'channel=baseColor',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  }
}
