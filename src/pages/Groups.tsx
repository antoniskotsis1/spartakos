import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, ChevronRight } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import type { Group } from '../types'
import { groups as initialGroups, athletes, coaches, scheduleSlots } from '../data/dummy'

const coachById = Object.fromEntries(coaches.map(c => [c.id, c]))

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface GroupForm {
  name: string
  ageRange: string
  coachId: string
  color: string
}

const EMPTY_FORM: GroupForm = {
  name: '',
  ageRange: '',
  coachId: coaches[0].id,
  color: '#dea835',
}

export default function Groups() {
  const [groupList, setGroupList] = useState<Group[]>(initialGroups)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<GroupForm>(EMPTY_FORM)
  const [selected, setSelected] = useState<Group | null>(null)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setGroupList(prev => [...prev, { ...form, id: `g${Date.now()}` }])
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  const setField = <K extends keyof GroupForm>(k: K, v: GroupForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const groupAthletes = (gid: string) => athletes.filter(a => a.active && a.groupIds.includes(gid))
  const groupSlots = (gid: string) => scheduleSlots.filter(s => s.groupId === gid)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Groups</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{groupList.length} training groups</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Group
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {groupList.map(g => {
          const members = groupAthletes(g.id)
          const slots = groupSlots(g.id)
          const coach = coachById[g.coachId]
          return (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              className="card text-left hover:border-zinc-700 transition-colors cursor-pointer"
            >
              {/* Color bar */}
              <div className="w-full h-1.5 rounded-full mb-4" style={{ background: g.color }} />
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-zinc-100 text-lg">{g.name}</h3>
                  <p className="text-xs text-zinc-500">{g.ageRange} years</p>
                </div>
                <span
                  className="badge text-xs"
                  style={{ background: g.color + '20', color: g.color, border: `1px solid ${g.color}40` }}
                >
                  {members.length} athletes
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                <Users size={14} />
                <span>{coach?.name ?? 'Unassigned'}</span>
                <Badge variant="zinc">{coach?.role}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {slots.map(s => (
                  <span key={s.id} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">
                    {DAYS[s.day]} {s.startTime}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Group detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} size="lg">
        {selected && (() => {
          const members = groupAthletes(selected.id)
          const slots = groupSlots(selected.id)
          const coach = coachById[selected.coachId]
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
                <span className="text-sm text-zinc-400">{selected.ageRange} yrs · Coach: {coach?.name}</span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Training Schedule</h4>
                <div className="space-y-1.5">
                  {slots.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 bg-zinc-800 rounded-lg text-sm">
                      <span className="w-8 text-zinc-400 font-medium">{DAYS[s.day]}</span>
                      <span className="text-zinc-200">{s.startTime} – {s.endTime}</span>
                      <span className="text-zinc-500 ml-auto text-xs">{s.location}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                  Athletes ({members.length})
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {members.map(a => (
                    <Link
                      key={a.id}
                      to={`/athletes/${a.id}`}
                      onClick={() => setSelected(null)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                        {a.firstName[0]}{a.lastName[0]}
                      </div>
                      <span className="text-sm text-zinc-200">{a.firstName} {a.lastName}</span>
                      <ChevronRight size={14} className="ml-auto text-zinc-600" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* New group modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Group">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Group Name *</label>
            <input className="input" required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Youth" />
          </div>
          <div>
            <label className="label">Age Range</label>
            <input className="input" value={form.ageRange} onChange={e => setField('ageRange', e.target.value)} placeholder="e.g. 10–13" />
          </div>
          <div>
            <label className="label">Assigned Coach</label>
            <select className="input" value={form.coachId} onChange={e => setField('coachId', e.target.value)}>
              {coaches.map(c => <option key={c.id} value={c.id}>{c.name} – {c.role}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={e => setField('color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer p-0.5" />
              <span className="text-sm text-zinc-400">{form.color}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create Group</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
