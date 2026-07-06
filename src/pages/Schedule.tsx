import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Trash2, Clock, MapPin, ChevronLeft, ChevronRight, CalendarDays,
  CalendarRange, Repeat, CheckCircle2, XCircle, ClipboardCheck, RotateCcw, Ban,
} from 'lucide-react'
import { format, addWeeks, addMonths, isSameMonth, isToday } from 'date-fns'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { useAttendance } from '../context/AttendanceContext'
import {
  scheduleSlots as initialSlots, scheduleExceptions as initialExceptions,
  groups, coaches, athletes,
} from '../data/dummy'
import {
  ISO, fromISO, weekStart, weekEnd, weekDays, monthDays,
  sessionsForWeek, sessionCountByDay, DAY_LABELS_FULL,
} from '../lib/schedule'
import type { ScheduleSlot, ScheduleException, SessionInstance, AttendanceStatus } from '../types'

const groupById = Object.fromEntries(groups.map(g => [g.id, g]))
const coachById = Object.fromEntries(coaches.map(c => [c.id, c]))

const WORK_DAYS = [1, 2, 3, 4, 5, 6]
const SEASON_FROM = '2025-09-01'
const SEASON_UNTIL = '2026-06-30'

type View = 'week' | 'month' | 'rules'

const emptyRule = () => ({
  groupId: groups[0]?.id ?? '',
  day: 1,
  startTime: '17:00',
  endTime: '18:30',
  location: 'Mat Room A',
  effectiveFrom: SEASON_FROM,
  effectiveUntil: SEASON_UNTIL,
})

