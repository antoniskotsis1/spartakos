import { useState, useMemo } from 'react'
import { CheckCircle2, XCircle, Wallet, TrendingUp, AlertCircle, Users } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import type { Payment, PaymentMethod } from '../types'
import { athletes, payments as initialPayments, groups, MONTHLY_FEE_DEFAULT } from '../data/dummy'

const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
const groupById = Object.fromEntries(groups.map(g => [g.id, g]))
const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'bank transfer', 'card']

export default function Financials() {
  const [paymentList, setPaymentList] = useState<Payment[]>(initialPayments)
  const [selectedMonth, setSelectedMonth] = useState('2026-06')
  const [filterGroup, setFilterGroup] = useState('all')
  const [editPayment, setEditPayment] = useState<Payment | null>(null)

  const monthPayments = useMemo(() => {
    return paymentList.filter(p => p.month === selectedMonth)
  }, [paymentList, selectedMonth])

  const displayPayments = useMemo(() => {
    return monthPayments.filter(p => {
      if (filterGroup === 'all') return true
      const athlete = athletes.find(a => a.id === p.athleteId)
      return athlete?.groupIds.includes(filterGroup)
    })
  }, [monthPayments, filterGroup])

  const stats = useMemo(() => {
    const paid = monthPayments.filter(p => p.paid).length
    const unpaid = monthPayments.filter(p => !p.paid).length
    const total = monthPayments.length
    const collected = paid * MONTHLY_FEE_DEFAULT
    const pending = unpaid * MONTHLY_FEE_DEFAULT
    return { paid, unpaid, total, collected, pending }
  }, [monthPayments])

  const pieData = [
    { name: 'Paid',   value: stats.paid,   color: '#10b981' },
    { name: 'Unpaid', value: stats.unpaid, color: '#ef4444' },
  ]

  const markPaid = (payment: Payment, method: PaymentMethod) => {
    setPaymentList(prev => prev.map(p =>
      p.id === payment.id
        ? { ...p, paid: true, paidOn: new Date().toISOString().split('T')[0], method }
        : p
    ))
    setEditPayment(null)
  }

  const markUnpaid = (paymentId: string) => {
    setPaymentList(prev => prev.map(p =>
      p.id === paymentId ? { ...p, paid: false, paidOn: null, method: null } : p
    ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Financials</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Track subscription payments per athlete</p>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 flex-wrap">
        {MONTHS.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              selectedMonth === m
                ? 'bg-gold-500/10 border-gold-500/50 text-gold-400'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            {new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Collected" value={`€${stats.collected}`} sub={`${stats.paid} athletes`} icon={Wallet} color="green" />
        <StatCard label="Pending" value={`€${stats.pending}`} sub={`${stats.unpaid} athletes`} icon={AlertCircle} color="red" />
        <StatCard label="Total Expected" value={`€${stats.total * MONTHLY_FEE_DEFAULT}`} sub={`${stats.total} athletes`} icon={TrendingUp} color="gold" />
        <StatCard label="Collection Rate" value={`${stats.total ? Math.round((stats.paid / stats.total) * 100) : 0}%`} sub="paid this month" icon={Users} color="blue" />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Pie chart */}
        <div className="card flex flex-col items-center justify-center">
          <h3 className="font-semibold text-zinc-300 text-sm mb-3 self-start">Payment Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#f4f4f5' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Payment table */}
        <div className="card p-0 overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h3 className="font-semibold text-zinc-100">Athletes</h3>
            <select className="input w-auto text-xs" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
              <option value="all">All Groups</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="th">Athlete</th>
                  <th className="th hidden sm:table-cell">Group</th>
                  <th className="th">Amount</th>
                  <th className="th">Status</th>
                  <th className="th hidden md:table-cell">Method</th>
                  <th className="th hidden lg:table-cell">Date Paid</th>
                  <th className="th">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayPayments.map(p => {
                  const athlete = athletes.find(a => a.id === p.athleteId)
                  if (!athlete) return null
                  return (
                    <tr key={p.id} className="tr">
                      <td className="td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                            {athlete.firstName[0]}{athlete.lastName[0]}
                          </div>
                          <span className="text-zinc-200 font-medium">{athlete.firstName} {athlete.lastName}</span>
                        </div>
                      </td>
                      <td className="td hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {athlete.groupIds.slice(0, 1).map(gid => (
                            <Badge key={gid} variant="blue">{groupById[gid]?.name}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="td font-medium">€{p.amount}</td>
                      <td className="td">
                        <Badge variant={p.paid ? 'green' : 'red'}>{p.paid ? 'Paid' : 'Unpaid'}</Badge>
                      </td>
                      <td className="td hidden md:table-cell text-zinc-400 capitalize">{p.method ?? '—'}</td>
                      <td className="td hidden lg:table-cell text-zinc-400">{p.paidOn ?? '—'}</td>
                      <td className="td">
                        {p.paid ? (
                          <button
                            onClick={() => markUnpaid(p.id)}
                            className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                          >
                            <XCircle size={14} /> Revert
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditPayment(p)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 size={14} /> Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mark paid modal */}
      <Modal open={!!editPayment} onClose={() => setEditPayment(null)} title="Record Payment" size="sm">
        {editPayment && (() => {
          const athlete = athletes.find(a => a.id === editPayment.athleteId)
          return (
            <div className="space-y-4">
              <p className="text-sm text-zinc-300">
                Recording payment of <span className="text-gold-400 font-semibold">€{editPayment.amount}</span> for{' '}
                <span className="font-semibold text-zinc-100">{athlete?.firstName} {athlete?.lastName}</span> – {editPayment.month}
              </p>
              <div>
                <label className="label">Payment Method</label>
                <div className="flex flex-col gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m}
                      onClick={() => markPaid(editPayment, m)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-700 hover:border-gold-500/50 hover:bg-gold-500/5 text-sm text-zinc-300 transition-colors capitalize"
                    >
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
