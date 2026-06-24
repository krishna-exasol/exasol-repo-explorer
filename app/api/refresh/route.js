import { refreshCatalog } from '@/lib/catalog'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Triggered by Vercel Cron (see vercel.json) or manually with the secret.
// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // no secret configured (e.g. local dev) -> allow
  return request.headers.get('authorization') === `Bearer ${secret}`
}

async function handle(request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  try {
    const catalog = await refreshCatalog()
    return Response.json({
      ok: true,
      count: catalog.repos.length,
      refreshedAt: catalog.refreshedAt,
      persisted: catalog.persisted,
    })
  } catch (e) {
    console.error('refresh failed:', e?.message)
    return Response.json({ ok: false, error: e?.message || 'refresh failed' }, { status: 500 })
  }
}

export async function GET(request) {
  return handle(request)
}

export async function POST(request) {
  return handle(request)
}
