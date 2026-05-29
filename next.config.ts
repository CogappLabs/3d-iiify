import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Clover ships ESM + CSS that Next needs to transpile when imported from
  // node_modules (especially the 3D viewer chain: three, @react-three/fiber).
  transpilePackages: ['@samvera/clover-iiif'],
}

export default nextConfig
