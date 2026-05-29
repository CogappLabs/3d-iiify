import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Clover ships ESM + CSS that Next needs to transpile when imported from
  // node_modules (especially the 3D viewer chain: three, @react-three/fiber).
  transpilePackages: ['@samvera/clover-iiif'],
  experimental: {
    // The "Save as IIIF" bake endpoint receives a base64-encoded GLB, which
    // can be tens of MB. Raise the Server Action / route body limit.
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
}

export default nextConfig
