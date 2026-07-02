import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Users, UsersRound, CalendarDays,
  Wallet, Package, Trophy, Menu, X, ChevronRight,
} from 'lucide-react'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
}

const nav: NavItem[] = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/athletes',     icon: Users,           label: 'Athletes' },
  { to: '/groups',       icon: UsersRound,      label: 'Groups' },
  { to: '/schedule',     icon: CalendarDays,    label: 'Schedule' },
  { to: '/financials',   icon: Wallet,          label: 'Financials' },
  { to: '/equipment',    icon: Package,         label: 'Equipment' },
  { to: '/competitions', icon: Trophy,          label: 'Competitions' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'linear-gradient(180deg, #101012 0%, #09090b 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800/70">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow"
            style={{ background: 'linear-gradient(135deg, #e8c05f 0%, #c99020 100%)' }}
          >
            <span className="text-zinc-950 font-black text-base">S</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-zinc-100 text-sm leading-tight tracking-tight">SPARTAKOS</p>
            <p className="text-[11px] text-gold-500/80 truncate tracking-widest uppercase">Wrestling · Grappling</p>
          </div>
          <button
            className="ml-auto lg:hidden text-zinc-400 hover:text-zinc-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                'nav-item ' + (isActive ? 'active' : '')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center">Ioannina · Est. 1984</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-zinc-800/70 flex items-center px-5 gap-3 flex-shrink-0 sticky top-0 z-10 bg-zinc-950/70 backdrop-blur-xl">
          <button
            className="lg:hidden text-zinc-400 hover:text-zinc-100 p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-xs text-zinc-500">Admin</span>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-zinc-950 shadow-glow"
              style={{ background: 'linear-gradient(135deg, #e8c05f 0%, #c99020 100%)' }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  athletes: 'Athletes',
  groups: 'Groups',
  schedule: 'Schedule',
  financials: 'Financials',
  equipment: 'Equipment',
  competitions: 'Competitions',
}

function Breadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  return (
    <nav className="flex items-center gap-1 text-sm">
      {segments.map((seg, i) => {
        const label = SEGMENT_LABELS[seg] ?? seg
        const isLast = i === segments.length - 1
        return (
          <span key={seg} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-zinc-600" />}
            <span className={isLast ? 'text-zinc-100 font-medium' : 'text-zinc-500'}>
              {label}
            </span>
          </span>
        )
      })}
    </nav>
  )
}
