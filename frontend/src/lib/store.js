/**
 * Tiny shared data store — stale-while-revalidate.
 *
 *  1. First paint uses the last good API response (localStorage) or, on a first visit, the
 *     static fallback in src/data/fallback.js — so the page is never empty.
 *  2. The API is queried once in the background; each answer replaces its slice of data.
 *  3. A failing/slow API changes nothing visible.
 */
import { useSyncExternalStore } from 'react'
import fallback from '../data/fallback'
import { fetchJSON } from './api'

const CACHE_KEY = 'portfolio-data-v1'

const hasValue = (v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)

// Keep the first occurrence of each key (case-insensitive)
function dedupe(list, keyOf) {
  const seen = new Set()
  return list.filter((item) => {
    const k = String(keyOf(item)).trim().toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const normalize = {
  // empty API fields never wipe out fallback values
  profile: (api) => {
    const out = { ...fallback.profile }
    for (const [k, v] of Object.entries(api || {})) if (hasValue(v) || typeof v === 'boolean') out[k] = v
    return out
  },
  skillGroups: (api) =>
    (Array.isArray(api) && api.length ? api : fallback.skillGroups)
      .map((g) => ({ ...g, skills: dedupe(g.skills || [], (s) => s.name) }))
      .filter((g) => g.skills.length),
  projects: (api) => (Array.isArray(api) && api.length ? api : fallback.projects),
  experience: (api) => (Array.isArray(api) && api.length ? api : fallback.experience),
  education: (api) => (Array.isArray(api) && api.length ? api : fallback.education),
  certifications: (api) => dedupe(Array.isArray(api) && api.length ? api : fallback.certifications, (c) => c.name),
}

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY))
    return c && typeof c === 'object' ? c : {}
  } catch { return {} }
}
function writeCache(raw) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(raw)) } catch { /* private mode etc. */ }
}

// raw = last API answers (per slice); state = what components render
let raw = readCache()
const build = () => Object.fromEntries(Object.keys(normalize).map((k) => [k, normalize[k](raw[k])]))
let state = build()

const listeners = new Set()
const subscribe = (fn) => { listeners.add(fn); sync(); return () => listeners.delete(fn) }

function set(key, value) {
  raw = { ...raw, [key]: value }
  writeCache(raw)
  state = { ...state, [key]: normalize[key](value) }   // only this slice changes identity
  listeners.forEach((l) => l())
}

let started = false
function sync() {
  if (started) return
  started = true
  const slice = (key, path) =>
    fetchJSON(path).then((data) => set(key, data)).catch(() => { /* keep what we have */ })

  slice('skillGroups', '/skills/')
  slice('projects', '/projects/')
  slice('experience', '/experience/')
  slice('education', '/education/')
  slice('certifications', '/certifications/')

  // profile = /profile + /resume/exists (needed for the "Download Resume" button)
  Promise.allSettled([fetchJSON('/profile/'), fetchJSON('/resume/exists')]).then(([p, r]) => {
    if (p.status !== 'fulfilled' && r.status !== 'fulfilled') return
    set('profile', {
      ...(p.status === 'fulfilled' ? p.value : raw.profile),
      ...(r.status === 'fulfilled' ? { resume_exists: !!r.value?.exists } : {}),
    })
  })
}

const useSlice = (key) => useSyncExternalStore(subscribe, () => state[key], () => state[key])

export const useProfile = () => useSlice('profile')
export const useSkillGroups = () => useSlice('skillGroups')
export const useProjects = () => useSlice('projects')
export const useExperience = () => useSlice('experience')
export const useEducation = () => useSlice('education')
export const useCertifications = () => useSlice('certifications')
