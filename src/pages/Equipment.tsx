import { useState, useMemo } from 'react'
import { Plus, Package, Search, AlertCircle } from 'lucide-react'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import type { EquipmentAssignment } from '../types'
import {
  equipmentAssignments as initialAssignments,
  equipmentCatalog, athletes,
} from '../data/dummy'

const athleteById = Object.fromEntries(athletes.map(a => [a.id, a]))
const itemById = Object.fromEntries(equipmentCatalog.map(i => [i.id, i]))

interface EquipmentForm {
  athleteId: string
  itemId: string
  size: string
  quantity: number
  assignedDate: string
  paid: boolean
}

const EMPTY_FORM: EquipmentForm = {
  athleteId: athletes[0]?.id ?? '',
  itemId: equipmentCatalog[0]?.id ?? '',
  size: '',
  quantity: 1,
  assignedDate: new Date().toISOString().split('T')[0],
  paid: false,
}

export default function Equipment() {
  const [assignments, setAssignments] = useState<EquipmentAssignment[]>(initialAssignments)
  const [search, setSearch] = useState('')
  const [filterItem, setFilterItem] = useState('all')
  const [filterPaid, setFilterPaid] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<EquipmentForm>(EMPTY_FORM)

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const athlete = athleteById[a.athleteId]
      const item = itemById[a.itemId]
      if (!athlete || !item) return false
      const q = search.toLowerCase()
      const matchSearch = !q ||
        `${athlete.firstName} ${athlete.lastName}`.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
      const matchItem = filterItem === 'all' || a.itemId === filterItem
      const matchPaid = filterPaid === 'all' || (filterPaid === 'paid' ? a.paid : !a.paid)
      return matchSearch && matchItem && matchPaid && !a.returnDate
    })
  }, [assignments, search, filterItem, filterPaid])

  const stats = useMemo(() => {
    const active = assignments.filter(a => !a.returnDate)
    const unpaidValue = active.filter(a => !a.paid).reduce((sum, a) => sum + (itemById[a.itemId]?.unitPrice ?? 0) * a.quantity, 0)
    return {
      totalItems: active.length,
      unpaidCount: active.filter(a => !a.paid).length,
      unpaidValue,
    }
  }, [assignments])

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault()
    const newAssignment: EquipmentAssignment = {
      ...form,
      id: `ea${Date.now()}`,
      size: form.size || null,
      returnDate: null,
    }
    setAssignments(prev => [...prev, newAssignment])
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  const togglePaid = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, paid: !a.paid } : a))
  }

  const markReturned = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, returnDate: new Date().toISOString().split('T')[0] } : a))
  }

  const setField = <K extends keyof EquipmentForm>(k: K, v: EquipmentForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Equipment</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Track items assigned to athletes</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Assign Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Items On Loan" value={stats.totalItems} icon={Package} color="blue" />
        <StatCard label="Unpaid Items" value={stats.unpaidCount} icon={AlertCircle} color="red" />
        <StatCard label="Outstanding Value" value={`€${stats.unpaidValue}`} sub="equipment debt" icon={Package} color="gold" />
      </div>

      {/* Catalog */}
      <div className="card">
        <h2 className="font-semibold text-zinc-100 mb-3">Equipment Catalog</h2>
        <div className="flex flex-wrap gap-2">
          {equipmentCatalog.map(item => (
            <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700">
              <Package size={14} className="text-zinc-400" />
              <span className="text-sm text-zinc-200">{item.name}</span>
              <Badge variant="zinc">{item.category}</Badge>
              <span className="text-xs text-gold-400 font-semibold">€{item.unitPrice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input className="input pl-9" placeholder="Search athlete or item…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={filterItem} onChange={e => setFilterItem(e.target.value)}>
          <option value="all">All Items</option>
          {equipmentCatalog.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select className="input w-auto" value={filterPaid} onChange={e => setFilterPaid(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="th">Athlete</th>
                <th className="th">Item</th>
                <th className="th hidden sm:table-cell">Size</th>
                <th className="th hidden sm:table-cell">Qty</th>
                <th className="th hidden md:table-cell">Value</th>
                <th className="th hidden md:table-cell">Assigned</th>
                <th className="th">Payment</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const athlete = athleteById[a.athleteId]
                const item = itemById[a.itemId]
                return (
                  <tr key={a.id} className="tr">
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                          {athlete?.firstName[0]}{athlete?.lastName[0]}
                        </div>
                        <span className="text-zinc-200 font-medium">{athlete?.firstName} {athlete?.lastName}</span>
                      </div>
                    </td>
                    <td className="td font-medium">{item?.name}</td>
                    <td className="td hidden sm:table-cell text-zinc-400">{a.size ?? '—'}</td>
                    <td className="td hidden sm:table-cell">{a.quantity}</td>
                    <td className="td hidden md:table-cell text-gold-400">€{(item?.unitPrice ?? 0) * a.quantity}</td>
                    <td className="td hidden md:table-cell text-zinc-400">{a.assignedDate}</td>
                    <td className="td">
                      <button onClick={() => togglePaid(a.id)}>
                        <Badge variant={a.paid ? 'green' : 'red'}>{a.paid ? 'Paid' : 'Unpaid'}</Badge>
                      </button>
                    </td>
                    <td className="td">
                      <button
                        onClick={() => markReturned(a.id)}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="td text-center text-zinc-500 py-10">No equipment found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Assign Equipment">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="label">Athlete *</label>
            <select className="input" required value={form.athleteId} onChange={e => setField('athleteId', e.target.value)}>
              {athletes.filter(a => a.active).map(a => (
                <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Item *</label>
            <select className="input" required value={form.itemId} onChange={e => setField('itemId', e.target.value)}>
              {equipmentCatalog.map(i => (
                <option key={i.id} value={i.id}>{i.name} – €{i.unitPrice}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Size</label>
              <input className="input" value={form.size} onChange={e => setField('size', e.target.value)} placeholder="S / M / 42 / etc." />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" min={1} className="input" value={form.quantity} onChange={e => setField('quantity', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="label">Date Assigned</label>
            <input type="date" className="input" value={form.assignedDate} onChange={e => setField('assignedDate', e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="eqPaid"
              checked={form.paid}
              onChange={e => setField('paid', e.target.checked)}
              className="w-4 h-4 accent-gold-500"
            />
            <label htmlFor="eqPaid" className="text-sm text-zinc-300">Already paid</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Assign Item</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
