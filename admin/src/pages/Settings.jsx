import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { KeyRound, Fingerprint, ChevronRight, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { auth } from '@/lib/auth'

export default function Settings() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.next !== form.confirm) {
      setError('New passwords do not match')
      return
    }
    if (form.next.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.changePassword(form.current, form.next)
      toast.success('Password updated — please log in again')
      auth.clearToken()
      navigate('/login')
    } catch (err) {
      setError(err?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your login credentials and security</p>
      </div>

      <div className="max-w-lg space-y-6">

        {/* Change password */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeyRound size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Change Password</p>
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'current', label: 'Current password',  ph: '••••••••' },
              { name: 'next',    label: 'New password',      ph: '••••••••' },
              { name: 'confirm', label: 'Confirm new password', ph: '••••••••' },
            ].map(({ name, label, ph }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {label}
                </label>
                <input
                  type="password"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={ph}
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
            ))}

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Biometric shortcut */}
        <button
          onClick={() => navigate('/setup-biometric')}
          className="w-full bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Fingerprint size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Touch ID / Face ID</p>
            <p className="text-xs text-muted-foreground">Register or update your biometric credential</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {/* Security note */}
        <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4">
          <ShieldCheck size={15} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            After changing your password you'll be logged out automatically. Your biometric credential stays active — you'll just need to enter the new password on your next login.
          </p>
        </div>

      </div>
    </div>
  )
}
