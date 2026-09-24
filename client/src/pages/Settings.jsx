import React, { useState, useEffect } from 'react'
import {
  User,
  Palette,
  Bell,
  Shield,
  Check,
  Lock,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/authService'
import { notificationService } from '../services/notificationService'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Password', icon: Shield },
]

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { theme, setTheme, isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile Form state
  const [name, setName] = useState(user?.name || '')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  // Status feedback
  const [notice, setNotice] = useState({ type: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    budgetAlerts: true,
    subscriptionReminders: true,
    recurringReminders: true,
    goalReminders: true,
    debtReminders: true,
  })

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  // Fetch real notification preferences from backend
  useEffect(() => {
    let mounted = true
    const fetchSettings = async () => {
      try {
        const res = await notificationService.getPreferences()
        if (mounted && res?.preferences) {
          setNotifPrefs(res.preferences)
        }
      } catch (err) {
        // Fallback gracefully to default preferences
      }
    }
    fetchSettings()
    return () => {
      mounted = false
    }
  }, [])

  const showNotification = (type, message) => {
    setNotice({ type, message })
    setTimeout(() => setNotice({ type: '', message: '' }), 4000)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      showNotification('error', 'Full name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const res = await authService.updateProfile({ name: name.trim() })
      if (res?.user) {
        updateUser(res.user)
      }
      showNotification('success', 'Profile information updated successfully')
    } catch (err) {
      showNotification('error', err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword) {
      showNotification('error', 'Current password is required')
      return
    }
    if (newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmNewPassword) {
      showNotification('error', 'New passwords do not match')
      return
    }

    setIsSaving(true)
    try {
      await authService.updateProfile({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      showNotification('success', 'Password updated successfully')
    } catch (err) {
      showNotification('error', err.message || 'Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePref = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    try {
      await notificationService.updatePreferences(updated)
    } catch (err) {
      console.error('Failed to persist notification preference:', err)
      setNotifPrefs(notifPrefs)
    }
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SW'

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage your profile identity, appearance, and notification alerts."
      />

      {/* Notice Banner */}
      {notice.message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {notice.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="text-sm font-medium">{notice.message}</span>
        </div>
      )}

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-2 space-y-1 shadow-sm dark:shadow-none">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setNotice({ type: '', message: '' })
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-text-secondary dark:hover:text-white dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-text-muted'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          <Card className="bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/[0.08] shadow-sm dark:shadow-none">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <CardHeader className="border-b border-slate-100 dark:border-white/[0.06]">
                  <CardTitle subtitle="Update your workspace profile identity">
                    Personal Information
                  </CardTitle>
                </CardHeader>

                <div className="flex items-center gap-4 pb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold ring-2 ring-indigo-500/20 shadow-md">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">Authenticated Account</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-text-secondary mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-slate-50 dark:bg-[#0C1322]/50 border border-slate-200 dark:border-white/5 rounded-lg px-3.5 py-2 text-sm text-slate-500 dark:text-text-muted cursor-not-allowed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Email address is permanently bound to this user identity.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                  <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <CardHeader className="border-b border-slate-100 dark:border-white/[0.06]">
                  <CardTitle subtitle="Select your preferred application color theme. Changes sync across devices.">
                    Interface Appearance
                  </CardTitle>
                </CardHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dark Theme Option */}
                  <div
                    onClick={() => setTheme('dark')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isDark
                        ? 'border-accent-primary bg-indigo-500/[0.06] shadow-glow-subtle'
                        : 'border-slate-200 dark:border-border-subtle bg-slate-50/50 dark:bg-bg-surface hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {isDark && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="w-full h-24 bg-[#070B14] rounded-xl mb-4 p-3 flex flex-col justify-between border border-white/10 overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="w-12 h-2 rounded bg-white/20" />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="h-7 rounded bg-[#10182C] border border-white/5" />
                        <div className="h-7 rounded bg-[#10182C] border border-white/5" />
                        <div className="h-7 rounded bg-[#10182C] border border-white/5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">SpendWise Dark</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-text-muted mt-1 leading-relaxed">
                      Deep slate aesthetic engineered for low light and focused financial management.
                    </p>
                  </div>

                  {/* Light Theme Option */}
                  <div
                    onClick={() => setTheme('light')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      !isDark
                        ? 'border-accent-primary bg-indigo-500/[0.06] shadow-sm'
                        : 'border-slate-200 dark:border-border-subtle bg-slate-50/50 dark:bg-bg-surface hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {!isDark && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="w-full h-24 bg-[#F6F7FB] rounded-xl mb-4 p-3 flex flex-col justify-between border border-slate-200 overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="w-12 h-2 rounded bg-slate-300" />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="h-7 rounded bg-white border border-slate-200" />
                        <div className="h-7 rounded bg-white border border-slate-200" />
                        <div className="h-7 rounded bg-white border border-slate-200" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">SpendWise Light</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-text-muted mt-1 leading-relaxed">
                      Crisp daylight theme with refined slate borders and high-readability surfaces.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <CardHeader className="border-b border-slate-100 dark:border-white/[0.06]">
                  <CardTitle subtitle="Choose what financial events trigger alerts and reminders">
                    Notification Preferences
                  </CardTitle>
                </CardHeader>

                <div className="space-y-4 divide-y divide-slate-100 dark:divide-white/[0.05]">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Budget Alerts</p>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Alerts when monthly budget utilization reaches 80% or exceeds 100%.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(notifPrefs.budgetAlerts)}
                      onChange={() => handleTogglePref('budgetAlerts')}
                      className="accent-accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Subscription Auto-Renewal Reminders
                      </p>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Reminders 3 days before a recurring subscription renews.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(notifPrefs.subscriptionReminders)}
                      onChange={() => handleTogglePref('subscriptionReminders')}
                      className="accent-accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Recurring Expense Bill Due Alerts
                      </p>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Reminders 3 days prior to recurring bill or utility due dates.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(notifPrefs.recurringReminders)}
                      onChange={() => handleTogglePref('recurringReminders')}
                      className="accent-accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Savings Goal Approaching Deadlines
                      </p>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Milestone alerts when a goal target deadline is within 7 days.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(notifPrefs.goalReminders)}
                      onChange={() => handleTogglePref('goalReminders')}
                      className="accent-accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Debt Due & Overdue Notices</p>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Alerts when personal loans or money owed to you is due or past due.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(notifPrefs.debtReminders)}
                      onChange={() => handleTogglePref('debtReminders')}
                      className="accent-accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <CardHeader className="border-b border-slate-100 dark:border-white/[0.06]">
                  <CardTitle subtitle="Update your account credentials">
                    Security & Password
                  </CardTitle>
                </CardHeader>

                <div className="space-y-4 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                      {isSaving ? 'Updating...' : 'Change Password'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
