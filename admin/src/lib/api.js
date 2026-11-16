import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

export const BASE = import.meta.env.VITE_API_URL || '/api'

// ── Passkey (Touch ID / Face ID) protection ──────────────
// Reads are public. Every write first asks the device for a biometric check; the server
// answers with a short-lived token that is sent along with the write.
class NeedsSetup extends Error {}

async function postJSON(path, body, headers = {}) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

function friendly(e) {
  // The user dismissed the Touch ID / Face ID sheet
  if (e?.name === 'NotAllowedError' || e?.name === 'AbortError') return new Error('Cancelled — fingerprint / face check not completed')
  return e
}

// Ask the device to prove it's you; returns a write token.
async function getWriteToken() {
  const o = await postJSON('/webauthn/auth/options')
  if (o.status === 409) throw new NeedsSetup()
  if (!o.ok) throw new Error('Could not start the security check')
  const { options, state } = await o.json()
  let credential
  try { credential = await startAuthentication({ optionsJSON: options }) } catch (e) { throw friendly(e) }
  const v = await postJSON('/webauthn/auth/verify', { credential, state })
  if (!v.ok) throw new Error('Security check failed')
  return (await v.json()).token
}

// Add THIS device (Mac Touch ID / iPhone Face ID). Needs the admin key once.
export async function registerDevice() {
  const key = window.prompt('Admin key (needed once to add this device)')
  if (!key) throw new Error('Cancelled')
  const h = { 'X-Admin-Key': key.trim() }
  const o = await postJSON('/webauthn/register/options', undefined, h)
  if (o.status === 401) throw new Error('Wrong admin key')
  if (!o.ok) throw new Error('Could not start device setup')
  const { options, state } = await o.json()
  let credential
  try { credential = await startRegistration({ optionsJSON: options }) } catch (e) { throw friendly(e) }
  const v = await postJSON('/webauthn/register/verify', { credential, state, label: navigator.platform || 'device' }, h)
  if (v.status === 409) throw new Error('This device is already added')
  if (!v.ok) throw new Error('Could not add this device')
}

// fetch() for writes: biometric check first, then the real request with the token.
export async function authFetch(url, opts = {}) {
  const method = (opts.method || 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') return fetch(url, opts)

  let token
  try {
    token = await getWriteToken()
  } catch (e) {
    if (!(e instanceof NeedsSetup)) throw e
    if (!window.confirm('No device is set up yet.\n\nSet up this device now with Touch ID / Face ID?')) {
      throw new Error('Cancelled — no device set up')
    }
    await registerDevice()
    token = await getWriteToken()
  }
  return fetch(url, { ...opts, headers: { ...(opts.headers || {}), 'X-Admin-Token': token } })
}

async function request(method, path, body) {
  const res = await authFetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    let detail = `${method} ${path} → ${res.status}`
    try { const b = await res.json(); if (b.detail) detail += `: ${b.detail}` } catch {}
    throw new Error(detail)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Profile
  getProfile:    ()       => request('GET',  '/profile/'),
  updateProfile: (data)   => request('PUT',  '/profile/', data),

  // Skills
  getSkills:     ()       => request('GET',  '/skills/'),
  createGroup:   (data)   => request('POST', '/skills/groups', data),
  updateGroup:   (id, d)  => request('PUT',  `/skills/groups/${id}`, d),
  deleteGroup:   (id)     => request('DELETE', `/skills/groups/${id}`),
  createSkill:   (data)   => request('POST', '/skills/', data),
  updateSkill:   (id, d)  => request('PUT',  `/skills/${id}`, d),
  deleteSkill:   (id)     => request('DELETE', `/skills/${id}`),

  // Projects
  getProjects:   ()       => request('GET',  '/projects/'),
  createProject: (data)   => request('POST', '/projects/', data),
  updateProject: (id, d)  => request('PUT',  `/projects/${id}`, d),
  deleteProject: (id)     => request('DELETE', `/projects/${id}`),

  // Experience
  getExperience:    ()      => request('GET',  '/experience/'),
  createExperience: (data)  => request('POST', '/experience/', data),
  updateExperience: (id, d) => request('PUT',  `/experience/${id}`, d),
  deleteExperience: (id)    => request('DELETE', `/experience/${id}`),

  // Education
  getEducation:    ()      => request('GET',  '/education/'),
  createEducation: (data)  => request('POST', '/education/', data),
  updateEducation: (id, d) => request('PUT',  `/education/${id}`, d),
  deleteEducation: (id)    => request('DELETE', `/education/${id}`),

  // Certifications
  getCertifications:    ()      => request('GET',  '/certifications/'),
  createCertification:  (data)  => request('POST', '/certifications/', data),
  updateCertification:  (id, d) => request('PUT',  `/certifications/${id}`, d),
  deleteCertification:  (id)    => request('DELETE', `/certifications/${id}`),

}
