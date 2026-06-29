const TOKEN_KEY = 'admin_token'

export const auth = {
  getToken:   () => localStorage.getItem(TOKEN_KEY),
  setToken:   (t) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),

  /** Decode the JWT sub claim without verifying — safe for display only. */
  getUsername: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    try {
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(atob(b64))?.sub ?? null
    } catch {
      return null
    }
  },
}
