export const BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * GET a JSON endpoint without ever hanging the page.
 *  - 1st try gives up after 3 s (the page is already showing fallback data, so nobody waits)
 *  - network errors, timeouts and 5xx get ONE quiet retry with a longer limit, because a
 *    serverless cold start is usually warm by then
 *  - 4xx (e.g. no profile yet) fail immediately: retrying won't help
 */
export async function fetchJSON(path, timeouts = [3000, 10000]) {
  let lastError
  for (const ms of timeouts) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), ms)
    try {
      const res = await fetch(`${BASE_URL}${path}`, { signal: ctrl.signal })
      if (res.ok) return await res.json()
      lastError = new Error(`${path} → ${res.status}`)
      if (res.status < 500) break
    } catch (e) {
      lastError = e
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}
