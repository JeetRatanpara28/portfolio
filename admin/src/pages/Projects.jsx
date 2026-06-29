import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import { Field, inputCls, textareaCls } from '@/components/ui/Field'
import { Plus, Pencil, Trash2, ExternalLink, Github } from 'lucide-react'

const EMPTY = {
  title: '', description: '', tech: [], github_url: '',
  live_url: '', accent: '#64DCFF', label: '', featured: false, sort_order: 0,
}

// Display tech array as comma string in the form, parse back on save
function techToString(tech) { return Array.isArray(tech) ? tech.join(', ') : '' }
function stringToTech(str) { return str.split(',').map(s => s.trim()).filter(Boolean) }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [techStr, setTechStr] = useState('')

  const load = () => api.getProjects().then(setProjects).catch(() => toast.error('Load failed'))
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openNew = () => { setForm(EMPTY); setTechStr(''); setModal('new') }
  const openEdit = (p) => { setForm({ ...p }); setTechStr(techToString(p.tech)); setModal(p) }

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, tech: stringToTech(techStr) }
    try {
      if (modal === 'new') await api.createProject(payload)
      else await api.updateProject(modal.id, payload)
      toast.success('Saved'); setModal(null); load()
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete this project?')) return
    try { await api.deleteProject(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} projects total</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl px-5 py-4 flex gap-4">
            <div className="w-3 rounded-full flex-shrink-0 my-1" style={{ background: p.accent || '#64DCFF' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm text-foreground truncate">{p.title}</h3>
                {p.label && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{p.label}</span>}
                {p.featured && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Featured</span>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {(p.tech || []).map((t, i) => (
                  <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Github size={15} /></a>}
              {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><ExternalLink size={15} /></a>}
              <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground transition-colors ml-1"><Pencil size={15} /></button>
              <button onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'New Project' : 'Edit Project'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <Field label="Title">
            <input className={inputCls} value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Project name" required />
          </Field>
          <Field label="Description">
            <textarea className={textareaCls} rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="What this project does…" />
          </Field>
          <Field label="Tech Stack" hint="Comma-separated: React, FastAPI, PostgreSQL">
            <input className={inputCls} value={techStr} onChange={e => setTechStr(e.target.value)} placeholder="React, FastAPI, PostgreSQL" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="GitHub URL">
              <input className={inputCls} value={form.github_url || ''} onChange={e => set('github_url', e.target.value)} placeholder="https://github.com/…" />
            </Field>
            <Field label="Live URL">
              <input className={inputCls} value={form.live_url || ''} onChange={e => set('live_url', e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Accent Color">
              <div className="flex gap-2 items-center">
                <input type="color" value={form.accent || '#64DCFF'} onChange={e => set('accent', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
                <input className={inputCls} value={form.accent || ''} onChange={e => set('accent', e.target.value)} placeholder="#64DCFF" />
              </div>
            </Field>
            <Field label="Label" hint="e.g. ML, IoT, Web">
              <input className={inputCls} value={form.label || ''} onChange={e => set('label', e.target.value)} placeholder="Web / ML / IoT" />
            </Field>
            <Field label="Sort Order">
              <input className={inputCls} type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', +e.target.value)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={!!form.featured} onChange={e => set('featured', e.target.checked)} className="rounded accent-primary" />
            Featured project
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
