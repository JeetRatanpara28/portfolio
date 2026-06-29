const BASE_URL = '/api'

export async function getProfile() {
  const [profile, resumeCheck] = await Promise.all([
    fetch(`${BASE_URL}/profile/`).then(r => r.ok ? r.json() : null),
    fetch(`${BASE_URL}/resume/exists`).then(r => r.ok ? r.json() : { exists: false }),
  ])
  return { ...profile, resume_exists: resumeCheck.exists }
}

export async function getSkills() {
  const res = await fetch(`${BASE_URL}/skills/`)
  if (!res.ok) throw new Error('Failed to fetch skills')
  return res.json()
}

export async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects/`)
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

export async function getExperience() {
  const res = await fetch(`${BASE_URL}/experience/`)
  if (!res.ok) throw new Error('Failed to fetch experience')
  return res.json()
}

export async function getEducation() {
  const res = await fetch(`${BASE_URL}/education/`)
  if (!res.ok) throw new Error('Failed to fetch education')
  return res.json()
}

export async function getCertifications() {
  const res = await fetch(`${BASE_URL}/certifications/`)
  if (!res.ok) throw new Error('Failed to fetch certifications')
  return res.json()
}