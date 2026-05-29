# 3D-iiify

A standalone web app that maps a IIIF image onto a 3D model, or textures a 3D
model pulled from a IIIF manifest. It outputs a synthesised IIIF Presentation 3
manifest and renders it with [Clover IIIF](https://github.com/samvera-labs/clover-iiif).

A Cogapp hack project by Luke Watson-Davies.

## How it works

1. **Source** a IIIF manifest (2D image or 3D model) by URL, or pick a starter.
2. **Pick** the image or model you want from that manifest.
3. **Compose** it with a model (for an image) or an image (for a model).
4. **View** the result in Clover's 3D viewer, with the image painted onto the
   model's `baseColor` channel via a Clover-local
   `https://iiif.io/api/extension/3d-mesh-selector/` FragmentSelector on a
   painting annotation.

From the viewer you can **Download .glb** (the baked, textured model) or
**Save as IIIF** (writes a manifest + GLB under `public/manifest/baked/` and
gives you a shareable manifest URL).

## Clover dependency

This app depends on a branch of Clover that adds 3D model support, consumed as a
git dependency:

```jsonc
// package.json
"@samvera/clover-iiif": "github:lukew-cogapp/clover-iiif#feat/3d-model-viewer"
```

That branch's `prepare` script builds the package on install, so `npm install`
produces the `dist/` the app imports from (`@samvera/clover-iiif/viewer`). The
app is pinned to **React 18** because Clover's 3D stack uses
`@react-three/fiber` v8, which does not support React 19.

## Asset provenance

All bundled 3D models are **CC-BY-4.0** (sourced from Sketchfab, verified via
the Sketchfab API); attribution is recorded in `src/lib/3d-iiify/model-registry.ts`
and surfaced in the UI. The Declaration of Independence image is US-government
public domain. The pi image is an original render of the digits of pi
(public-domain facts). The `Civil` and `Untitled Serif` fonts under
`public/fonts/` are licensed; do not redistribute without the licence.

Large `.glb` files are stored with [Git LFS](https://git-lfs.com). After
cloning, run `git lfs pull` (or have `git lfs install` set up beforehand).

## Development

```bash
npm install        # builds the Clover git dependency on first install
npm run dev        # start the dev server
npm run lint       # Biome
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Deployment note

The **Save as IIIF** endpoint (`/api/3d-iiify/bake`) writes files to
`public/manifest/baked/` on the server filesystem. On read-only serverless
platforms (e.g. Vercel) this directory is not writable; deploying there needs
the bake step swapped for object storage (S3, R2, etc.).

## Stack

Next.js (App Router), TypeScript (strict), Tailwind CSS, Biome, Lefthook,
GitHub Actions CI. Node 24 LTS.
