import type { LucideIcon } from 'lucide-react'
import type { StatCardColor } from '../../types'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  color?: StatCardColor
}

const colors: Record<StatCardColor, string> = {
  gold:   'bg-gold-500/10 text-gold-400',
  blue:   'bg-blue-500/10 text-blue-400',
  green:  'bg-emerald-500/10 text-emerald-400',
  red:    'bg-red-500/10 text-red-400',
  purple: 'bg-purple-500/10 text-purple-400',
}

export default function StatCard({ label, value, sub, icon: Icon, color = 'gold' }: StatCardProps) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 leading-tight">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
