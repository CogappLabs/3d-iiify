export interface ModelEntry {
  id: string
  label: string
  emoji?: string
  glb: string
  format: string
  thumbnail?: string
  attribution?: {
    author?: string
    authorUrl?: string
    sourceUrl?: string
    license?: string
    licenseUrl?: string
  }
}

export const MODEL_REGISTRY: ModelEntry[] = [
  {
    id: 'donut',
    label: 'Donut',
    emoji: '🍩',
    glb: '/manifest/donut/donut.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: '8bit',
      authorUrl: 'https://sketchfab.com/8_bit',
      sourceUrl:
        'https://sketchfab.com/3d-models/donut-d087babd816d4121a739bb8bf3f021e1',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'pie',
    label: 'Pie',
    emoji: '🥧',
    glb: '/manifest/pi-pie/pie.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: 'Yacob',
      authorUrl: 'https://sketchfab.com/yacobverse',
      sourceUrl:
        'https://sketchfab.com/3d-models/pie-1b2792e199ed472ba2d7e9d62b1d3565',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'bread',
    label: 'Bread',
    emoji: '🍞',
    glb: '/manifest/models/bread.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: 'Sir Erdees',
      authorUrl: 'https://sketchfab.com/sirerdees',
      sourceUrl:
        'https://sketchfab.com/3d-models/bread-toon-5b8c0d539559408f882f96dac5696b86',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'banana',
    label: 'Banana',
    emoji: '🍌',
    glb: '/manifest/models/banana.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: 'ShekhirevaVictoria',
      authorUrl: 'https://sketchfab.com/ShekhirevaVictoria',
      sourceUrl:
        'https://sketchfab.com/3d-models/banana-e0c2951ac0ca47b8978b2a6eca426c3f',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'beer',
    label: 'Beer mug',
    emoji: '🍺',
    glb: '/manifest/models/beer.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: 'i-m-a-kitty-cat',
      authorUrl: 'https://sketchfab.com/i-m-a-kitty-cat',
      sourceUrl:
        'https://sketchfab.com/3d-models/beer-mug-glass-e971453ae97043a2b1348faf36065fed',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'van-gogh',
    label: 'Van Gogh',
    emoji: '🎨',
    glb: '/manifest/models/van_gogh.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: 'Roberto Domínguez',
      authorUrl: 'https://sketchfab.com/vmmaniac',
      sourceUrl:
        'https://sketchfab.com/3d-models/van-gogh-8226f24fdb0141d4bec0251b61331e4d',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'poop',
    label: 'Poop',
    emoji: '💩',
    glb: '/manifest/models/poop.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: 'Dimensión N',
      authorUrl: 'https://sketchfab.com/dimensionn',
      sourceUrl:
        'https://sketchfab.com/3d-models/3d-poop-emoji-aba9c319497c4c5f8c62cd109b3e9242',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'austen-desk',
    label: "Jane Austen's Writing Desk",
    emoji: '🪑',
    glb: 'https://bl-3d.netlify.app/collection/jane-austen-writing-desk/jane-austen-writing-desk.glb',
    format: 'model/gltf-binary',
    attribution: {
      author: 'British Library',
      sourceUrl:
        'https://bl-3d.netlify.app/collection/jane-austen-writing-desk/',
    },
  },
]
