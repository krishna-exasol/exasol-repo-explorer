import { readCatalog } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

// Public read endpoint. Reads from the Redis cache (or seed fallback).
export async function GET() {
  const catalog = await readCatalog()
  return Response.json(catalog, {
    headers: {
      // Edge/CDN caching: serve cached for 5 min, allow stale while revalidating.
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    },
  })
}
