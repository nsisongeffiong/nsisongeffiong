import { renderPostOgImage, ogSize, ogContentType } from '@/lib/og/post-image'

export const runtime = 'nodejs'
export const size = ogSize
export const contentType = ogContentType

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return renderPostOgImage('ideas', slug)
}
