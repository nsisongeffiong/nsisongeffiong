export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <main><p>Edit post {id} — coming soon</p></main>
}
