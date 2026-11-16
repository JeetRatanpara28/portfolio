export const BASE = import.meta.env.VITE_API_URL || '/api'

// Admin key: asked once, kept in this browser's localStorage.
const KEY_NAME = 'admin_key'
const getKey = () => { try { return localStorage.getItem(KEY_NAME) || '' } catch { return '' } }
const setKey = (k) => { try { localStorage.setItem(KEY_NAME, k) } catch {} }
export const adminHeaders = () => (getKey() ? { 'X-Admin-Key': getKey() } : {})

// fetch() that asks for the key once if the server answers 401, then retries.
export async function authFetch(url, opts = {}) {
  const send = () => fetch(url, { ...opts, headers: { ...(opts.headers || {}), ...adminHeaders() } })
  let res = await send()
  if (res.status === 401) {
    const k = window.prompt('Enter admin key')
    if (k) { setKey(k.trim()); res = await send() }
  }
  return res
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
