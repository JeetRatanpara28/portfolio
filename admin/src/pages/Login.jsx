import { useState, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { api } from '@/lib/api'
import { auth } from '@/lib/auth'

// ── Fingerprint SVG ──────────────────────────────────────────────────────────
function FingerprintIcon({ state }) {
  const color = state === 'success' ? '#22c55e'
              : state === 'error'   ? '#ef4444'
              : '#60a5fa'
  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      {state === 'scanning' && <>
        <div className="pulse-ring absolute rounded-full border-2 border-blue-400/40"
          style={{ width: 110, height: 110 }} />
        <div className="pulse-ring absolute rounded-full border-2 border-blue-400/25"
          style={{ width: 140, height: 140, animationDelay: '0.45s' }} />
        <div className="pulse-ring absolute rounded-full border-2 border-blue-400/15"
          style={{ width: 170, height: 170, animationDelay: '0.9s' }} />
      </>}
      <div className="relative" style={{ width: 80, height: 80 }}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 36 C8 18 20 8 32 8 C44 8 56 18 56 36"   stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M14 40 C14 24 22 16 32 16 C42 16 50 24 50 40" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M20 44 C20 30 25 22 32 22 C39 22 44 30 44 44" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M26 48 C26 36 28 28 32 28 C36 28 38 36 38 48" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
          <circle cx="32" cy="34" r="2.5" fill={color} opacity="0.9" />
        </svg>
        {state === 'scanning' && (
          <div className="scan-line absolute left-1 right-1 h-px rounded-full"
            style={{ background: color, opacity: 0.7 }} />
        )}
      </div>
    </div>
  )
}

// ── Shared card styles ────────────────────────────────────────────────────────
const cardStyle = {
  maxWidth: 380,
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 24,
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(59,130,246,0.06)',
  padding: '2.25rem 2rem 2rem',
}

