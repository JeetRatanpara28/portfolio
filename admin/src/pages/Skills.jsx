import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import { Field, inputCls } from '@/components/ui/Field'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

const EMPTY_GROUP = { name: '', color: '#64DCFF', sort_order: 0 }
const EMPTY_SKILL = { name: '', level: 80, group_id: null, sort_order: 0 }

export default function Skills() {
  const [groups, setGroups] = useState([])
  const [expanded, setExpanded] = useState({})
  const [groupModal, setGroupModal] = useState(null)   // null | 'new' | group obj
  const [skillModal, setSkillModal] = useState(null)   // null | { groupId, skill? }
  const [form, setForm] = useState({})

  const load = () => api.getSkills().then(setGroups).catch(() => toast.error('Load failed'))
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  // ── Group modal ──
  const openNewGroup = () => { setForm(EMPTY_GROUP); setGroupModal('new') }
  const openEditGroup = (g) => { setForm({ ...g }); setGroupModal(g) }
  const saveGroup = async (e) => {
    e.preventDefault()
    try {
      if (groupModal === 'new') await api.createGroup(form)
      else await api.updateGroup(groupModal.id, form)
      toast.success('Saved'); setGroupModal(null); load()
    } catch { toast.error('Failed') }
  }
  const deleteGroup = async (id) => {
    if (!confirm('Delete this group and all its skills?')) return
    try { await api.deleteGroup(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  // ── Skill modal ──
  const openNewSkill = (groupId) => { setForm({ ...EMPTY_SKILL, group_id: groupId }); setSkillModal({ groupId }) }
  const openEditSkill = (groupId, skill) => { setForm({ ...skill }); setSkillModal({ groupId, skill }) }
  const saveSkill = async (e) => {
    e.preventDefault()
    try {
      if (skillModal.skill) await api.updateSkill(skillModal.skill.id, form)
      else await api.createSkill(form)
      toast.success('Saved'); setSkillModal(null); load()
    } catch { toast.error('Failed') }
  }
  const deleteSkill = async (id) => {
    if (!confirm('Delete this skill?')) return
    try { await api.deleteSkill(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">{groups.length} groups · {groups.reduce((a, g) => a + g.skills.length, 0)} skills</p>
        </div>
        <button onClick={openNewGroup}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add Group
        </button>
      </div>

      <div className="space-y-3">
        {groups.map(g => (
          <div key={g.id} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-3 px-5 py-3">
              <button onClick={() => toggle(g.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                {expanded[g.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: g.color }} />
              <span className="font-medium text-sm text-foreground flex-1">{g.name}</span>
              <span className="text-xs text-muted-foreground mr-3">{g.skills.length} skills</span>
              <button onClick={() => openNewSkill(g.id)}
                className="text-xs text-primary hover:underline mr-2">+ Add skill</button>
              <button onClick={() => openEditGroup(g)} className="text-muted-foreground hover:text-foreground transition-colors mr-1"><Pencil size={14} /></button>
              <button onClick={() => deleteGroup(g.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
            </div>

            {/* Skills list */}
            {expanded[g.id] && (
              <div className="border-t border-border divide-y divide-border">
                {g.skills.length === 0 && (
                  <p className="px-5 py-3 text-xs text-muted-foreground">No skills yet.</p>
                )}
                {g.skills.map(s => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-2.5">
                    <span className="text-sm text-foreground flex-1">{s.name}</span>
                    <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.level}%`, background: g.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{s.level}%</span>
                    <button onClick={() => openEditSkill(g.id, s)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => deleteSkill(s.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Group Modal */}
      <Modal open={!!groupModal} onClose={() => setGroupModal(null)} title={groupModal === 'new' ? 'New Group' : 'Edit Group'}>
        <form onSubmit={saveGroup} className="space-y-4">
          <Field label="Group Name">
            <input className={inputCls} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Frontend" required />
          </Field>
          <Field label="Color">
            <div className="flex gap-2 items-center">
              <input type="color" value={form.color || '#64DCFF'} onChange={e => set('color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
              <input className={inputCls} value={form.color || ''} onChange={e => set('color', e.target.value)} placeholder="#64DCFF" />
            </div>
          </Field>
          <Field label="Sort Order">
            <input className={inputCls} type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', +e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setGroupModal(null)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
          </div>
        </form>
      </Modal>

      {/* Skill Modal */}
      <Modal open={!!skillModal} onClose={() => setSkillModal(null)} title={skillModal?.skill ? 'Edit Skill' : 'New Skill'}>
        <form onSubmit={saveSkill} className="space-y-4">
          <Field label="Skill Name">
            <input className={inputCls} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. React / Next.js" required />
          </Field>
          <Field label={`Level: ${form.level ?? 80}%`}>
            <input type="range" min="0" max="100" value={form.level ?? 80} onChange={e => set('level', +e.target.value)} className="w-full accent-primary" />
          </Field>
          <Field label="Sort Order">
            <input className={inputCls} type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', +e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setSkillModal(null)} className="px-4 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
