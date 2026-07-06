import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, UsersRound, Wallet, AlertCircle, Trophy, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import type { BadgeVariant } from '../types'
import {
  athletes, groups, payments,
  competitions, MONTHLY_FEE_DEFAULT,
} from '../data/dummy'
import { useAttendance } from '../context/AttendanceContext'

const CURRENT_MONTH = '2026-06'

const MEDAL_COLOR_MAP: Record<'gold' | 'silver' | 'bronze', BadgeVariant> = {
  gold: 'gold',
  silver: 'zinc',
  bronze: 'red',
}

export default function Dashboard() {
  const { all: attendanceRecords } = useAttendance()
  const activeAthletes = athletes.filter(a => a.active)

  const monthPayments = payments.filter(p => p.month === CURRENT_MONTH)
  const paidCount = monthPayments.filter(p => p.paid).length
  const unpaidCount = monthPayments.filter(p => !p.paid).length
  const collected = paidCount * MONTHLY_FEE_DEFAULT
  const pending = unpaidCount * MONTHLY_FEE_DEFAULT

  // Attendance last 4 weeks per group
  const attendanceByGroup = useMemo(() => {
    return groups.map(g => {
      const groupAthletes = activeAthletes.filter(a => a.groupIds.includes(g.id))
      const records = attendanceRecords.filter(r => r.groupId === g.id)
      const totalSessions = records.length
      const presentSessions = records.filter(r => r.present).length
      const rate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0
      return { name: g.name, rate, athletes: groupAthletes.length, color: g.color }
    })
  }, [activeAthletes, attendanceRecords])

  // Revenue last 6 months
  const revenueData = useMemo(() => {
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
    return months.map(m => {
      const paid = payments.filter(p => p.month === m && p.paid).length
      return { month: m.slice(5), revenue: paid * MONTHLY_FEE_DEFAULT }
    })
  }, [])

  const recentCompetitions = competitions.slice(-2).reverse()
  const unpaidAthletes = monthPayments
    .filter(p => !p.paid)
    .map(p => athletes.find(a => a.id === p.athleteId))
    .filter((a): a is NonNullable<typeof a> => a != null)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Welcome back — here's what's happening at the academy.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Athletes" value={activeAthletes.length} sub={`${athletes.length} total registered`} icon={Users} color="gold" />
        <StatCard label="Groups" value={groups.length} sub="training groups" icon={UsersRound} color="blue" />
        <StatCard label="Collected (June)" value={`€${collected}`} sub={`${paidCount} athletes paid`} icon={Wallet} color="green" />
        <StatCard label="Pending (June)" value={`€${pending}`} sub={`${unpaidCount} athletes unpaid`} icon={AlertCircle} color="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-zinc-100 mb-4">Monthly Revenue (2026)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={32}>
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `€${v}`} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#f4f4f5' }}
                formatter={(v: number) => [`€${v}`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {revenueData.map((_, i) => (
                  <Cell key={i} fill={i === revenueData.length - 1 ? '#c99020' : '#3f3f46'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance by group */}
        <div className="card">
          <h2 className="font-semibold text-zinc-100 mb-4">Attendance Rate by Group</h2>
          <div className="space-y-3">
            {attendanceByGroup.map(g => (
              <div key={g.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">{g.name}</span>
                  <span className="text-zinc-400">{g.rate}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${g.rate}%`, background: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unpaid athletes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-100">Unpaid Subscriptions (June)</h2>
            <Link to="/financials" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {unpaidAthletes.length === 0 ? (
            <p className="text-sm text-zinc-500">All athletes paid this month!</p>
          ) : (
            <div className="space-y-2">
              {unpaidAthletes.map(a => (
                <Link
                  key={a.id}
                  to={`/athletes/${a.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                    {a.firstName[0]}{a.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 font-medium truncate">{a.firstName} {a.lastName}</p>
                  </div>
                  <Badge variant="red">€{MONTHLY_FEE_DEFAULT}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent competitions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-100">Recent Competitions</h2>
            <Link to="/competitions" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentCompetitions.map(c => (
              <div key={c.id} className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{c.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{c.location} · {c.date}</p>
                  </div>
                  <Trophy size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.results.filter(r => r.medal != null).map(r => {
                    const medal = r.medal as 'gold' | 'silver' | 'bronze'
                    const medalColor = MEDAL_COLOR_MAP[medal]
                    const athlete = athletes.find(a => a.id === r.athleteId)
                    return (
                      <Badge key={r.athleteId} variant={medalColor}>
                        {medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'} {athlete?.firstName}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
