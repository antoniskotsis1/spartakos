import type { BadgeVariant } from '../../types'

const variants: Record<BadgeVariant, string> = {
  gold:   'bg-gold-500/15 text-gold-400 border border-gold-500/30',
  green:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  red:    'bg-red-500/15 text-red-400 border border-red-500/30',
  blue:   'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  zinc:   'bg-zinc-700/50 text-zinc-400 border border-zinc-700',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

export default function Badge({ children, variant = 'zinc' }: BadgeProps) {
  return (
    <span className={`badge ${variants[variant]}`}>
      {children}
    </span>
  )
}
