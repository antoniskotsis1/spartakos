import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ChevronRight } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import type { Athlete } from '../types'
import { athletes as initialAthletes, groups } from '../data/dummy'

const groupById = Object.fromEntries(groups.map(g => [g.id, g]))

interface AvatarCircleProps {
  athlete: Athlete
  size?: 'sm' | 'md'
}

function AvatarCircle({ athlete, size = 'md' }: AvatarCircleProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' }
  return (
    <div className={`${sizes[size]} rounded-full bg-zinc-700 flex items-center justify-center font-bold text-zinc-300 flex-shrink-0`}>
      {athlete.firstName[0]}{athlete.lastName[0]}
    </div>
  )
}

interface AthleteForm {
  firstName: string
  lastName: string
  dob: string
  gender: string
  phone: string
  parentName: string
  parentPhone: string
  email: string
  groupIds: string[]
  weight: string
  height: string
  medicalNotes: string
  joinDate: string
}

const EMPTY_FORM: AthleteForm = {
  firstName: '', lastName: '', dob: '', gender: 'M', phone: '',
  parentName: '', parentPhone: '', email: '', groupIds: [],
  weight: '', height: '', medicalNotes: '', joinDate: new Date().toISOString().split('T')[0],
}

export default function Athletes() {
  const [athleteList, setAthleteList] = useState<Athlete[]>(initialAthletes)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterStatus, setFilterStatus] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<AthleteForm>(EMPTY_FORM)

  const filtered = athleteList.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) || a.email.includes(q)
    const matchGroup = filterGroup === 'all' || a.groupIds.includes(filterGroup)
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? a.active : !a.active)
    return matchSearch && matchGroup && matchStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAthlete: Athlete = {
      ...form,
      id: `a${Date.now()}`,
      active: true,
      avatar: null,
      gender: form.gender as 'M' | 'F',
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
    }
    setAthleteList(prev => [...prev, newAthlete])
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  const setField = <K extends keyof AthleteForm>(field: K, value: AthleteForm[K]) =>
    setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Athletes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{filtered.length} of {athleteList.length} athletes</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Register Athlete
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
          <option value="all">All Groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="th">Athlete</th>
                <th className="th hidden sm:table-cell">Age</th>
                <th className="th hidden md:table-cell">Groups</th>
                <th className="th hidden lg:table-cell">Joined</th>
                <th className="th">Status</th>
                <th className="th w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const age = new Date().getFullYear() - new Date(a.dob).getFullYear()
                return (
                  <tr key={a.id} className="tr">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <AvatarCircle athlete={a} />
                        <div>
                          <p className="font-medium text-zinc-100">{a.firstName} {a.lastName}</p>
                          <p className="text-xs text-zinc-500">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td hidden sm:table-cell">{age} yrs</td>
                    <td className="td hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {a.groupIds.map(gid => (
                          <Badge key={gid} variant="blue">{groupById[gid]?.name}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="td hidden lg:table-cell text-zinc-400">{a.joinDate}</td>
                    <td className="td">
                      <Badge variant={a.active ? 'green' : 'zinc'}>{a.active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="td">
                      <Link to={`/athletes/${a.id}`} className="btn-ghost p-1.5">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="td text-center text-zinc-500 py-12">No athletes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register New Athlete" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <input className="input" required value={form.firstName} onChange={e => setField('firstName', e.target.value)} />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" required value={form.lastName} onChange={e => setField('lastName', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date of Birth *</label>
              <input type="date" className="input" required value={form.dob} onChange={e => setField('dob', e.target.value)} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={e => setField('gender', e.target.value)}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" className="input" value={form.weight} onChange={e => setField('weight', e.target.value)} />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input" value={form.height} onChange={e => setField('height', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setField('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => setField('phone', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Parent/Guardian Name</label>
              <input className="input" value={form.parentName} onChange={e => setField('parentName', e.target.value)} />
            </div>
            <div>
              <label className="label">Parent Phone</label>
              <input className="input" value={form.parentPhone} onChange={e => setField('parentPhone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Assign to Group(s)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {groups.map(g => {
                const selected = form.groupIds.includes(g.id)
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setField('groupIds', selected ? form.groupIds.filter(id => id !== g.id) : [...form.groupIds, g.id])}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selected
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {g.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="label">Medical Notes</label>
            <textarea className="input resize-none" rows={2} value={form.medicalNotes} onChange={e => setField('medicalNotes', e.target.value)} />
          </div>
          <div>
            <label className="label">Join Date</label>
            <input type="date" className="input" value={form.joinDate} onChange={e => setField('joinDate', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Register Athlete</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