const btnPrimary = (disabled) => ({
  width: '100%', padding: '11px 0', borderRadius: 12, border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600,
  color: '#fff',
  background: disabled ? 'rgba(99,102,241,0.35)' : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
  boxShadow: disabled ? 'none' : '0 0 32px rgba(99,102,241,0.4)',
  opacity: disabled ? 0.7 : 1, transition: 'opacity 0.2s',
})

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()

  // step: 'credentials' → 'setup' (first-time) or 'biometric' (returning)
  const [step, setStep]         = useState('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [fpState, setFpState]   = useState('idle') // idle | scanning | success | error
  const [shaking, setShaking]   = useState(false)

  // Holds the password-step JWT temporarily — only written to auth after biometric passes
  const pendingToken = useRef(null)

  if (auth.isLoggedIn()) return <Navigate to="/" replace />

  const triggerShake = () => { setShaking(true); setTimeout(() => setShaking(false), 450) }
  const showError = (msg) => { setError(msg); triggerShake() }

  // ── Step 1: password ──────────────────────────────────────────────────────
  const handleCredentials = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(username, password)
      if (!data?.access_token) throw new Error('bad response')
      pendingToken.current = data.access_token  // store temporarily, NOT in auth yet

      const { has_credential } = await api.webauthnHasCredential(username)
      if (has_credential) {
        setStep('biometric')
        // Do NOT auto-trigger — browser requires a real button click for Touch ID
      } else {
        // No biometric registered yet — force enrollment before granting access
        setStep('setup')
      }
    } catch {
      showError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2a: first-time biometric setup (mandatory) ───────────────────────
  const handleSetup = async () => {
    setFpState('scanning')
    setError('')
    try {
      const options    = await api.webauthnRegisterBeginWithToken(pendingToken.current, username)
      const credential = await startRegistration(options)
      await api.webauthnRegisterCompleteWithToken(pendingToken.current, username, credential)
      // Registration done — immediately run the auth step
      setStep('biometric')
      triggerBiometric()
    } catch (err) {
      setFpState('idle')
      const msg = err?.name === 'NotAllowedError'
        ? 'Touch ID cancelled — try again'
        : `Setup failed: ${err?.message || 'unknown error'}`
      showError(msg)
    }
  }

  // ── Step 2b: biometric auth ───────────────────────────────────────────────
  const triggerBiometric = async () => {
    setFpState('scanning')
    setError('')
    try {
      const options    = await api.webauthnLoginBegin(username)
      const credential = await startAuthentication(options)
      const result     = await api.webauthnLoginComplete(username, credential)
      if (!result?.access_token) throw new Error('no token')
      auth.setToken(result.access_token)   // ← only NOW we grant access
      setFpState('success')
      setTimeout(() => navigate('/'), 700)
    } catch (err) {
      setFpState('error')
      const msg = err?.name === 'NotAllowedError'
        ? 'Touch ID cancelled — try again'
        : 'Biometric check failed — try again'
      showError(msg)
      setTimeout(() => setFpState('idle'), 1800)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{ background: '#07080f' }}>

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="login-blob-1 absolute rounded-full"
          style={{ width: 640, height: 640, top: '-12%', left: '-18%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        <div className="login-blob-2 absolute rounded-full"
          style={{ width: 520, height: 520, bottom: '-8%', right: '-12%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)' }} />
        <div className="login-blob-3 absolute rounded-full"
          style={{ width: 380, height: 380, top: '38%', right: '22%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }} />
      </div>

      {/* Card */}
      <div className={`login-card relative w-full mx-4 ${shaking ? 'login-shake' : ''}`}
        style={cardStyle}>

        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>J</span>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
              Jeet Admin
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Portfolio Dashboard</p>
          </div>
        </div>

        {/* ── STEP 1: credentials ── */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentials} className="step-in">
            <div className="mb-5">
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Welcome back</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 3 }}>
                Sign in to your dashboard
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Username', type: 'text',     val: username, set: setUsername, ph: 'your@email.com' },
                { label: 'Password', type: 'password', val: password, set: setPassword, ph: '••••••••' },
              ].map(({ label, type, val, set, ph }) => (
                <div key={label}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 }}>
                    {label}
                  </label>
                  <input
                    type={type} value={val} onChange={e => set(e.target.value)}
                    placeholder={ph} required autoFocus={label === 'Username'}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                      padding: '10px 14px', fontSize: 14, color: '#fff', outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.45)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              ))}
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginTop: 10 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ ...btnPrimary(loading), marginTop: 18 }}>
              {loading ? 'Verifying…' : 'Continue →'}
            </button>

            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, textAlign: 'center', marginTop: 14 }}>
              Step 1 of 2 · Touch ID or Face ID required
            </p>
          </form>
        )}

        {/* ── STEP 2a: first-time setup ── */}
        {step === 'setup' && (
          <div className="step-in" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 6 }}>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Set up biometric</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>
                {fpState === 'scanning'
                  ? 'Touch the sensor on your Mac…'
                  : 'You must register Touch ID or Face ID before accessing the dashboard.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <FingerprintIcon state={fpState === 'idle' ? 'idle' : fpState} />
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

            {fpState !== 'scanning' && (
              <button onClick={handleSetup} style={btnPrimary(false)}>
                {fpState === 'error' ? 'Try again' : 'Register Touch ID / Face ID →'}
              </button>
            )}

            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
              Step 2 of 2 · Required to access the dashboard
            </p>
          </div>
        )}

        {/* ── STEP 2b: biometric auth ── */}
        {step === 'biometric' && (
          <div className="step-in" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 6 }}>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>
                {fpState === 'success' ? 'Access granted ✓' : 'Verify it\'s you'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>
                {fpState === 'idle'     && 'Touch the fingerprint sensor on your Mac'}
                {fpState === 'scanning' && 'Waiting for Touch ID…'}
                {fpState === 'success'  && 'Redirecting to dashboard…'}
                {fpState === 'error'    && 'Verification failed — try again'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <FingerprintIcon state={fpState} />
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

            {fpState !== 'scanning' && fpState !== 'success' && (
              <button onClick={triggerBiometric} style={btnPrimary(false)}>
                {fpState === 'error' ? 'Try again' : 'Touch ID →'}
              </button>
            )}

            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
              Step 2 of 2 · Biometric required
            </p>
          </div>
        )}

        {/* Bottom glow line */}
        <div style={{
          position: 'absolute', bottom: 0, left: '25%', right: '25%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
          borderRadius: 1,
        }} />
      </div>
    </div>
  )
}
