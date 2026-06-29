import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import { Field, inputCls } from '@/components/ui/Field'
import { Plus, Pencil, Trash2, ExternalLink, Award } from 'lucide-react'

const EMPTY = {
  name: '', issuer: '', issued_date: '', expiry_date: '',
  credential_id: '', credential_url: '', pdf_url: '', sort_order: 0,
}

export default function Certifications() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  const load = () => api.getCertifications().then(setItems).catch(() => toast.error('Load failed'))
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openNew = () => { setForm(EMPTY); setModal('new') }
  const openEdit = (x) => { setForm({ ...x }); setModal(x) }

  const save = async (e) => {
    e.preventDefault()
    try {
      if (modal === 'new') await api.createCertification(form)
      else await api.updateCertification(modal.id, form)
      toast.success('Saved'); setModal(null); load()
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete this certification?')) return
    try { await api.deleteCertification(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} certifications</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add Cert
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(x => (
          <div key={x.id} className="bg-card border border-border rounded-xl px-5 py-4 flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Award size={17} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground truncate mb-0.5">{x.name}</h3>
              <p className="text-xs text-primary font-medium mb-1">{x.issuer}</p>
              <div className="text-xs text-muted-foreground">
                {x.issued_date && <span>Issued {x.issued_date}</span>}
                {x.expiry_date && <span> · Expires {x.expiry_date}</span>}
              </div>
              <div className="flex gap-3 mt-2">
                {x.credential_url && (
                  <a href={x.credential_url} target="_blank" rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1">
                    <ExternalLink size={11} /> Verify
                  </a>
                )}
                {x.pdf_url && (
                  <a href={x.pdf_url} target="_blank" rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ExternalLink size={11} /> PDF
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => openEdit(x)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>
              <button onClick={() => del(x.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'New Certification' : 'Edit Certification'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <Field label="Certificate Name">
            <input className={inputCls} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="AWS Certified Solutions Architect" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Issuing Organization">
              <input className={inputCls} value={form.issuer || ''} onChange={e => set('issuer', e.target.value)} placeholder="Amazon Web Services" />
            </Field>
            <Field label="Credential ID">
              <input className={inputCls} value={form.credential_id || ''} onChange={e => set('credential_id', e.target.value)} placeholder="ABC-12345" />
            </Field>
            <Field label="Issue Date">
              <input className={inputCls} value={form.issued_date || ''} onChange={e => set('issued_date', e.target.value)} placeholder="Jan 2024" />
            </Field>
            <Field label="Expiry Date">
              <input className={inputCls} value={form.expiry_date || ''} onChange={e => set('expiry_date', e.target.value)} placeholder="Jan 2027 (leave blank if no expiry)" />
            </Field>
          </div>
          <Field label="Credential URL">
            <input className={inputCls} value={form.credential_url || ''} onChange={e => set('credential_url', e.target.value)} placeholder="https://aws.amazon.com/verify/…" />
          </Field>
          <Field label="PDF URL" hint="Link to a hosted PDF of your certificate">
            <input className={inputCls} value={form.pdf_url || ''} onChange={e => set('pdf_url', e.target.value)} placeholder="https://drive.google.com/…" />
          </Field>
          <Field label="Sort Order">
            <input className={inputCls} type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', +e.target.value)} />
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
