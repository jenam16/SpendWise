import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Target,
  Repeat,
  CalendarClock,
  Users,
  Scale,
  Calendar as CalendarIcon,
  FileText,
  Clock,
  Trash2,
  Settings,
  Wallet,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
      { name: 'Budgets', path: '/budgets', icon: PieChart },
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Goals', path: '/goals', icon: Target },
      { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Recurring Expenses', path: '/recurring-expenses', icon: CalendarClock },
      { name: 'Shared Expenses', path: '/shared-expenses', icon: Users },
      { name: 'Debts', path: '/debts', icon: Scale },
    ],
  },
  {
    title: 'Planning',
    items: [
      { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
      { name: 'Reports', path: '/reports', icon: FileText },
    ],
  },
  {
    title: 'Utilities',
    items: [
      { name: 'Activity', path: '/activity', icon: Clock },
      { name: 'Trash', path: '/trash', icon: Trash2 },
    ],
  },
]

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { user } = useAuth()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SW'

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#090F1C] border-r border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top: Logo & Close Button (Mobile) */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#070B14]/40 shrink-0">
            <NavLink to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  SpendWise
                </span>
                <span className="text-[10px] text-slate-500 dark:text-text-muted">Financial Workspace</span>
              </div>
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-text-muted dark:hover:text-white dark:hover:bg-white/5 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-text-muted/70 mb-1.5 font-mono">
                  {group.title}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors group relative",
                          isActive
                            ? "bg-indigo-50 text-indigo-600 dark:bg-accent-primary dark:text-white shadow-sm font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "w-4 h-4 transition-colors shrink-0",
                              isActive
                                ? "text-indigo-600 dark:text-white"
                                : "text-slate-400 dark:text-text-muted group-hover:text-slate-600 dark:group-hover:text-text-secondary"
                            )}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-500 dark:text-white/70 shrink-0" />
                        )}
                      </NavLink>
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Settings & User Profile */}
        <div className="p-3 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#070B14]/60 space-y-2 shrink-0">
          <div className="space-y-0.5">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                location.pathname === '/settings'
                  ? "bg-indigo-50 text-indigo-600 dark:bg-white/10 dark:text-white font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/[0.04]"
              )}
            >
              <Settings className="w-4 h-4 text-slate-400 dark:text-text-muted" />
              <span>Settings & Preferences</span>
            </NavLink>
          </div>

          {/* User Profile Area */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-bold ring-1 ring-slate-200 dark:ring-white/20 shadow-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-text-primary truncate">
                {user?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-text-muted truncate">
                {user?.email || 'Personal Account'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
