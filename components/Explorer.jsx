'use client'

import { useMemo, useState } from 'react'

// ---- Helpers ----------------------------------------------------------------

const LANG_COLORS = {
  Java: '#b07219', Python: '#3572A5', Go: '#00ADD8', Lua: '#000080',
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Rust: '#dea584', 'C#': '#178600',
  PLSQL: '#dad8d8', Scala: '#c22d40', 'C++': '#f34b7d', Shell: '#89e051',
  Dockerfile: '#384d54', HTML: '#e34c26', CSS: '#563d7c', Clojure: '#db5855',
  'Jupyter Notebook': '#DA5B0B', Swift: '#F05138', Perl: '#0298c3', MDX: '#fcb32c',
  HCL: '#844FBA', 'Go Template': '#00ADD8', Other: '#64748b',
}
const langDot = (lang) => LANG_COLORS[lang] || LANG_COLORS.Other

const fmtDate = (s) => {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const fmtDateTime = (s) => {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d)) return null
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const uniqueSorted = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b))

// ---- UI atoms ---------------------------------------------------------------

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-900/70 ring-1 ring-slate-800 px-4 py-3">
      <div className="text-2xl font-semibold text-white tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  )
}

function Chip({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ' +
        (active
          ? 'bg-exa-600 text-white ring-1 ring-exa-500'
          : 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:bg-slate-800')
      }
    >
      {children}
      {count != null && (
        <span className={'rounded-full px-1.5 text-xs ' + (active ? 'bg-white/20' : 'bg-slate-800 text-slate-400')}>
          {count}
        </span>
      )}
    </button>
  )
}

function RepoCard({ r }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-xl bg-slate-900/60 ring-1 ring-slate-800 p-4 hover:ring-exa-500 hover:bg-slate-900 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-medium text-slate-400">{r.org}/</span>
          <h3 className="font-semibold text-white truncate group-hover:text-exa-500">{r.name}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-amber-400 text-sm" title="Stars">
          <span>★</span>
          <span className="tabular-nums">{r.stars}</span>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-300 line-clamp-3 min-h-[2.5rem]">
        {r.description || <span className="italic text-slate-500">No description</span>}
      </p>

      <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: langDot(r.language) }} />
          {r.language}
        </span>
        <span title="Last push">↻ {fmtDate(r.pushed_at)}</span>
        {r.archived && <span className="rounded bg-amber-900/40 text-amber-300 px-1.5 py-0.5">archived</span>}
        {r.is_fork && <span className="rounded bg-slate-800 text-slate-400 px-1.5 py-0.5">fork</span>}
      </div>

      <div className="mt-2.5">
        <span className="text-[11px] rounded bg-slate-800/80 text-slate-300 px-2 py-0.5">{r.category}</span>
      </div>
    </a>
  )
}

// ---- Main component ---------------------------------------------------------

const SORTS = {
  stars: { label: 'Stars', fn: (a, b) => b.stars - a.stars },
  recent: { label: 'Recently pushed', fn: (a, b) => (a.pushed_at < b.pushed_at ? 1 : -1) },
  name: { label: 'Name (A–Z)', fn: (a, b) => a.name.localeCompare(b.name) },
  newest: { label: 'Newest', fn: (a, b) => (a.created_at < b.created_at ? 1 : -1) },
}

