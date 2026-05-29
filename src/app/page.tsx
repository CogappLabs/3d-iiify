'use client'

import dynamic from 'next/dynamic'

const ThreeDAfy = dynamic(() => import('@/components/ThreeDAfy/ThreeDAfy'), {
  ssr: false,
})

export default function Home() {
  return <ThreeDAfy />
}
