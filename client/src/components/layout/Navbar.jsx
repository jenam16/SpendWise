import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  User,
  Sliders,
  LogOut,
  X,
  Clock,
  Trash2,
  CreditCard,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { notificationService } from '../../services/notificationService'
import { cn, formatDate } from '../../utils/cn'

const PAGE_TITLES = {
  '/': { title: 'Dashboard', category: 'Overview' },
  '/dashboard': { title: 'Dashboard', category: 'Overview' },
  '/transactions': { title: 'Transactions', category: 'Overview' },
  '/budgets': { title: 'Budgets', category: 'Overview' },
  '/analytics': { title: 'Analytics', category: 'Overview' },
  '/goals': { title: 'Savings Goals', category: 'Overview' },
  '/subscriptions': { title: 'Subscriptions', category: 'Overview' },
  '/recurring-expenses': { title: 'Recurring Expenses', category: 'Management' },
  '/shared-expenses': { title: 'Shared Expenses', category: 'Management' },
  '/debts': { title: 'Debt Tracking', category: 'Management' },
  '/calendar': { title: 'Financial Calendar', category: 'Planning' },
  '/reports': { title: 'Reports & Export', category: 'Planning' },
  '/activity': { title: 'Activity Timeline', category: 'Utilities' },
  '/trash': { title: 'Trash & Recovery', category: 'Utilities' },
  '/categories': { title: 'Categories', category: 'Management' },
  '/payment-methods': { title: 'Payment Methods', category: 'Management' },
  '/settings': { title: 'Settings & Security', category: 'Preferences' },
}

export function Navbar({ onOpenSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, isDark, toggleTheme } = useTheme()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const currentRouteInfo = PAGE_TITLES[location.pathname] || {
    title: 'Workspace',
    category: 'SpendWise',
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SW'

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications, location.pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      fetchNotifications()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'budget_exceeded':
      case 'debt_overdue':
        return { icon: AlertTriangle, bg: 'bg-rose-500/15', color: 'text-rose-600 dark:text-rose-400' }
      case 'budget_warning':
      case 'debt_due':
      case 'goal_deadline':
        return { icon: AlertTriangle, bg: 'bg-amber-500/15', color: 'text-amber-600 dark:text-amber-400' }
      default:
        return { icon: Info, bg: 'bg-accent-primary/15', color: 'text-indigo-600 dark:text-accent-primary' }
    }
  }

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await handleMarkRead(n._id)
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#070B14]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left side: Hamburger (mobile) & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/5 focus:outline-none transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-text-muted">
            <span className="hover:text-slate-800 dark:hover:text-text-secondary transition-colors">{currentRouteInfo.category}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-text-primary font-medium">{currentRouteInfo.title}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">
            {currentRouteInfo.title}
          </h1>
        </div>
      </div>

      {/* Right side: Notifications, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell with Restrained Badge */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#070B14]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-50 overflow-hidden text-left animate-scaleUp">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0C1322]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono bg-accent-primary/15 text-indigo-600 dark:text-accent-primary px-1.5 py-0.2 rounded-full font-semibold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-slate-500 hover:text-indigo-600 dark:text-text-muted dark:hover:text-accent-primary transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-60" />
                    <p className="text-xs text-slate-600 dark:text-text-muted font-medium">All caught up!</p>
                    <p className="text-[11px] text-slate-400 dark:text-text-muted/60 mt-0.5">
                      No unread alerts or notifications.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconConfig = getNotificationIcon(n.type)
                    const IconComponent = iconConfig.icon

                    return (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "p-3.5 flex items-start gap-3 transition-colors cursor-pointer relative group",
                          n.isRead
                            ? "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                            : "bg-indigo-50/50 dark:bg-accent-primary/[0.03] hover:bg-indigo-50/80 dark:hover:bg-accent-primary/[0.06]"
                        )}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            iconConfig.bg
                          )}
                        >
                          <IconComponent className={cn("w-3.5 h-3.5", iconConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0 pr-5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                          <p className="text-xs text-slate-600 dark:text-text-secondary mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-text-muted mt-1 inline-block">
                            {formatDate(n.createdAt)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteNotification(n._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 dark:text-text-muted dark:hover:text-rose-400 absolute right-2.5 top-3.5 transition-opacity cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-bold ring-1 ring-slate-200 dark:ring-white/20 shadow-sm">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-text-muted hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-50 overflow-hidden py-1 animate-scaleUp">
              <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0C1322]">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'Workspace User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-text-muted truncate font-mono mt-0.5">{user?.email || ''}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/5 cursor-pointer flex items-center gap-2.5 text-left transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400 dark:text-text-muted" />
                  <span>Profile & Workspace</span>
                </button>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false)
                    navigate('/activity')
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/5 cursor-pointer flex items-center gap-2.5 text-left transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-text-muted" />
                  <span>Activity Audit Log</span>
                </button>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false)
                    navigate('/trash')
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/5 cursor-pointer flex items-center gap-2.5 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400 dark:text-text-muted" />
                  <span>Trash & Recovery</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  onClick={async () => {
                    setProfileMenuOpen(false)
                    await logout()
                    navigate('/login')
                  }}
                  className="w-full px-4 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
