import { useState } from 'react'
import { Plus, Trophy, MapPin, Calendar } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import type { Competition, BadgeVariant, MedalType } from '../types'
import { competitions as initialCompetitions, athletes } from '../data/dummy'

const athleteById = Object.fromEntries(athletes.map(a => [a.id, a]))

type NonNullMedal = 'gold' | 'silver' | 'bronze'

const MEDAL_INFO: Record<NonNullMedal, { label: string; variant: BadgeVariant }> = {
  gold:   { label: '🥇 Gold',   variant: 'gold' },
  silver: { label: '🥈 Silver', variant: 'zinc' },
  bronze: { label: '🥉 Bronze', variant: 'red' },
}

interface CompetitionForm {
  name: string
  date: string
  location: string
}

interface ResultForm {
  athleteId: string
  weightClass: string
  place: number
  medal: '' | NonNullMedal
}

const EMPTY_FORM: CompetitionForm = { name: '', date: '', location: '' }
const EMPTY_RESULT: ResultForm = {
  athleteId: athletes[0]?.id ?? '',
  weightClass: '',
  place: 1,
  medal: '',
}

export default function Competitions() {
  const [compList, setCompList] = useState<Competition[]>(initialCompetitions)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CompetitionForm>(EMPTY_FORM)
  const [results, setResults] = useState<ResultForm[]>([{ ...EMPTY_RESULT }])
  const [selected, setSelected] = useState<Competition | null>(null)

  const totalMedals = compList.flatMap(c => c.results).filter(r => r.medal)
  const goldCount   = totalMedals.filter(r => r.medal === 'gold').length
  const silverCount = totalMedals.filter(r => r.medal === 'silver').length
  const bronzeCount = totalMedals.filter(r => r.medal === 'bronze').length

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const mappedResults = results.map(r => ({
      athleteId: r.athleteId,
      weightClass: r.weightClass,
      place: r.place,
      medal: (r.medal || null) as MedalType,
    }))
    setCompList(prev => [...prev, { ...form, id: `comp${Date.now()}`, results: mappedResults }])
    setShowModal(false)
    setForm(EMPTY_FORM)
    setResults([{ ...EMPTY_RESULT }])
  }

  const setField = <K extends keyof CompetitionForm>(k: K, v: CompetitionForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const setResult = <K extends keyof ResultForm>(i: number, k: K, v: ResultForm[K]) =>
    setResults(rs => rs.map((r, idx) => idx === i ? { ...r, [k]: v } : r))

  const addResult = () => setResults(rs => [...rs, { ...EMPTY_RESULT }])
  const removeResult = (i: number) => setResults(rs => rs.filter((_, idx) => idx !== i))

  const sortedComps = [...compList].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Competitions</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{compList.length} competitions recorded</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Competition
        </button>
      </div>

      {/* Medal tally */}
      <div className="card flex flex-wrap gap-8 items-center">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Medal Tally</p>
          <p className="text-sm text-zinc-300">All-time academy results</p>
        </div>
        <div className="flex gap-6">
          {[
            { emoji: '🥇', count: goldCount,   label: 'Gold' },
            { emoji: '🥈', count: silverCount, label: 'Silver' },
            { emoji: '🥉', count: bronzeCount, label: 'Bronze' },
          ].map(({ emoji, count, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="text-2xl font-bold text-zinc-100">{count}</div>
              <div className="text-xs text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Competition cards */}
      <div className="space-y-4">
        {sortedComps.map(c => (
          <div key={c.id} className="card cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => setSelected(c)}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold text-zinc-100 text-lg">{c.name}</h3>
                <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {c.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {c.location}</span>
                </div>
              </div>
              <Trophy size={18} className="text-gold-400 flex-shrink-0" />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {c.results.map(r => {
                const athlete = athleteById[r.athleteId]
                const info = r.medal ? MEDAL_INFO[r.medal as NonNullMedal] : null
                return (
                  <div
                    key={r.athleteId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                      {athlete?.firstName[0]}{athlete?.lastName[0]}
                    </div>
                    <span className="text-sm text-zinc-200">{athlete?.firstName}</span>
                    {r.weightClass && <Badge variant="zinc">{r.weightClass}</Badge>}
                    {info ? (
                      <Badge variant={info.variant}>{info.label}</Badge>
                    ) : (
                      <Badge variant="zinc">{r.place}th place</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Competition detail */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {selected.date}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {selected.location}</span>
            </div>
            <div className="space-y-2">
              {selected.results.sort((a, b) => a.place - b.place).map(r => {
                const athlete = athleteById[r.athleteId]
                return (
                  <div key={r.athleteId} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    <span className="text-xl w-8 text-center">
                      {r.medal === 'gold' ? '🥇' : r.medal === 'silver' ? '🥈' : r.medal === 'bronze' ? '🥉' : `${r.place}.`}
                    </span>
                    <div>
                      <p className="font-medium text-zinc-100">{athlete?.firstName} {athlete?.lastName}</p>
                      {r.weightClass && <p className="text-xs text-zinc-500">{r.weightClass}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Add competition modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Competition" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Competition Name *</label>
            <input className="input" required value={form.name} onChange={e => setField('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" required value={form.date} onChange={e => setField('date', e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => setField('location', e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Results</label>
              <button type="button" onClick={addResult} className="btn-ghost text-xs py-1">+ Add Result</button>
            </div>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <div className="col-span-2">
                    <select className="input text-xs" value={r.athleteId} onChange={e => setResult(i, 'athleteId', e.target.value)}>
                      {athletes.filter(a => a.active).map(a => (
                        <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input className="input text-xs" placeholder="Weight class" value={r.weightClass} onChange={e => setResult(i, 'weightClass', e.target.value)} />
                  </div>
                  <div>
                    <select className="input text-xs" value={r.medal} onChange={e => setResult(i, 'medal', e.target.value as '' | NonNullMedal)}>
                      <option value="">No medal</option>
                      <option value="gold">🥇 Gold</option>
                      <option value="silver">🥈 Silver</option>
                      <option value="bronze">🥉 Bronze</option>
                    </select>
                  </div>
                  {results.length > 1 && (
                    <button type="button" onClick={() => removeResult(i)} className="text-zinc-600 hover:text-red-400 text-xs col-span-4 text-right">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Competition</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
