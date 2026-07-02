#!/usr/bin/env node
/**
 * Generates a valid yarn.lock v1 from node_modules/.package-lock.json.
 *
 * The tricky part: the same package can be installed at multiple versions
 * (e.g. react-is@16 for prop-types, react-is@18 for recharts). yarn.lock
 * needs each "name@range" key mapped to the version that actually satisfies
 * it. We resolve that exactly the way npm/node does: for a dependency
 * declared by a package at some node_modules path, walk up the nested
 * node_modules chain and use the first matching installation found.
 */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const semver = require('semver')

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const NM_LOCK = path.join(ROOT, 'node_modules', '.package-lock.json')
const nmLock = JSON.parse(fs.readFileSync(NM_LOCK, 'utf8'))
const pkgs = nmLock.packages ?? {}

// The hidden .package-lock.json lists only installed packages under
// node_modules/ — it does NOT include the root project itself. So we read
// the root's direct dependencies straight from package.json; otherwise a
// root dep that nothing else depends on (e.g. date-fns) never gets an entry.
const ROOT_PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const rootDeps = { ...ROOT_PKG.dependencies, ...ROOT_PKG.devDependencies }

// ── Resolve a dependency the way Node's module resolution does ─────────────
// parentPath: the key of the requiring package ("" for root, or
//   "node_modules/foo", "node_modules/foo/node_modules/bar", ...).
// Returns the packages-map key of the resolved installation, or null.
function resolveDep(parentPath, depName) {
  // Build the chain of candidate directories, from most-nested to root.
  // Start inside the parent's own node_modules, then climb up removing the
  // last "node_modules/<pkg>" segment each time.
  let base = parentPath
  const candidates = []
  while (true) {
    const prefix = base ? `${base}/node_modules/` : 'node_modules/'
    candidates.push(`${prefix}${depName}`)
    if (!base) break
    // Strip the trailing "/node_modules/<pkg>" to climb one level up.
    const idx = base.lastIndexOf('node_modules/')
    if (idx === -1) { base = ''; continue }
    base = base.slice(0, idx).replace(/\/$/, '')
  }
  for (const c of candidates) {
    if (pkgs[c] && pkgs[c].resolved && pkgs[c].integrity) return c
  }
  return null
}

// ── Collect every (name@range) → resolved installation ─────────────────────
// Grouped by the resolved installation key so aliases that share a version
// end up in one lockfile block.
const byInstall = new Map() // installKey → { meta, ranges:Set, name }

function record(name, range, installKey) {
  const meta = pkgs[installKey]
  if (!meta) return
  if (!byInstall.has(installKey)) {
    byInstall.set(installKey, { meta, name, key: installKey, ranges: new Set() })
  }
  byInstall.get(installKey).ranges.add(`${name}@${range}`)
}

// Root project's direct dependencies (parentPath = "").
for (const [depName, range] of Object.entries(rootDeps)) {
  const installKey = resolveDep('', depName)
  if (installKey) record(depName, range, installKey)
}

// Every installed package's declared dependencies (transitive).
for (const [parentPath, meta] of Object.entries(pkgs)) {
  const allDeps = {
    ...meta.dependencies,
    ...meta.optionalDependencies,
    ...meta.peerDependencies,
  }
  for (const [depName, range] of Object.entries(allDeps)) {
    const installKey = resolveDep(parentPath, depName)
    if (installKey) record(depName, range, installKey)
    // If unresolved, it's an optional/peer dep not installed — skip silently.
  }
}

// ── Add platform-specific optional deps not installed on THIS machine ──────
// rollup / esbuild declare ~20 platform binaries each as optionalDependencies
// (e.g. @rollup/rollup-darwin-arm64). Only the current platform's binary is
// installed here, so the others are absent from .package-lock.json. A clone
// on a different OS/arch needs its own binary present in the lockfile or yarn
// hits the registry during resolve. These are pinned to exact versions, so we
// fetch each one's metadata from the registry and add a lockfile block.
const REGISTRY = 'https://registry.npmjs.org'