export default function Explorer({ repos, refreshedAt, source }) {
  const [q, setQ] = useState('')
  const [org, setOrg] = useState('all')
  const [category, setCategory] = useState('all')
  const [language, setLanguage] = useState('all')
  const [sort, setSort] = useState('stars')
  const [showArchived, setShowArchived] = useState(true)

  const languages = useMemo(() => uniqueSorted(repos.map((r) => r.language)), [repos])
  const categories = useMemo(() => {
    const counts = {}
    repos.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [repos])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return repos
      .filter((r) => (org === 'all' ? true : r.org === org))
      .filter((r) => (category === 'all' ? true : r.category === category))
      .filter((r) => (language === 'all' ? true : r.language === language))
      .filter((r) => (showArchived ? true : !r.archived))
      .filter((r) => {
        if (!needle) return true
        return (
          r.name.toLowerCase().includes(needle) ||
          r.description.toLowerCase().includes(needle) ||
          r.topics.join(' ').toLowerCase().includes(needle) ||
          r.language.toLowerCase().includes(needle)
        )
      })
      .sort(SORTS[sort].fn)
  }, [repos, q, org, category, language, sort, showArchived])

  const totalStars = useMemo(() => repos.reduce((s, r) => s + r.stars, 0), [repos])
  const archivedCount = useMemo(() => repos.filter((r) => r.archived).length, [repos])

  const resetFilters = () => { setQ(''); setOrg('all'); setCategory('all'); setLanguage('all'); setShowArchived(true) }
  const hasFilters = q || org !== 'all' || category !== 'all' || language !== 'all' || !showArchived

  const updated = fmtDateTime(refreshedAt)
  const isLive = source === 'redis' || source === 'github'

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <span>🗂️</span> Exasol Repo Explorer
            </h1>
            <span
              className={
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 ' +
                (isLive
                  ? 'bg-emerald-900/30 text-emerald-300 ring-emerald-700/50'
                  : 'bg-slate-800 text-slate-400 ring-slate-700')
              }
              title={updated ? `Last refreshed ${updated}` : 'Bundled snapshot (no live cache configured)'}
            >
              <span className={'h-2 w-2 rounded-full ' + (isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500')} />
              {isLive ? (updated ? `Live · updated ${updated}` : 'Live') : 'Snapshot'}
            </span>
          </div>
          <p className="mt-1 text-slate-400">
            All public repositories across the{' '}
            <a className="text-exa-500 hover:underline" href="https://github.com/exasol" target="_blank" rel="noreferrer">exasol</a>{' '}
            and{' '}
            <a className="text-exa-500 hover:underline" href="https://github.com/exasol-labs" target="_blank" rel="noreferrer">exasol-labs</a>{' '}
            GitHub organizations.
          </p>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Stat label="Repositories" value={repos.length} />
            <Stat label="exasol" value={repos.filter((r) => r.org === 'exasol').length} />
            <Stat label="exasol-labs" value={repos.filter((r) => r.org === 'exasol-labs').length} />
            <Stat label="Total ★" value={totalStars.toLocaleString()} />
            <Stat label="Archived" value={archivedCount} />
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, description, topic, language…"
                className="w-full rounded-lg bg-slate-900 ring-1 ring-slate-800 focus:ring-exa-500 outline-none pl-9 pr-3 py-2 text-sm placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select value={org} onChange={(e) => setOrg(e.target.value)}
                className="rounded-lg bg-slate-900 ring-1 ring-slate-800 px-3 py-2 text-sm outline-none focus:ring-exa-500">
                <option value="all">All orgs</option>
                <option value="exasol">exasol</option>
                <option value="exasol-labs">exasol-labs</option>
              </select>

              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg bg-slate-900 ring-1 ring-slate-800 px-3 py-2 text-sm outline-none focus:ring-exa-500">
                <option value="all">All languages</option>
                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>

              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="rounded-lg bg-slate-900 ring-1 ring-slate-800 px-3 py-2 text-sm outline-none focus:ring-exa-500">
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v.label}</option>)}
              </select>

              <label className="inline-flex items-center gap-2 rounded-lg bg-slate-900 ring-1 ring-slate-800 px-3 py-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-exa-600" />
                Archived
              </label>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Chip active={category === 'all'} onClick={() => setCategory('all')} count={repos.length}>All</Chip>
            {categories.map(([c, n]) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)} count={n}>{c}</Chip>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            Showing <span className="text-white font-medium">{filtered.length}</span> of {repos.length} repositories
          </p>
          {hasFilters && (
            <button onClick={resetFilters} className="text-sm text-exa-500 hover:underline">Clear filters</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No repositories match your filters.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => <RepoCard key={r.full_name} r={r} />)}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500">
          {isLive
            ? <>Live GitHub data cached in Vercel KV{updated ? ` · refreshed ${updated}` : ''}.</>
            : <>Bundled snapshot — set up Upstash Redis + cron for live numbers.</>}{' '}
          Not affiliated with Exasol AG.
        </div>
      </footer>
    </div>
  )
}
