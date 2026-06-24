# Exasol Repo Catalog — agent plugin

Search and explore all public repositories of the
[`exasol`](https://github.com/exasol) and [`exasol-labs`](https://github.com/exasol-labs)
GitHub organizations from your coding agent.

It connects to a hosted **MCP server** backed by a live, cached catalog
(refreshed every ~6h):

```
https://exasol-repo-explorer.vercel.app/api/mcp
```

### Tools

| Tool | Purpose |
|------|---------|
| `search_repos` | Free-text search with org / language / category / archived filters |
| `get_repo` | Full details for one repository by name |
| `list_categories` | Categories and repo counts |
| `get_stats` | Totals, top languages, last-refreshed time |

---

## Use with Claude Code

Add the marketplace, then install the plugin:

```
/plugin marketplace add appilivamsikrishna/exasol-repo-explorer
/plugin install exasol-repos@exasol-repo-explorer
```

(Replace `appilivamsikrishna/...` with the GitHub repo you publish this to.)

The plugin registers the `exasol-repos` MCP server (HTTP transport) and a skill
that tells Claude when to use it. No local install or API key required.

## Use with OpenAI Codex CLI

Add this block to `~/.codex/config.toml` (or a project-scoped `.codex/config.toml`):

```toml
[mcp_servers.exasol_repos]
url = "https://exasol-repo-explorer.vercel.app/api/mcp"
```

Codex launches the server on session start and exposes its tools alongside the
built-ins. (The `codex mcp add` CLI currently covers stdio servers only, so HTTP
servers are configured in `config.toml`.)

## Use with any other MCP client

Point any MCP-capable client at the streamable-HTTP endpoint:

```
https://exasol-repo-explorer.vercel.app/api/mcp
```

---

The endpoint is public and read-only. Not affiliated with Exasol AG.
