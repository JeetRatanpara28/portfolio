import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Field, inputCls, textareaCls } from '@/components/ui/Field'
import { Plus, X, Upload, FileText, CheckCircle } from 'lucide-react'

const EMPTY = {
  name: '', location: '', email: '', github: '',
  linkedin: '', twitter: '', bio: '', status: '', titles: [],
}

export default function Profile() {
  const [form, setForm]           = useState(EMPTY)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [resumeExists, setResumeExists] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    api.getProfile()
      .then(data => setForm({ ...EMPTY, ...data, titles: data.titles || [] }))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
    fetch('/api/resume/exists').then(r => r.json()).then(d => setResumeExists(d.exists)).catch(() => {})
  }, [])

  const uploadResume = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.pdf')) { toast.error('Only PDF files allowed'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setResumeExists(true)
      toast.success(`Resume uploaded (${data.size_kb} KB)`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const addTitle = () => {
    const t = titleInput.trim()
    if (!t) return
    set('titles', [...form.titles, t])
    setTitleInput('')
  }

  const removeTitle = (i) => set('titles', form.titles.filter((_, idx) => idx !== i))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateProfile(form)
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your public portfolio identity</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-sm text-foreground">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jeetkumar Ratanpara" />
            </Field>
            <Field label="Location">
              <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Paris, France" />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" />
            </Field>
            <Field label="Status">
              <input className={inputCls} value={form.status} onChange={e => set('status', e.target.value)} placeholder="Open to work" />
            </Field>
          </div>
          <Field label="Bio">
            <textarea className={textareaCls} rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Short bio shown on your portfolio…" />
          </Field>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm text-foreground">Resume PDF</h2>
          <p className="text-xs text-muted-foreground">Upload your resume — it will be served directly from your server, no Google Drive needed.</p>

          <div className="flex items-center gap-4">
            {resumeExists && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle size={15} />
                <span>Resume uploaded</span>
                <a href="/api/resume/download" target="_blank"
                  className="text-xs underline text-muted-foreground hover:text-foreground">preview</a>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={uploadResume} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-border hover:bg-accent transition-colors disabled:opacity-50">
              <Upload size={14} />
              {uploading ? 'Uploading…' : resumeExists ? 'Replace PDF' : 'Upload PDF'}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm text-foreground">Social Links</h2>
          <div className="grid grid-cols-1 gap-4">
            <Field label="GitHub URL">
              <input className={inputCls} value={form.github} onChange={e => set('github', e.target.value)} placeholder="https://github.com/…" />
            </Field>
            <Field label="LinkedIn URL">
              <input className={inputCls} value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" />
            </Field>
            <Field label="Twitter / X URL">
              <input className={inputCls} value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="https://x.com/…" />
            </Field>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm text-foreground">Typewriter Titles</h2>
          <p className="text-xs text-muted-foreground">These cycle in the animated typewriter on your portfolio.</p>

          <div className="flex flex-wrap gap-2 min-h-8">
            {form.titles.map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                {t}
                <button type="button" onClick={() => removeTitle(i)} className="hover:text-destructive"><X size={12} /></button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className={inputCls}
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTitle())}
              placeholder="e.g. Full Stack Developer"
            />
            <button type="button" onClick={addTitle}
              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-sm hover:bg-secondary/80 transition-colors flex-shrink-0">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
