export default async function IdeasPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <main><p>Ideas post: {slug} — coming soon</p></main>
}
