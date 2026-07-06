import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, Phone, Mail, User, Calendar, Weight, Ruler, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import Badge from '../components/ui/Badge'
import type { BadgeVariant } from '../types'
import {
  athletes, groups, payments,
  equipmentAssignments, equipmentCatalog, competitions, MONTHLY_FEE_DEFAULT,
} from '../data/dummy'
import { useAttendance } from '../context/AttendanceContext'

const groupById = Object.fromEntries(groups.map(g => [g.id, g]))
const itemById = Object.fromEntries(equipmentCatalog.map(i => [i.id, i]))

const TABS = ['Overview', 'Attendance', 'Payments', 'Equipment', 'Competitions'] as const
type Tab = typeof TABS[number]

export default function AthleteDetail() {
  const { id } = useParams<{ id: string }>()
  const athlete = athletes.find(a => a.id === id)
  const [tab, setTab] = useState<Tab>('Overview')
  const { recordsForAthlete } = useAttendance()

  if (!athlete) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Athlete not found.</p>
        <Link to="/athletes" className="btn-ghost mt-4 inline-flex">← Back</Link>
      </div>
    )
  }

  const age = new Date().getFullYear() - new Date(athlete.dob).getFullYear()
  const athletePayments = payments.filter(p => p.athleteId === id).sort((a, b) => b.month.localeCompare(a.month))
  const athleteEquipment = equipmentAssignments.filter(e => e.athleteId === id)
  const athleteAttendance = recordsForAthlete(id ?? '')
  const athleteCompetitions = competitions.filter(c => c.results.some(r => r.athleteId === id))

  const attendanceRate = useMemo(() => {
    if (!athleteAttendance.length) return 0
    return Math.round((athleteAttendance.filter(r => r.present).length / athleteAttendance.length) * 100)
  }, [athleteAttendance])

  const paidMonths = athletePayments.filter(p => p.paid).length
  const totalDebt = athletePayments.filter(p => !p.paid).length * MONTHLY_FEE_DEFAULT

  const attendanceBadgeVariant: BadgeVariant =
    attendanceRate >= 80 ? 'green' : attendanceRate >= 60 ? 'gold' : 'red'

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/athletes" className="btn-ghost -ml-1 inline-flex">
        <ArrowLeft size={16} /> Back to Athletes
      </Link>

      {/* Header card */}
      <div className="card flex items-start gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-2xl bg-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-300 flex-shrink-0">
          {athlete.firstName[0]}{athlete.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-zinc-100">{athlete.firstName} {athlete.lastName}</h1>
            <Badge variant={athlete.active ? 'green' : 'zinc'}>{athlete.active ? 'Active' : 'Inactive'}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {athlete.groupIds.map(gid => (
              <span
                key={gid}
                className="badge text-xs font-medium"
                style={{ background: groupById[gid]?.color + '20', color: groupById[gid]?.color, border: `1px solid ${groupById[gid]?.color}40` }}
              >
                {groupById[gid]?.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {athlete.dob} ({age} yrs)</span>
            {athlete.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {athlete.phone}</span>}
            {athlete.email && <span className="flex items-center gap-1.5"><Mail size={14} /> {athlete.email}</span>}
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gold-400">{attendanceRate}%</p>
            <p className="text-xs text-zinc-500">Attendance</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">{paidMonths}</p>
            <p className="text-xs text-zinc-500">Months Paid</p>
          </div>
          {totalDebt > 0 && (
            <div>
              <p className="text-2xl font-bold text-red-400">€{totalDebt}</p>
              <p className="text-xs text-zinc-500">Debt</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Overview' && (
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="card space-y-3">
            <h3 className="font-semibold text-zinc-300 text-sm">Physical Info</h3>
            {athlete.weight && <InfoRow icon={Weight} label="Weight" value={`${athlete.weight} kg`} />}
            {athlete.height && <InfoRow icon={Ruler} label="Height" value={`${athlete.height} cm`} />}
            <InfoRow icon={User} label="Gender" value={athlete.gender === 'M' ? 'Male' : 'Female'} />
            <InfoRow icon={Calendar} label="Joined" value={athlete.joinDate} />
          </div>
          {(athlete.parentName || athlete.medicalNotes) && (
            <div className="card space-y-3">
              {athlete.parentName && (
                <>
                  <h3 className="font-semibold text-zinc-300 text-sm">Parent / Guardian</h3>
                  <InfoRow icon={User} label="Name" value={athlete.parentName} />
                  {athlete.parentPhone && <InfoRow icon={Phone} label="Phone" value={athlete.parentPhone} />}
                </>
              )}
              {athlete.medicalNotes && (
                <div className="mt-3">
                  <h3 className="font-semibold text-zinc-300 text-sm mb-2">Medical Notes</h3>
                  <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-300">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                    {athlete.medicalNotes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'Attendance' && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h3 className="font-semibold text-zinc-100">Attendance Records</h3>
            <Badge variant={attendanceBadgeVariant}>
              {attendanceRate}% rate
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Group</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {athleteAttendance.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map((r, i) => (
                  <tr key={i} className="tr">
                    <td className="td">{r.date}</td>
                    <td className="td">{groupById[r.groupId]?.name}</td>
                    <td className="td">
                      {r.present
                        ? <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={15} /> Present</span>
                        : <span className="flex items-center gap-1.5 text-red-400"><XCircle size={15} /> Absent</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Payments' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="font-semibold text-zinc-100">Payment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="th">Month</th>
                  <th className="th">Amount</th>
                  <th className="th">Method</th>
                  <th className="th">Status</th>
                  <th className="th">Date Paid</th>
                </tr>
              </thead>
              <tbody>
                {athletePayments.map(p => (
                  <tr key={p.id} className="tr">
                    <td className="td font-medium">{p.month}</td>
                    <td className="td">€{p.amount}</td>
                    <td className="td text-zinc-400 capitalize">{p.method ?? '—'}</td>
                    <td className="td">
                      <Badge variant={p.paid ? 'green' : 'red'}>{p.paid ? 'Paid' : 'Unpaid'}</Badge>
                    </td>
                    <td className="td text-zinc-400">{p.paidOn ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Equipment' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="font-semibold text-zinc-100">Assigned Equipment</h3>
          </div>
          {athleteEquipment.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">No equipment assigned.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="th">Item</th>
                    <th className="th">Size</th>
                    <th className="th">Qty</th>
                    <th className="th">Assigned</th>
                    <th className="th">Payment</th>
                    <th className="th">Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {athleteEquipment.map(e => (
                    <tr key={e.id} className="tr">
                      <td className="td font-medium">{itemById[e.itemId]?.name}</td>
                      <td className="td text-zinc-400">{e.size ?? '—'}</td>
                      <td className="td">{e.quantity}</td>
                      <td className="td text-zinc-400">{e.assignedDate}</td>
                      <td className="td"><Badge variant={e.paid ? 'green' : 'red'}>{e.paid ? 'Paid' : 'Unpaid'}</Badge></td>
                      <td className="td text-zinc-400">{e.returnDate ?? 'Keeping'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'Competitions' && (
        <div className="space-y-3">
          {athleteCompetitions.length === 0 ? (
            <div className="card text-center text-zinc-500 text-sm">No competitions recorded.</div>
          ) : (
            athleteCompetitions.map(c => {
              const result = c.results.find(r => r.athleteId === id)
              return (
                <div key={c.id} className="card flex items-center gap-4">
                  <div className="text-3xl w-10 text-center">
                    {result?.medal === 'gold' ? '🥇' : result?.medal === 'silver' ? '🥈' : result?.medal === 'bronze' ? '🥉' : `${result?.place}th`}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">{c.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{c.location} · {c.date}</p>
                    {result?.weightClass && <Badge variant="zinc">{result.weightClass}</Badge>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

interface InfoRowProps {
  icon: LucideIcon
  label: string
  value: string | number
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="text-zinc-500 flex-shrink-0" />
      <span className="text-xs text-zinc-500 w-20 flex-shrink-0">{label}</span>
      <span className="text-sm text-zinc-200">{value}</span>
    </div>
  )
}
