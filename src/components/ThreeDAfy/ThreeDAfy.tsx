'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import {
  type ExtractedImage,
  extractImages,
} from '@/lib/3d-iiify/extractImages'
import {
  type ExtractedModel,
  extractModels,
} from '@/lib/3d-iiify/extractModels'
import {
  IMAGE_MANIFEST_REGISTRY,
  type ImageManifestEntry,
  STARTER_3D,
} from '@/lib/3d-iiify/image-registry'
import { MODEL_REGISTRY } from '@/lib/3d-iiify/model-registry'
import { synthesiseManifest } from '@/lib/3d-iiify/synthesiseManifest'
import styles from './ThreeDAfy.module.css'

const CloverViewer = dynamic(() => import('@samvera/clover-iiif/viewer'), {
  ssr: false,
})

type Step = 'source' | 'pick' | 'compose' | 'view'

interface PickedImage {
  url: string
  textureUrl: string
  format: string
  label: string
}
interface PickedModel {
  glb: string
  format: string
  label: string
}

const readUrlState = () => {
  if (typeof window === 'undefined') return null
  const p = new URLSearchParams(window.location.search)
  const model = p.get('model')
  const image = p.get('image')
  if (!model || !image) return null
  return {
    model,
    modelFormat: p.get('modelFormat') || 'model/gltf-binary',
    modelLabel: p.get('modelLabel') || 'Model',
    image,
    imageFormat: p.get('imageFormat') || 'image/jpeg',
    imageLabel: p.get('imageLabel') || 'Image',
  }
}

const writeUrlState = (
  picked: { model: PickedModel; image: PickedImage } | null,
) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.search = ''
  if (picked) {
    url.searchParams.set('model', picked.model.glb)
    url.searchParams.set('modelFormat', picked.model.format)
    url.searchParams.set('modelLabel', picked.model.label)
    url.searchParams.set('image', picked.image.textureUrl)
    url.searchParams.set('imageFormat', picked.image.format)
    url.searchParams.set('imageLabel', picked.image.label)
  }
  window.history.replaceState({}, '', url.toString())
}

