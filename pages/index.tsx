import dynamic from 'next/dynamic'
import Head from 'next/head'

const ThreeDAfy = dynamic(() => import('@/components/ThreeDAfy/ThreeDAfy'), {
  ssr: false,
})

export default function Home() {
  return (
    <>
      <Head>
        <title>3D-iiify</title>
        <meta
          name="description"
          content="Map a IIIF image onto a 3D model, or texture a 3D model from a IIIF manifest. A Cogapp hack project rendered with Clover IIIF."
        />
      </Head>
      <ThreeDAfy />
    </>
  )
}
