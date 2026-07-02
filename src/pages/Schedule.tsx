import { useState } from 'react'
import { Plus, Trash2, Clock, MapPin } from 'lucide-react'
import Modal from '../components/ui/Modal'
import type { ScheduleSlot } from '../types'
import { scheduleSlots as initialSlots, groups, coaches } from '../data/dummy'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WORK_DAYS = [1, 2, 3, 4, 5, 6] // Mon–Sat

const groupById = Object.fromEntries(groups.map(g => [g.id, g]))
const coachById = Object.fromEntries(coaches.map(c => [c.id, c]))

interface ScheduleForm {
  groupId: string
  day: number
  startTime: string
  endTime: string
  location: string
}

const EMPTY_FORM: ScheduleForm = {
  groupId: groups[0]?.id ?? '',
  day: 1,
  startTime: '17:00',
  endTime: '18:30',
  location: 'Mat Room A',
}

export default function Schedule() {
  const [slots, setSlots] = useState<ScheduleSlot[]>(initialSlots)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ScheduleForm>(EMPTY_FORM)
  const [filterGroup, setFilterGroup] = useState('all')

  const filtered = filterGroup === 'all' ? slots : slots.filter(s => s.groupId === filterGroup)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setSlots(prev => [...prev, { ...form, id: `s${Date.now()}` }])
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  const handleDelete = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  const setField = <K extends keyof ScheduleForm>(k: K, v: ScheduleForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const slotsByDay = (day: number) =>
    filtered.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Schedule</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Weekly training schedule</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-auto" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="all">All Groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Session
          </button>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {WORK_DAYS.map(day => {
          const daySlots = slotsByDay(day)
          return (
            <div key={day} className="min-h-32">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 px-1">
                {DAYS_SHORT[day]}
              </div>
              <div className="space-y-2">
                {daySlots.length === 0 ? (
                  <div className="h-10 border border-dashed border-zinc-800 rounded-lg" />
                ) : (
                  daySlots.map(slot => {
                    const group = groupById[slot.groupId]
                    return (
                      <div
                        key={slot.id}
                        className="rounded-lg p-2.5 border text-xs relative group/slot"
                        style={{
                          background: (group?.color ?? '#71717a') + '15',
                          borderColor: (group?.color ?? '#71717a') + '40',
                        }}
                      >
                        <p className="font-semibold mb-1" style={{ color: group?.color ?? '#71717a' }}>
                          {group?.name}
                        </p>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <Clock size={10} />
                          {slot.startTime}–{slot.endTime}
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                          <MapPin size={10} />
                          {slot.location}
                        </div>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover/slot:opacity-100 transition-opacity text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* List view */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-100">All Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="th">Group</th>
                <th className="th">Day</th>
                <th className="th">Time</th>
                <th className="th hidden sm:table-cell">Location</th>
                <th className="th hidden md:table-cell">Coach</th>
                <th className="th w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => a.day - b.day || a.startTime.localeCompare(b.startTime)).map(slot => {
                const group = groupById[slot.groupId]
                const coach = coachById[group?.coachId ?? '']
                return (
                  <tr key={slot.id} className="tr">
                    <td className="td">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: group?.color }} />
                        {group?.name}
                      </span>
                    </td>
                    <td className="td">{DAYS[slot.day]}</td>
                    <td className="td">{slot.startTime} – {slot.endTime}</td>
                    <td className="td hidden sm:table-cell text-zinc-400">{slot.location}</td>
                    <td className="td hidden md:table-cell text-zinc-400">{coach?.name}</td>
                    <td className="td">
                      <button onClick={() => handleDelete(slot.id)} className="btn-ghost p-1.5 text-zinc-500 hover:text-red-400">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add session modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Training Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Group *</label>
            <select className="input" required value={form.groupId} onChange={e => setField('groupId', e.target.value)}>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Day *</label>
            <select className="input" value={form.day} onChange={e => setField('day', Number(e.target.value))}>
              {WORK_DAYS.map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Time *</label>
              <input type="time" className="input" required value={form.startTime} onChange={e => setField('startTime', e.target.value)} />
            </div>
            <div>
              <label className="label">End Time *</label>
              <input type="time" className="input" required value={form.endTime} onChange={e => setField('endTime', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Mat Room A" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Session</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
