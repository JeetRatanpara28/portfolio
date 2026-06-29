import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import { Field, inputCls, textareaCls } from '@/components/ui/Field'
import { Plus, Pencil, Trash2, MapPin, Calendar } from 'lucide-react'

const EMPTY = {
  institution: '', degree: '', field_of_study: '', location: '',
  start_date: '', end_date: '', grade: '', current: false, sort_order: 0,
}

export default function Education() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  const load = () => api.getEducation().then(setItems).catch(() => toast.error('Load failed'))
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openNew = () => { setForm(EMPTY); setModal('new') }
  const openEdit = (x) => { setForm({ ...x }); setModal(x) }

  const save = async (e) => {
    e.preventDefault()
    try {
      if (modal === 'new') await api.createEducation(form)
      else await api.updateEducation(modal.id, form)
      toast.success('Saved'); setModal(null); load()
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete this education entry?')) return
    try { await api.deleteEducation(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Education</h1>
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
              <h3 className="font-medium text-sm text-foreground mb-0.5">
                {x.degree}{x.field_of_study ? ` — ${x.field_of_study}` : ''}
              </h3>
              <p className="text-xs text-primary font-medium mb-1.5">{x.institution}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {x.location && <span className="flex items-center gap-1"><MapPin size={11} />{x.location}</span>}
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {x.start_date} {x.end_date ? `— ${x.end_date}` : x.current ? '— Present' : ''}
                </span>
                {x.grade && <span>· {x.grade}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(x)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil size={15} /></button>
              <button onClick={() => del(x.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'New Education' : 'Edit Education'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <Field label="Institution">
            <input className={inputCls} value={form.institution || ''} onChange={e => set('institution', e.target.value)} placeholder="University of Technology" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Degree">
              <input className={inputCls} value={form.degree || ''} onChange={e => set('degree', e.target.value)} placeholder="Master's / Bachelor's" required />
            </Field>
            <Field label="Field of Study">
              <input className={inputCls} value={form.field_of_study || ''} onChange={e => set('field_of_study', e.target.value)} placeholder="Computer Science" />
            </Field>
            <Field label="Location">
              <input className={inputCls} value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Paris, France" />
            </Field>
            <Field label="Grade / GPA">
              <input className={inputCls} value={form.grade || ''} onChange={e => set('grade', e.target.value)} placeholder="3.9 / 4.0 · Distinction" />
            </Field>
            <Field label="Start Date">
              <input className={inputCls} value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} placeholder="Sep 2020" />
            </Field>
            <Field label="End Date">
              <input className={inputCls} value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} placeholder="Jun 2022" disabled={form.current} />
            </Field>
            <Field label="Sort Order">
              <input className={inputCls} type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', +e.target.value)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={!!form.current} onChange={e => set('current', e.target.checked)} className="rounded accent-primary" />
            Currently studying here
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
