import { auth } from './auth'

const BASE = '/api'

function headers() {
  const token = auth.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (res.status === 401) {
    auth.clearToken()
    window.location.href = '/login'
    return
  }
  if (!res.ok) {
    let detail = `${method} ${path} → ${res.status}`
    try { const b = await res.json(); if (b.detail) detail += `: ${b.detail}` } catch {}
    throw new Error(detail)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Auth
  login: (username, password) =>
    request('POST', '/auth/login', { username, password }),
  changePassword: (current_password, new_password) =>
    request('PUT', '/auth/change-password', { current_password, new_password }),

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

  // WebAuthn / Passkeys
  webauthnHasCredential: (username)       => request('GET',  `/auth/webauthn/has-credential/${username}`),
  webauthnRegisterBegin: (username)       => request('POST', '/auth/webauthn/register/begin', { username }),
  webauthnRegisterComplete: (username, credential) =>
    request('POST', '/auth/webauthn/register/complete', { username, credential }),
  webauthnLoginBegin:    (username)       => request('POST', '/auth/webauthn/login/begin', { username }),
  webauthnLoginComplete: (username, credential) =>
    request('POST', '/auth/webauthn/login/complete', { username, credential }),

  // WebAuthn with explicit token — used during first-time setup inside the login flow
  // (the permanent token isn't stored yet at this point)
  webauthnRegisterBeginWithToken: (token, username) =>
    _requestWithToken(token, 'POST', '/auth/webauthn/register/begin', { username }),
  webauthnRegisterCompleteWithToken: (token, username, credential) =>
    _requestWithToken(token, 'POST', '/auth/webauthn/register/complete', { username, credential }),
}

async function _requestWithToken(token, method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    let detail = `${method} ${path} → ${res.status}`
    try { const b = await res.json(); if (b.detail) detail += `: ${b.detail}` } catch {}
    throw new Error(detail)
  }
  return res.json()
}
