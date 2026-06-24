---
name: exasol-repos
description: Find the right Exasol open-source project. Use when the user asks which Exasol driver, connector, virtual schema, extension, library, or example to use, or wants to explore/compare repositories in the exasol or exasol-labs GitHub organizations.
---

# Exasol Repository Catalog

This skill helps locate the right project in the Exasol open-source ecosystem
(the `exasol` and `exasol-labs` GitHub organizations) using the `exasol-repos`
MCP server bundled with this plugin.

## Available tools

- `search_repos` — free-text search with filters (org, language, category, archived).
- `get_repo` — full details for one repository by name (e.g. `pyexasol`).
- `list_categories` — the catalog's categories and counts.
- `get_stats` — totals, top languages, and when the data was last refreshed.

## How to use

1. For "which X should I use" questions, call `search_repos` with a focused
   `query` (e.g. `"snowflake virtual schema"`, `"go driver"`, `"dbt"`). Add
   `language` or `category` filters to narrow results.
2. Prefer **non-archived** repos unless the user wants legacy options; set
   `include_archived: false` to hide archived ones.
3. When recommending a single project, call `get_repo` to surface its
   description, stars, language, and URL.
4. Use `list_categories` first if you need to understand how the ecosystem is
   organized (Drivers & Connectivity, Virtual Schemas, AI / ML / Agentic, etc.).

## Notes

- Star counts and metadata are a live snapshot refreshed every ~6 hours.
- Always cite the repository `url` so the user can open it on GitHub.