const ThreeDAfy: React.FC = () => {
  const initial = readUrlState()
  const [step, setStep] = useState<Step>(initial ? 'view' : 'source')
  const [manifestUrl, setManifestUrl] = useState('')
  const [manifestKind, setManifestKind] = useState<'image' | 'model' | null>(
    null,
  )
  const [imagesIn, setImagesIn] = useState<ExtractedImage[]>([])
  const [modelsIn, setModelsIn] = useState<ExtractedModel[]>([])
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(
    initial
      ? {
          url: initial.image,
          textureUrl: initial.image,
          format: initial.imageFormat,
          label: initial.imageLabel,
        }
      : null,
  )
  const [pickedModel, setPickedModel] = useState<PickedModel | null>(
    initial
      ? {
          glb: initial.model,
          format: initial.modelFormat,
          label: initial.modelLabel,
        }
      : null,
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (step === 'view' && pickedImage && pickedModel) {
      writeUrlState({ image: pickedImage, model: pickedModel })
    }
  }, [step, pickedImage, pickedModel])

  const gltfRef = React.useRef<any>(null)
  useEffect(() => {
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.gltf) gltfRef.current = detail.gltf
    }
    window.addEventListener('clover:3d-gltf-ready', onReady)
    return () => window.removeEventListener('clover:3d-gltf-ready', onReady)
  }, [])

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const exportGlbAs = async (
    consume: (buffer: ArrayBuffer) => void | Promise<void>,
  ) => {
    const gltf = gltfRef.current
    if (!gltf) return
    const { GLTFExporter } = await import(
      'three/examples/jsm/exporters/GLTFExporter.js'
    )
    const exporter = new GLTFExporter()
    return new Promise<void>((resolve, reject) => {
      exporter.parse(
        gltf.scene,
        async (result) => {
          try {
            await consume(result as ArrayBuffer)
            resolve()
          } catch (e) {
            reject(e)
          }
        },
        (err) => reject(err),
        { binary: true },
      )
    })
  }

  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const downloadGlb = () =>
    exportGlbAs((buffer) => {
      triggerDownload(
        new Blob([buffer], { type: 'model/gltf-binary' }),
        `${slug(pickedModel?.label ?? 'model')}-baked.glb`,
      )
    })

  // Client-side "bake": export the textured GLB and a self-contained IIIF
  // manifest that references the GLB by its downloaded filename, then download
  // both. No server write, so this works on read-only hosting (e.g. Vercel).
  const saveAsIiif = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const base = `${slug(pickedModel?.label ?? 'model')}-${slug(
        pickedImage?.label ?? 'image',
      )}-baked`
      const glbName = `${base}.glb`
      await exportGlbAs((buffer) => {
        triggerDownload(
          new Blob([buffer], { type: 'model/gltf-binary' }),
          glbName,
        )
      })
      const manifest = synthesiseManifest({
        modelUrl: glbName,
        modelFormat: 'model/gltf-binary',
        modelLabel: pickedModel?.label ?? 'Model',
        imageUrl: pickedImage?.textureUrl ?? '',
        imageFormat: pickedImage?.format ?? 'image/jpeg',
        imageLabel: pickedImage?.label ?? 'Image',
      })
      triggerDownload(
        new Blob([JSON.stringify(manifest, null, 2)], {
          type: 'application/json',
        }),
        `${base}.manifest.json`,
      )
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const loadManifest = async (url: string) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json, application/ld+json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const images = extractImages(json)
      const models = extractModels(json)
      if (models.length > 0) {
        setManifestKind('model')
        setModelsIn(models)
        setImagesIn([])
        if (models.length === 1) {
          const m = models[0]
          setPickedModel({
            glb: m.glb,
            format: m.format,
            label: m.canvasLabel || 'Model',
          })
          setStep('compose')
        } else {
          setStep('pick')
        }
      } else if (images.length > 0) {
        setManifestKind('image')
        setImagesIn(images)
        setModelsIn([])
        if (images.length === 1) {
          const img = images[0]
          setPickedImage({
            url: img.imageUrl,
            textureUrl: img.textureUrl,
            format: img.format,
            label: img.canvasLabel || 'Image',
          })
          setStep('compose')
        } else {
          setStep('pick')
        }
      } else {
        throw new Error(
          'Manifest has no Image or supported Model painting bodies.',
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('source')
    setManifestUrl('')
    setManifestKind(null)
    setImagesIn([])
    setModelsIn([])
    setPickedImage(null)
    setPickedModel(null)
    setError(null)
    writeUrlState(null)
  }

  const synthesised =
    pickedImage && pickedModel
      ? synthesiseManifest({
          modelUrl: pickedModel.glb,
          modelFormat: pickedModel.format,
          modelLabel: pickedModel.label,
          imageUrl: pickedImage.textureUrl,
          imageFormat: pickedImage.format,
          imageLabel: pickedImage.label,
        })
      : null

  if (step === 'view' && synthesised) {
    const switchModel = (id: string) => {
      const m = MODEL_REGISTRY.find((x) => x.id === id)
      if (m) setPickedModel({ glb: m.glb, format: m.format, label: m.label })
    }
    const currentModelId = MODEL_REGISTRY.find(
      (m) => m.glb === pickedModel?.glb,
    )?.id
    return (
      <div className={styles.viewRoot}>
        <header className={styles.viewHeader}>
          <a href="/" className={styles.brand}>
            3D-iiify
          </a>
          <div className={styles.headerCentre}>
            <span className={styles.headerSummary}>
              <em>{pickedImage?.label}</em> on
            </span>
            <select
              value={currentModelId ?? ''}
              onChange={(e) => switchModel(e.target.value)}
              className={styles.select}
              aria-label="Shape"
            >
              {!currentModelId && pickedModel && (
                <option value="">{pickedModel.label} (custom)</option>
              )}
              {MODEL_REGISTRY.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji ? `${m.emoji} ${m.label}` : m.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.button} onClick={downloadGlb}>
              Download .glb
            </button>
            <button
              className={styles.button}
              onClick={saveAsIiif}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save as IIIF'}
            </button>
            <button className={styles.button} onClick={reset}>
              Start over
            </button>
          </div>
        </header>
        {saved && (
          <div className={styles.savedBanner}>
            Downloaded the baked <code>.glb</code> and a self-contained IIIF{' '}
            <code>manifest.json</code> that references it. Serve them together
            from the same folder to view the result in any IIIF 3D client.
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          <CloverViewer
            key={`${pickedModel?.glb}-${pickedImage?.textureUrl}`}
            iiifContent={synthesised as any}
            options={{
              canvasHeight: '100%',
              showIIIFBadge: false,
              informationPanel: { open: false, renderToggle: false },
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.h1}>3D-iiify</h1>
        <p className={styles.lede}>
          Cogapp hack project by Luke Watson-Davies. Map a IIIF image onto a 3D
          model, or pick a 3D model from a IIIF manifest and texture it with an
          image. Outputs a synthesised IIIF manifest rendered with Clover.
        </p>

        {error && (
          <div role="alert" className={styles.error}>
            {error}
          </div>
        )}

        {step === 'source' && (
          <SourceStep
            manifestUrl={manifestUrl}
            setManifestUrl={setManifestUrl}
            onLoad={loadManifest}
            loading={loading}
          />
        )}

        {step === 'pick' && manifestKind === 'image' && (
          <PickImageStep
            images={imagesIn}
            onPick={(img) => {
              setPickedImage({
                url: img.imageUrl,
                textureUrl: img.textureUrl,
                format: img.format,
                label: img.canvasLabel || 'Image',
              })
              setStep('compose')
            }}
          />
        )}
        {step === 'pick' && manifestKind === 'model' && (
          <PickModelStep
            models={modelsIn}
            onPick={(m) => {
              setPickedModel({
                glb: m.glb,
                format: m.format,
                label: m.canvasLabel || 'Model',
              })
              setStep('compose')
            }}
          />
        )}

        {step === 'compose' && manifestKind === 'image' && (
          <ChooseModelStep
            pickedImage={pickedImage}
            onPick={(m) => {
              setPickedModel({
                glb: m.glb,
                format: m.format,
                label: m.label,
              })
              setStep('view')
            }}
            onBack={() => setStep('pick')}
          />
        )}
        {step === 'compose' && manifestKind === 'model' && (
          <ChooseImageStep
            pickedModel={pickedModel}
            onPickRegistry={(entry) => {
              void loadAndPickFromRegistry(entry, setPickedImage, () =>
                setStep('view'),
              )
            }}
            onBack={() => setStep('pick')}
          />
        )}

        <p className={styles.footnote}>
          Texture mapping uses a Clover-local{' '}
          <code>https://iiif.io/api/extension/3d-mesh-selector/</code>{' '}
          FragmentSelector on a painting annotation. Not part of the IIIF 3D
          draft, not currently proposed upstream.
        </p>
      </div>
    </div>
  )
}

const loadAndPickFromRegistry = async (
  entry: ImageManifestEntry,
  setPicked: (v: PickedImage) => void,
  done: () => void,
) => {
  const res = await fetch(entry.manifest)
  const json = await res.json()
  const imgs = extractImages(json)
  if (imgs.length === 0) return
  const first = imgs[0]
  setPicked({
    url: first.imageUrl,
    textureUrl: first.textureUrl,
    format: first.format,
    label: entry.label,
  })
  done()
}

const SourceStep: React.FC<{
  manifestUrl: string
  setManifestUrl: (v: string) => void
  onLoad: (url: string) => void
  loading: boolean
}> = ({ manifestUrl, setManifestUrl, onLoad, loading }) => (
  <div>
    <h2 className={styles.h2}>1. Source manifest</h2>
    <p>Paste a IIIF Presentation 3 manifest URL (2D or 3D).</p>
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <input
        type="url"
        value={manifestUrl}
        onChange={(e) => setManifestUrl(e.target.value)}
        placeholder="https://example.org/manifest.json"
        className={styles.input}
      />
      <button
        className={`${styles.button} ${styles.buttonPrimary}`}
        disabled={!manifestUrl || loading}
        onClick={() => onLoad(manifestUrl)}
      >
        {loading ? 'Loading…' : 'Load'}
      </button>
    </div>
    <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Starters</h3>
    <div className={styles.grid}>
      {[...IMAGE_MANIFEST_REGISTRY, STARTER_3D].map((m) => (
        <StarterCard key={m.id} entry={m} onClick={() => onLoad(m.manifest)} />
      ))}
    </div>
  </div>
)

const PasteGlb: React.FC<{
  onPick: (glb: string, label: string) => void
}> = ({ onPick }) => {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        margin: '0.5rem 0 1.5rem',
      }}
    >
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="…or paste a glb URL"
        className={styles.input}
        style={{ flex: '1 1 320px' }}
      />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (optional)"
        className={styles.input}
        style={{ flex: '0 0 200px' }}
      />
      <button
        className={`${styles.button} ${styles.buttonPrimary}`}
        disabled={!url}
        onClick={() => onPick(url, label || 'Custom model')}
      >
        Use this glb
      </button>
    </div>
  )
}

const StarterCard: React.FC<{
  entry: ImageManifestEntry
  onClick: () => void
}> = ({ entry, onClick }) => (
  <button className={styles.card} onClick={onClick}>
    {entry.thumbnail && (
      <img
        src={entry.thumbnail}
        alt=""
        loading="lazy"
        style={{
          width: '100%',
          height: 140,
          objectFit: 'cover',
          borderRadius: 4,
          marginBottom: '0.5rem',
          background: '#eee',
        }}
      />
    )}
    <strong>{entry.label}</strong>
    {entry.kind && (
      <div style={{ fontSize: '0.8rem', color: '#666' }}>{entry.kind}</div>
    )}
  </button>
)

const PickImageStep: React.FC<{
  images: ExtractedImage[]
  onPick: (img: ExtractedImage) => void
}> = ({ images, onPick }) => (
  <div>
    <h2 className={styles.h2}>2. Pick an image</h2>
    <div className={styles.grid}>
      {images.map((img) => (
        <button
          key={img.canvasId}
          className={styles.card}
          onClick={() => onPick(img)}
        >
          {img.thumbnail && (
            <img
              src={img.thumbnail}
              alt=""
              style={{
                width: '100%',
                height: 140,
                objectFit: 'cover',
                borderRadius: 4,
                marginBottom: '0.5rem',
              }}
            />
          )}
          <strong>{img.canvasLabel || 'Untitled'}</strong>
        </button>
      ))}
    </div>
  </div>
)

const PickModelStep: React.FC<{
  models: ExtractedModel[]
  onPick: (m: ExtractedModel) => void
}> = ({ models, onPick }) => (
  <div>
    <h2 className={styles.h2}>2. Pick a model</h2>
    <div className={styles.grid}>
      {models.map((m) => (
        <button
          key={m.canvasId}
          className={styles.card}
          onClick={() => onPick(m)}
        >
          <strong>{m.canvasLabel || 'Untitled'}</strong>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>{m.format}</div>
        </button>
      ))}
    </div>
  </div>
)

const ChooseModelStep: React.FC<{
  pickedImage: PickedImage | null
  onPick: (m: { glb: string; format: string; label: string }) => void
  onBack: () => void
}> = ({ pickedImage, onPick, onBack }) => (
  <div>
    <button
      className={styles.button}
      style={{ marginBottom: '1rem' }}
      onClick={onBack}
    >
      ← Back
    </button>
    <h2 className={styles.h2}>3. 3D-afy this image</h2>
    {pickedImage && (
      <p style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <img
          src={pickedImage.url}
          alt=""
          style={{
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: 6,
          }}
        />
        <span>
          Picked: <strong>{pickedImage.label}</strong>
        </span>
      </p>
    )}
    <p>Pick a 3D model to map this image onto:</p>
    <PasteGlb
      onPick={(glb, label) =>
        onPick({ glb, format: 'model/gltf-binary', label })
      }
    />
    <div className={styles.grid}>
      {MODEL_REGISTRY.map((m) => (
        <button
          key={m.id}
          type="button"
          className={styles.modelCard}
          onClick={() =>
            onPick({ glb: m.glb, format: m.format, label: m.label })
          }
        >
          <span className={styles.modelEmoji} aria-hidden>
            {m.emoji ?? '🗿'}
          </span>
          <span className={styles.modelLabel}>{m.label}</span>
          {m.attribution && (
            <span
              className={styles.modelAttribution}
              onClick={(e) => e.stopPropagation()}
            >
              {m.attribution.author && (
                <>
                  by{' '}
                  {m.attribution.authorUrl ? (
                    <a
                      href={m.attribution.authorUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {m.attribution.author}
                    </a>
                  ) : (
                    m.attribution.author
                  )}{' '}
                </>
              )}
              {m.attribution.sourceUrl && (
                <a
                  href={m.attribution.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  source
                </a>
              )}
              {m.attribution.license && (
                <>
                  {' · '}
                  {m.attribution.licenseUrl ? (
                    <a
                      href={m.attribution.licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {m.attribution.license}
                    </a>
                  ) : (
                    m.attribution.license
                  )}
                </>
              )}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
)

const ChooseImageStep: React.FC<{
  pickedModel: PickedModel | null
  onPickRegistry: (entry: ImageManifestEntry) => void
  onBack: () => void
}> = ({ pickedModel, onPickRegistry, onBack }) => (
  <div>
    <button
      className={styles.button}
      style={{ marginBottom: '1rem' }}
      onClick={onBack}
    >
      ← Back
    </button>
    <h2 className={styles.h2}>3. Pick an image to map</h2>
    {pickedModel && (
      <p>
        Picked model: <strong>{pickedModel.label}</strong>
      </p>
    )}
    <div className={styles.grid}>
      {IMAGE_MANIFEST_REGISTRY.map((entry) => (
        <StarterCard
          key={entry.id}
          entry={entry}
          onClick={() => onPickRegistry(entry)}
        />
      ))}
    </div>
  </div>
)

export default ThreeDAfy
