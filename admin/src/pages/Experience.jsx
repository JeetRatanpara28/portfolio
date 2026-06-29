import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import { Field, inputCls, textareaCls } from '@/components/ui/Field'
import { Plus, Pencil, Trash2, MapPin, Calendar } from 'lucide-react'

const EMPTY = {
  company: '', role: '', location: '', start_date: '',
  end_date: '', current: false, description: '', sort_order: 0,
}

export default function Experience() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  const load = () => api.getExperience().then(setItems).catch(() => toast.error('Load failed'))
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openNew = () => { setForm(EMPTY); setModal('new') }
  const openEdit = (x) => { setForm({ ...x }); setModal(x) }

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, end_date: form.current ? null : form.end_date }
    try {
      if (modal === 'new') await api.createExperience(payload)
      else await api.updateExperience(modal.id, payload)
      toast.success('Saved'); setModal(null); load()
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete this experience entry?')) return
    try { await api.deleteExperience(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Experience</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} entries</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add Entry
        </button>
      </div>

      <div className="space-y-3">
        {items.map(x => (
          <div key={x.id} className="bg-card border border-border rounded-xl px-5 py-4 flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-medium text-sm text-foreground">{x.role}</h3>
                {x.current && <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">Current</span>}
              </div>
              <p className="text-xs text-primary font-medium mb-1.5">{x.company}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                {x.location && <span className="flex items-center gap-1"><MapPin size={11} />{x.location}</span>}
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {x.start_date} — {x.current ? 'Present' : (x.end_date || '—')}
                </span>
              </div>
              {x.description && <p className="text-xs text-muted-foreground line-clamp-2">{x.description}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(x)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil size={15} /></button>
              <button onClick={() => del(x.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'New Experience' : 'Edit Experience'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role / Title">
              <input className={inputCls} value={form.role || ''} onChange={e => set('role', e.target.value)} placeholder="Software Engineer" required />
            </Field>
            <Field label="Company">
              <input className={inputCls} value={form.company || ''} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" required />
            </Field>
            <Field label="Location">
              <input className={inputCls} value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Paris, France" />
            </Field>
            <Field label="Sort Order">
              <input className={inputCls} type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', +e.target.value)} />
            </Field>
            <Field label="Start Date">
              <input className={inputCls} value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} placeholder="Jan 2023" />
            </Field>
            <Field label="End Date">
              <input className={inputCls} value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} placeholder="Dec 2024" disabled={form.current} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={!!form.current} onChange={e => set('current', e.target.checked)} className="rounded accent-primary" />
            Currently working here
          </label>
          <Field label="Description">
            <textarea className={textareaCls} rows={4} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="What you did and achieved…" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
