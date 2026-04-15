export default async function PoetryPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <main><p>Poetry post: {slug} — coming soon</p></main>
}
