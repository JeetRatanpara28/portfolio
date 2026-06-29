import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startRegistration } from '@simplewebauthn/browser'
import { api } from '@/lib/api'
import { auth } from '@/lib/auth'
import { toast } from 'sonner'
import { ShieldCheck, Fingerprint, AlertCircle, ChevronLeft } from 'lucide-react'

export default function BiometricSetup() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('intro') // 'intro' | 'scanning' | 'done'
  const [error, setError] = useState('')

  // Read username from JWT — stays in sync with whoever is logged in
  const username = auth.getUsername() || 'admin'

  const register = async () => {
    setPhase('scanning')
    setError('')
    try {
      // Begin — server returns WebAuthn options (requires auth token)
      const options    = await api.webauthnRegisterBegin(username)
      // Browser prompts Touch ID / Face ID
      const credential = await startRegistration(options)
      // Complete — send attestation to server
      await api.webauthnRegisterComplete(username, credential)
      setPhase('done')
      toast.success('Biometric registered! You can now log in with Touch ID.')
    } catch (err) {
      setPhase('intro')
      const msg = err?.name === 'NotAllowedError'
        ? 'Touch ID cancelled. Try again when you\'re ready.'
        : err?.message?.includes('already registered')
        ? 'This credential is already registered.'
        : `Registration failed: ${err?.message || 'unknown error'}`
      setError(msg)
    }
  }

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ChevronLeft size={16} /> Back to dashboard
      </button>

      <div className="max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Biometric Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register your fingerprint or Face ID to secure your admin access.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-3">
          {[
            { icon: ShieldCheck, title: 'Bank-grade security', desc: 'Your biometric never leaves your device. Apple\'s Secure Enclave handles everything.' },
            { icon: Fingerprint, title: 'Works on Mac + iPhone', desc: 'Use Touch ID on your MacBook Air or Face ID in Safari on your iPhone.' },
            { icon: ShieldCheck, title: 'Replaces nothing — adds a layer', desc: 'Password is still required first. Biometric is the second factor.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* State display */}
        {phase === 'scanning' && (
          <div className="bg-card border border-border rounded-xl p-8 text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="pulse-ring absolute inset-0 rounded-full border-2 border-primary/30" style={{ margin: -10 }} />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Fingerprint size={32} className="text-primary" />
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">Waiting for Touch ID…</p>
            <p className="text-xs text-muted-foreground mt-1">Touch the fingerprint sensor on your Mac</p>
          </div>
        )}

        {phase === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} className="text-green-600" />
            </div>
            <p className="text-sm font-semibold text-green-800">Biometric registered!</p>
            <p className="text-xs text-green-600 mt-1">
              Your next login will prompt for Touch ID after the password step.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
            <AlertCircle size={15} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {phase !== 'done' && (
            <button onClick={register} disabled={phase === 'scanning'}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {phase === 'scanning' ? 'Waiting…' : 'Register Touch ID / Face ID'}
            </button>
          )}
          {phase === 'done' && (
            <button onClick={() => navigate('/')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Done — back to dashboard →
            </button>
          )}
        </div>

        {phase === 'intro' && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Works in Safari and Chrome on macOS. iPhone requires Safari + same domain.
          </p>
        )}
      </div>
    </div>
  )
}
