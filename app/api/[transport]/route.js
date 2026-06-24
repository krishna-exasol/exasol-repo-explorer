import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { readCatalog } from '@/lib/catalog'

export const maxDuration = 60

// Compact projection used for list-style results (keeps token use low).
const slim = (r) => ({
  name: r.name,
  org: r.org,
  full_name: r.full_name,
  description: r.description,
  language: r.language,
  stars: r.stars,
  category: r.category,
  archived: r.archived,
  url: r.url,
})

const json = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] })

const handler = createMcpHandler(
  (server) => {
    // -- search_repos ---------------------------------------------------------
    server.registerTool(
      'search_repos',
      {
        title: 'Search Exasol repositories',
        description:
          'Search public repositories of the exasol and exasol-labs GitHub orgs by free-text query (name/description/topics), org, language, or category. Use this to find the right driver, connector, virtual schema, extension, or example for a task.',
        inputSchema: {
          query: z.string().optional().describe('Free-text match on name, description, and topics.'),
          org: z.enum(['exasol', 'exasol-labs', 'all']).optional().describe('Limit to one org. Default: all.'),
          language: z.string().optional().describe('Filter by primary language, e.g. "Java", "Python", "Go".'),
          category: z.string().optional().describe('Filter by category, e.g. "Virtual Schemas", "Drivers & Connectivity".'),
          include_archived: z.boolean().optional().describe('Include archived repos. Default: true.'),
          limit: z.number().int().min(1).max(100).optional().describe('Max results. Default: 20.'),
        },
      },
      async ({ query, org = 'all', language, category, include_archived = true, limit = 20 }) => {
        const { repos } = await readCatalog()
        const needle = (query || '').trim().toLowerCase()
        const results = repos
          .filter((r) => (org === 'all' ? true : r.org === org))
          .filter((r) => (language ? r.language.toLowerCase() === language.toLowerCase() : true))
          .filter((r) => (category ? r.category.toLowerCase() === category.toLowerCase() : true))
          .filter((r) => (include_archived ? true : !r.archived))
          .filter((r) => {
            if (!needle) return true
            return (
              r.name.toLowerCase().includes(needle) ||
              r.description.toLowerCase().includes(needle) ||
              r.topics.join(' ').toLowerCase().includes(needle)
            )
          })
          .slice(0, limit)
          .map(slim)
        return json({ count: results.length, results })
      }
    )

    // -- get_repo -------------------------------------------------------------
    server.registerTool(
      'get_repo',
      {
        title: 'Get one Exasol repository',
        description: 'Return full details for a single repository by name (e.g. "pyexasol"). Optionally disambiguate by org.',
        inputSchema: {
          name: z.string().describe('Repository name, e.g. "pyexasol" or "dbt-exasol".'),
          org: z.enum(['exasol', 'exasol-labs']).optional().describe('Org, if the name exists in both.'),
        },
      },
      async ({ name, org }) => {
        const { repos } = await readCatalog()
        const lc = name.toLowerCase()
        const matches = repos.filter((r) => r.name.toLowerCase() === lc && (org ? r.org === org : true))
        if (matches.length === 0) return json({ error: `No repository named "${name}" found.` })
        return json(matches.length === 1 ? matches[0] : { ambiguous: true, matches })
      }
    )

    // -- list_categories ------------------------------------------------------
    server.registerTool(
      'list_categories',
      {
        title: 'List repository categories',
        description: 'List the catalog categories with repo counts. Useful to understand how the ecosystem is organized before searching.',
        inputSchema: {},
      },
      async () => {
        const { repos } = await readCatalog()
        const counts = {}
        for (const r of repos) counts[r.category] = (counts[r.category] || 0) + 1
        const categories = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count }))
        return json({ categories })
      }
    )

    // -- get_stats ------------------------------------------------------------
    server.registerTool(
      'get_stats',
      {
        title: 'Get catalog statistics',
        description: 'High-level stats: total repos, per-org counts, total stars, archived count, top languages, and when the data was last refreshed.',
        inputSchema: {},
      },
      async () => {
        const { repos, refreshedAt, source } = await readCatalog()
        const byOrg = {}
        const byLang = {}
        let stars = 0
        let archived = 0
        for (const r of repos) {
          byOrg[r.org] = (byOrg[r.org] || 0) + 1
          byLang[r.language] = (byLang[r.language] || 0) + 1
          stars += r.stars
          if (r.archived) archived++
        }
        const topLanguages = Object.entries(byLang)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([language, count]) => ({ language, count }))
        return json({
          total_repos: repos.length,
          by_org: byOrg,
          total_stars: stars,
          archived,
          top_languages: topLanguages,
          data_source: source,
          refreshed_at: refreshedAt,
        })
      }
    )
  },
  {},
  { basePath: '/api', maxDuration: 60 }
)

export { handler as GET, handler as POST }