export default function Schedule() {
  const [slots, setSlots] = useState<ScheduleSlot[]>(initialSlots)
  const [exceptions, setExceptions] = useState<ScheduleException[]>(initialExceptions)
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState<Date>(new Date(2026, 5, 29)) // a week within the season
  const [filterGroup, setFilterGroup] = useState('all')
  const [ruleModal, setRuleModal] = useState(false)
  const [ruleForm, setRuleForm] = useState(emptyRule)
  const [attendanceTarget, setAttendanceTarget] = useState<SessionInstance | null>(null)

  const visibleSlots = useMemo(
    () => (filterGroup === 'all' ? slots : slots.filter(s => s.groupId === filterGroup)),
    [slots, filterGroup],
  )

  const addRule = (e: React.FormEvent) => {
    e.preventDefault()
    setSlots(prev => [...prev, {
      ...ruleForm,
      id: `s${Date.now()}`,
      day: Number(ruleForm.day),
      effectiveUntil: ruleForm.effectiveUntil || null,
    }])
    setRuleModal(false)
    setRuleForm(emptyRule())
  }
  const deleteRule = (id: string) => setSlots(prev => prev.filter(s => s.id !== id))

  const isCancelled = (slotId: string, date: string) =>
    exceptions.some(x => x.slotId === slotId && x.date === date)
  const toggleCancel = (slotId: string, date: string) => {
    setExceptions(prev =>
      isCancelled(slotId, date)
        ? prev.filter(x => !(x.slotId === slotId && x.date === date))
        : [...prev, { slotId, date }])
  }

  const setField = <K extends keyof ReturnType<typeof emptyRule>>(k: K, v: string | number) =>
    setRuleForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Schedule</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Recurring weekly training — browse any week, take attendance</p>
        </div>
        <button className="btn-primary" onClick={() => { setRuleForm(emptyRule()); setRuleModal(true) }}>
          <Plus size={16} /> Recurring session
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {([
            ['week', 'Week', CalendarDays],
            ['month', 'Month', CalendarRange],
            ['rules', 'Recurring rules', Repeat],
          ] as const).map(([v, label, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === v ? 'bg-gold-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
        {view !== 'rules' && (
          <select className="input w-auto" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="all">All groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {view === 'week' && (
        <WeekView
          anchor={anchor} setAnchor={setAnchor}
          slots={visibleSlots} exceptions={exceptions}
          onTakeAttendance={setAttendanceTarget}
          onToggleCancel={toggleCancel}
        />
      )}
      {view === 'month' && (
        <MonthView
          anchor={anchor} setAnchor={setAnchor}
          slots={visibleSlots} exceptions={exceptions}
          onPickWeek={(d) => { setAnchor(d); setView('week') }}
        />
      )}
      {view === 'rules' && (
        <RulesView slots={slots} onDelete={deleteRule} />
      )}

      <Modal open={ruleModal} onClose={() => setRuleModal(false)} title="New recurring session">
        <form onSubmit={addRule} className="space-y-4">
          <p className="text-xs text-zinc-500 -mt-1">
            This repeats every week on the chosen day for the whole term — you don't recreate it each week.
          </p>
          <div>
            <label className="label">Group *</label>
            <select className="input" required value={ruleForm.groupId} onChange={e => setField('groupId', e.target.value)}>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Repeats every *</label>
            <select className="input" value={ruleForm.day} onChange={e => setField('day', e.target.value)}>
              {WORK_DAYS.map(d => <option key={d} value={d}>{DAY_LABELS_FULL[d]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start time *</label>
              <input type="time" className="input" required value={ruleForm.startTime} onChange={e => setField('startTime', e.target.value)} />
            </div>
            <div>
              <label className="label">End time *</label>
              <input type="time" className="input" required value={ruleForm.endTime} onChange={e => setField('endTime', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Term starts</label>
              <input type="date" className="input" value={ruleForm.effectiveFrom} onChange={e => setField('effectiveFrom', e.target.value)} />
            </div>
            <div>
              <label className="label">Term ends</label>
              <input type="date" className="input" value={ruleForm.effectiveUntil} onChange={e => setField('effectiveUntil', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={ruleForm.location} onChange={e => setField('location', e.target.value)} placeholder="Mat Room A" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setRuleModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create rule</button>
          </div>
        </form>
      </Modal>

      <AttendanceModal session={attendanceTarget} onClose={() => setAttendanceTarget(null)} />
    </div>
  )
}

/* ─────────────────────────── Week view ─────────────────────────── */
function WeekView({
  anchor, setAnchor, slots, exceptions, onTakeAttendance, onToggleCancel,
}: {
  anchor: Date
  setAnchor: (d: Date) => void
  slots: ScheduleSlot[]
  exceptions: ScheduleException[]
  onTakeAttendance: (s: SessionInstance) => void
  onToggleCancel: (slotId: string, date: string) => void
}) {
  const { isRegistered } = useAttendance()
  const days = weekDays(anchor)
  const sessions = useMemo(() => sessionsForWeek(slots, exceptions, anchor), [slots, exceptions, anchor])
  const byDay = (iso: string) => sessions.filter(s => s.date === iso)

  const rangeLabel = `${format(weekStart(anchor), 'd MMM')} – ${format(weekEnd(anchor), 'd MMM yyyy')}`

  return (
    <div className="space-y-4">
      <DateNav
        label={rangeLabel}
        onPrev={() => setAnchor(addWeeks(anchor, -1))}
        onNext={() => setAnchor(addWeeks(anchor, 1))}
        onToday={() => setAnchor(new Date())}
        anchor={anchor}
        setAnchor={setAnchor}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {days.filter(d => d.getDay() !== 0).map(date => {
          const iso = ISO(date)
          const daySessions = byDay(iso)
          const today = isToday(date)
          return (
            <div key={iso} className="min-h-32">
              <div className={`flex items-baseline gap-1.5 mb-2 px-1 ${today ? 'text-gold-400' : 'text-zinc-400'}`}>
                <span className="text-xs font-semibold uppercase tracking-wide">{format(date, 'EEE')}</span>
                <span className={`text-sm font-bold ${today ? 'text-gold-400' : 'text-zinc-300'}`}>{format(date, 'd')}</span>
                {today && <span className="text-[10px] font-semibold ml-auto">TODAY</span>}
              </div>
              <div className="space-y-2">
                {daySessions.length === 0 ? (
                  <div className="h-10 border border-dashed border-zinc-800 rounded-lg" />
                ) : daySessions.map(session => {
                  const group = groupById[session.groupId]
                  const registered = isRegistered(session.date, session.groupId)
                  return (
                    <div
                      key={session.id}
                      className={`rounded-lg p-2.5 border text-xs relative group/slot transition-colors ${session.canceled ? 'opacity-55' : ''}`}
                      style={{
                        background: (group?.color ?? '#71717a') + '15',
                        borderColor: (group?.color ?? '#71717a') + '40',
                      }}
                    >
                      <p className="font-semibold mb-1 flex items-center gap-1" style={{ color: group?.color ?? '#71717a' }}>
                        <span className={session.canceled ? 'line-through' : ''}>{group?.name}</span>
                      </p>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Clock size={10} /> {session.startTime}–{session.endTime}
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                        <MapPin size={10} /> {session.location}
                      </div>

                      {session.canceled ? (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-red-400">Cancelled</span>
                          <button onClick={() => onToggleCancel(session.slotId, session.date)}
                            className="text-[10px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-0.5">
                            <RotateCcw size={10} /> Restore
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onTakeAttendance(session)}
                          className={`mt-2 w-full inline-flex items-center justify-center gap-1 rounded-md py-1 text-[11px] font-semibold transition-colors ${
                            registered
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          <ClipboardCheck size={11} />
                          {registered ? 'Attendance ✓' : 'Take attendance'}
                        </button>
                      )}

                      {!session.canceled && (
                        <button
                          onClick={() => onToggleCancel(session.slotId, session.date)}
                          title="Cancel this occurrence"
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover/slot:opacity-100 transition-opacity text-zinc-500 hover:text-red-400"
                        >
                          <Ban size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────── Month view ─────────────────────────── */
function MonthView({
  anchor, setAnchor, slots, exceptions, onPickWeek,
}: {
  anchor: Date
  setAnchor: (d: Date) => void
  slots: ScheduleSlot[]
  exceptions: ScheduleException[]
  onPickWeek: (d: Date) => void
}) {
  const days = monthDays(anchor)
  const counts = useMemo(() => sessionCountByDay(slots, exceptions, days), [slots, exceptions, days])

  return (
    <div className="space-y-4">
      <DateNav
        label={format(anchor, 'MMMM yyyy')}
        onPrev={() => setAnchor(addMonths(anchor, -1))}
        onNext={() => setAnchor(addMonths(anchor, 1))}
        onToday={() => setAnchor(new Date())}
        anchor={anchor}
        setAnchor={setAnchor}
      />

      <div className="card p-4">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wide py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map(date => {
            const iso = ISO(date)
            const count = counts[iso] ?? 0
            const inMonth = isSameMonth(date, anchor)
            const today = isToday(date)
            return (
              <button
                key={iso}
                onClick={() => onPickWeek(date)}
                title={count ? `${count} session${count > 1 ? 's' : ''} — open week` : 'Open week'}
                className={`aspect-square rounded-lg border p-1.5 flex flex-col items-start justify-start transition-colors ${
                  inMonth ? 'border-zinc-800 hover:border-gold-500/50 hover:bg-zinc-800/50' : 'border-transparent opacity-40'
                } ${today ? 'ring-1 ring-gold-500/60' : ''}`}
              >
                <span className={`text-xs font-semibold ${today ? 'text-gold-400' : 'text-zinc-400'}`}>{format(date, 'd')}</span>
                {count > 0 && (
                  <span className="mt-auto self-center mb-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-zinc-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        Number of sessions that day · click any date to open that week
      </p>
    </div>
  )
}

/* ─────────────────────────── Rules view ─────────────────────────── */
function RulesView({ slots, onDelete }: { slots: ScheduleSlot[]; onDelete: (id: string) => void }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="font-semibold text-zinc-100">Recurring rules</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Each rule repeats weekly for the whole term.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="th">Group</th>
              <th className="th">Repeats</th>
              <th className="th">Time</th>
              <th className="th hidden sm:table-cell">Location</th>
              <th className="th hidden md:table-cell">Term</th>
              <th className="th hidden lg:table-cell">Coach</th>
              <th className="th w-10"></th>
            </tr>
          </thead>
          <tbody>
            {[...slots].sort((a, b) => a.day - b.day || a.startTime.localeCompare(b.startTime)).map(slot => {
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
                  <td className="td">Every {DAY_LABELS_FULL[slot.day]}</td>
                  <td className="td">{slot.startTime} – {slot.endTime}</td>
                  <td className="td hidden sm:table-cell text-zinc-400">{slot.location}</td>
                  <td className="td hidden md:table-cell text-zinc-400 text-xs">
                    {format(fromISO(slot.effectiveFrom), 'MMM yyyy')} – {slot.effectiveUntil ? format(fromISO(slot.effectiveUntil), 'MMM yyyy') : 'open'}
                  </td>
                  <td className="td hidden lg:table-cell text-zinc-400">{coach?.name}</td>
                  <td className="td">
                    <button onClick={() => onDelete(slot.id)} className="btn-ghost p-1.5 text-zinc-500 hover:text-red-400">
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
  )
}

/* ─────────────────────────── Date navigator ─────────────────────────── */
function DateNav({
  label, onPrev, onNext, onToday, anchor, setAnchor,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  anchor: Date
  setAnchor: (d: Date) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        <button onClick={onPrev} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"><ChevronLeft size={16} /></button>
        <span className="px-3 text-sm font-semibold text-zinc-200 min-w-40 text-center tabular-nums">{label}</span>
        <button onClick={onNext} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"><ChevronRight size={16} /></button>
      </div>
      <button onClick={onToday} className="btn-secondary py-2">Today</button>
      <label className="btn-secondary py-2 cursor-pointer relative">
        <CalendarDays size={15} /> Jump to date
        <input
          type="date"
          className="absolute inset-0 opacity-0 cursor-pointer"
          value={ISO(anchor)}
          onChange={e => e.target.value && setAnchor(fromISO(e.target.value))}
        />
      </label>
    </div>
  )
}

/* ─────────────────────────── Attendance modal ─────────────────────────── */
function AttendanceModal({ session, onClose }: { session: SessionInstance | null; onClose: () => void }) {
  const { getStatus, saveSession } = useAttendance()
  const group = session ? groupById[session.groupId] : null
  const roster = useMemo(
    () => (session ? athletes.filter(a => a.active && a.groupIds.includes(session.groupId)) : []),
    [session],
  )

  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({})

  useEffect(() => {
    if (!session) return
    const next: Record<string, AttendanceStatus> = {}
    for (const a of roster) {
      next[a.id] = getStatus(a.id, session.date, session.groupId) ?? 'present'
    }
    setDraft(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  if (!session) return null

  const present = Object.values(draft).filter(s => s === 'present').length
  const setAll = (status: AttendanceStatus) =>
    setDraft(Object.fromEntries(roster.map(a => [a.id, status])))
  const save = () => { saveSession(session.date, session.groupId, draft); onClose() }

  return (
    <Modal open={!!session} onClose={onClose} title="Take attendance" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full" style={{ background: group?.color }} />
            <div>
              <p className="font-semibold text-zinc-100">{group?.name}</p>
              <p className="text-xs text-zinc-500">
                {format(fromISO(session.date), 'EEEE d MMM yyyy')} · {session.startTime}–{session.endTime}
              </p>
            </div>
          </div>
          <Badge variant={present === roster.length ? 'green' : 'gold'}>
            {present}/{roster.length} present
          </Badge>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setAll('present')} className="btn-secondary flex-1 py-1.5 text-xs">
            <CheckCircle2 size={14} /> All present
          </button>
          <button onClick={() => setAll('absent')} className="btn-secondary flex-1 py-1.5 text-xs">
            <XCircle size={14} /> All absent
          </button>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto -mx-1 px-1">
          {roster.length === 0 && <p className="text-sm text-zinc-500 py-4 text-center">No active athletes in this group.</p>}
          {roster.map(a => {
            const status = draft[a.id] ?? 'present'
            return (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/40">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                  {a.firstName[0]}{a.lastName[0]}
                </div>
                <Link to={`/athletes/${a.id}`} className="text-sm text-zinc-200 font-medium hover:text-gold-400 flex-1 min-w-0 truncate">
                  {a.firstName} {a.lastName}
                </Link>
                <div className="inline-flex rounded-lg border border-zinc-700 overflow-hidden text-xs font-semibold">
                  <button
                    onClick={() => setDraft(d => ({ ...d, [a.id]: 'present' }))}
                    className={`px-3 py-1.5 transition-colors ${status === 'present' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >Present</button>
                  <button
                    onClick={() => setDraft(d => ({ ...d, [a.id]: 'absent' }))}
                    className={`px-3 py-1.5 transition-colors border-l border-zinc-700 ${status === 'absent' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >Absent</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={roster.length === 0}>
            <ClipboardCheck size={15} /> Save attendance
          </button>
        </div>
      </div>
    </Modal>
  )
}
