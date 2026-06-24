import { readCatalog } from '@/lib/catalog'
import Explorer from '@/components/Explorer'

// Re-render (re-read cache) at most every 5 minutes.
export const revalidate = 300

export default async function Page() {
  const catalog = await readCatalog()
  return <Explorer repos={catalog.repos} refreshedAt={catalog.refreshedAt} source={catalog.source} />
}
