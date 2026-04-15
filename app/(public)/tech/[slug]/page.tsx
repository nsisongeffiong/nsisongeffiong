export default async function TechPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <main><p>Tech post: {slug} — coming soon</p></main>
}
