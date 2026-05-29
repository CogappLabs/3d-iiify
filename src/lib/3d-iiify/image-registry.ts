export interface ImageManifestEntry {
  id: string
  label: string
  manifest: string
  thumbnail?: string
  kind?: '2D' | '3D'
}

export const IMAGE_MANIFEST_REGISTRY: ImageManifestEntry[] = [
  {
    id: 'declaration',
    label: 'Declaration of Independence (tiled)',
    manifest: '/manifest/declaration/manifest.json',
    thumbnail: '/manifest/declaration/declaration/full/235,286/0/default.jpg',
    kind: '2D',
  },
  {
    id: 'kates-doughnuts',
    label: "Kate's doughnuts (Amherst)",
    manifest:
      'https://acdc.amherst.edu/do/f4e6984a-3e27-465a-9b1d-b1920ccaf6d7/metadata/iiifmanifest3cws/default.jsonld',
    thumbnail:
      'https://acdc.amherst.edu/cantaloupe/iiif/2/media%2FEmilyDickinson%2Fed0889%2Fimage-ed0889-01-36f0daf8-0739-455b-87dc-fd3f3089159a.tif/full/240,/0/default.jpg',
    kind: '2D',
  },
  {
    id: 'pi-image',
    label: 'Pi (digits of π)',
    manifest: '/manifest/pi-image/manifest.json',
    thumbnail: '/manifest/pi-image/pi.jpg',
    kind: '2D',
  },
  {
    id: 'nwu-coins',
    label: 'Northwestern coin',
    manifest:
      'https://api.dc.library.northwestern.edu/api/v2/works/71153379-4283-43be-8b0f-4e7e3bfda275?as=iiif',
    thumbnail:
      'https://iiif.dc.library.northwestern.edu/iiif/2/dae0cccd-bf8a-4a82-8017-3a4150f60fc7/full/!400,400/0/default.jpg',
    kind: '2D',
  },
  {
    id: 'cookbook-0001',
    label: 'Cookbook 0001 (single image)',
    manifest:
      'https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json',
    thumbnail:
      'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/!400,400/0/default.jpg',
    kind: '2D',
  },
]

export const STARTER_3D: ImageManifestEntry = {
  id: 'austen-desk',
  label: 'Jane Austen Writing Desk',
  manifest:
    'https://bl-3d.netlify.app/collection/jane-austen-writing-desk/index.json',
  thumbnail: '/manifest/placeholders/desk.svg',
  kind: '3D',
}
