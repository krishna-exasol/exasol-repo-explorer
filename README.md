<div align="center">

# 🔍 Exasol Repo Explorer

**Browse every public repository across the [`exasol`](https://github.com/exasol) and [`exasol-labs`](https://github.com/exasol-labs) GitHub orgs — with live stats cached at the edge.**

<br/>

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://exasol-repo-explorer.vercel.app)
&nbsp;
[![Source](https://img.shields.io/badge/Source-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/krishna-exasol/exasol-repo-explorer)

<br/>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-00E9A3?style=flat-square&logo=upstash&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![MCP](https://img.shields.io/badge/MCP_Server-FF6B35?style=flat-square)

</div>

> **🔗 Live:** https://exasol-repo-explorer.vercel.app &nbsp;·&nbsp; deployed on **Vercel** with stats cached in **Vercel KV (Upstash Redis)**.
> _(Swap in your real `.vercel.app` URL once deployed.)_

---

## Contents

- [How "live" works](#how-live-works)
- [Local development](#local-development)
- [Deploy to Vercel](#deploy-to-vercel)
- [MCP server](#mcp-server)
- [Structure](#structure)

## How "live" works

```
GitHub API ──(Vercel Cron every 6h)──► /api/refresh ──writes──► Upstash Redis
                                                                    │
   Browser ──► page (reads cache) ◄── /api/repos ◄──reads──────────┘
```

- A **Vercel Cron** job calls `/api/refresh` on a schedule (`vercel.json`, every 6h).
  It fetches both orgs from GitHub (~8 API calls) and writes the catalog to Redis.
- The page and `/api/repos` **read from Redis** — fast, no GitHub rate limits.
- If Redis isn't configured (e.g. fresh local clone), everything falls back to the
  bundled snapshot in `lib/seed-repos.json`, so the app always renders.

The header shows a **Live · updated <time>** badge when serving cached data, or
**Snapshot** when serving the bundled fallback.

## Local development

```bash
npm install
cp .env.example .env.local   # optional: add a GITHUB_TOKEN to avoid the 60/hr anon limit
npm run dev                  # http://localhost:3000
```

Without Redis env vars locally, the page serves the seed snapshot. You can still
exercise the live fetch path: `curl http://localhost:3000/api/refresh`
(returns `persisted:false` locally because there's no cache to write to).

## Deploy to Vercel

1. **Push this folder to a Git repo** and import it in Vercel ("New Project").
2. **Add storage:** Project → **Storage** → create an **Upstash Redis** (KV) store and
   connect it. Vercel injects `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
   (legacy `KV_REST_API_URL` / `KV_REST_API_TOKEN` are also supported).
3. **Environment variables** (Project → Settings → Environment Variables):
   - `GITHUB_TOKEN` — a read-only PAT (raises GitHub limit to 5,000/hr). Recommended.
   - `CRON_SECRET` — any random string. Protects `/api/refresh`; Vercel Cron sends it
     automatically as `Authorization: Bearer <secret>`.
4. **Deploy.** The cron in `vercel.json` (`0 */6 * * *`) is registered automatically
   on Pro. After the first cron run (or hit `/api/refresh` once with the secret), the
   site flips from "Snapshot" to "Live".

   Manual refresh:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://<your-app>.vercel.app/api/refresh
   ```

## MCP server

The app also exposes an **MCP (Model Context Protocol) server** at `/api/mcp`, so
AI agents can query the same catalog. Available tools:

- `search_repos` — free-text / org / language / category search
- `get_repo` — full details for one repo by name
- `list_categories` — categories with repo counts
- `get_stats` — totals, per-org counts, stars, top languages, last refresh time

Point an MCP client at `https://<your-app>.vercel.app/api/mcp` (supports both `GET`
and `POST`). The tools read from the same Redis cache / seed fallback as the web UI.

## Structure

```
app/
  page.jsx              # server component: reads cache, renders <Explorer>
  layout.jsx, globals.css
  api/repos/route.js    # public read endpoint (cache → JSON)
  api/refresh/route.js  # cron/manual: GitHub → Redis (secret-protected)
  api/[transport]/route.js # MCP server (search_repos, get_repo, ...)
components/Explorer.jsx # client UI: search / filter / sort / live badge
lib/
  catalog.js            # GitHub fetch, categorization, Redis read/write + seed fallback
  seed-repos.json       # bundled snapshot (fallback + first paint)
vercel.json             # cron schedule
```

Categories are derived heuristically from repo name + description + topics.
Not affiliated with Exasol AG.