const missingOptional = new Map() // "name@version" → { name, version, requesters:Set }
for (const [, meta] of Object.entries(pkgs)) {
  for (const [dep, range] of Object.entries(meta.optionalDependencies ?? {})) {
    if (resolveDep('', dep)) continue // installed locally, already handled
    const id = `${dep}@${range}`
    if (!missingOptional.has(id)) missingOptional.set(id, { name: dep, range })
  }
}

async function getJSON(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      if (attempt === 3) throw e
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
    }
  }
}

async function fetchManifest({ name, range }) {
  // Exact version → hit the version endpoint directly. If that 404s (range is
  // a real semver range like ~2.3.2), fetch the packument and pick the highest
  // version that satisfies the range.
  let m
  if (semver.valid(range)) {
    m = await getJSON(`${REGISTRY}/${name}/${range}`)
  } else {
    const doc = await getJSON(`${REGISTRY}/${encodeURIComponent(name)}`)
    const version = semver.maxSatisfying(Object.keys(doc.versions), range)
    if (!version) throw new Error(`No version of ${name} satisfies ${range}`)
    m = doc.versions[version]
  }
  return {
    name, version: m.version,
    resolved: m.dist.tarball,
    integrity: m.dist.integrity,
    range,
  }
}

if (missingOptional.size > 0) {
  console.log(`Fetching ${missingOptional.size} platform-specific optional packages from registry…`)
  const items = [...missingOptional.values()]
  const fetched = []
  const CONCURRENCY = 8
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = await Promise.all(items.slice(i, i + CONCURRENCY).map(fetchManifest))
    fetched.push(...batch)
  }
  for (const f of fetched) {
    const installKey = `__optional__/${f.name}` // synthetic key, not a real path
    byInstall.set(installKey, {
      meta: { version: f.version, resolved: f.resolved, integrity: f.integrity, dependencies: {} },
      name: f.name,
      key: installKey,
      ranges: new Set([`${f.name}@${f.range}`]),
    })
  }
}

// ── Emit yarn.lock ─────────────────────────────────────────────────────────
let out = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1\n\n`

const blocks = [...byInstall.values()].sort((a, b) => {
  const ra = [...a.ranges].sort()[0]
  const rb = [...b.ranges].sort()[0]
  return ra.localeCompare(rb)
})

// Set of every "name@range" that exists as a lockfile key, so we only emit
// sub-dependency lines that yarn can actually resolve.
const allKeys = new Set()
for (const b of byInstall.values()) for (const r of b.ranges) allKeys.add(r)

const section = (title, entries) => {
  const printable = Object.entries(entries)
    .filter(([dep, ver]) => allKeys.has(`${dep}@${ver}`))
    .sort(([a], [b]) => a.localeCompare(b))
  if (printable.length === 0) return ''
  let s = `  ${title}:\n`
  for (const [dep, ver] of printable) s += `    "${dep}" "${ver}"\n`
  return s
}

for (const block of blocks) {
  const { meta } = block
  const header = [...block.ranges].sort().map(r => `"${r}"`).join(', ')
  out += `${header}:\n`
  out += `  version "${meta.version}"\n`
  out += `  resolved "${meta.resolved}"\n`
  out += `  integrity ${meta.integrity}\n`

  // Real dependencies are hard requirements. optionalDependencies (e.g. the
  // per-platform esbuild/rollup binaries) MUST go in their own section — yarn
  // silently skips the ones whose os/cpu don't match the install platform.
  // Putting a platform binary under `dependencies:` makes yarn treat it as
  // required and fail with "platform X is incompatible with this module".
  out += section('dependencies', meta.dependencies ?? {})
  out += section('optionalDependencies', meta.optionalDependencies ?? {})
  out += '\n'
}

const lockPath = path.join(ROOT, 'yarn.lock')
fs.writeFileSync(lockPath, out)
const totalRanges = [...byInstall.values()].reduce((s, b) => s + b.ranges.size, 0)
console.log(`✓ yarn.lock written: ${blocks.length} blocks, ${totalRanges} range entries`)
