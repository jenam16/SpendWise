import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  CalendarClock,
  Scale,
  Target,
  X,
  Clock,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { transactionService } from '../services/transactionService'
import { subscriptionService } from '../services/subscriptionService'
import { recurringExpenseService } from '../services/recurringExpenseService'
import { debtService } from '../services/debtService'
import { goalService } from '../services/goalService'
import { formatCurrency, cn } from '../utils/cn'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // Real entity states
  const [transactions, setTransactions] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [recurringExpenses, setRecurringExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [goals, setGoals] = useState([])

  // Selected Day Modal
  const [selectedDayEvents, setSelectedDayEvents] = useState(null)
  const [selectedDateLabel, setSelectedDateLabel] = useState('')

  // Filter types
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'transactions' | 'subscriptions' | 'debts' | 'goals'

  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    try {
      const [txRes, subRes, recRes, debtRes, goalRes] = await Promise.allSettled([
        transactionService.getTransactions({ limit: 200 }),
        subscriptionService.getSubscriptions(),
        recurringExpenseService.getRecurringExpenses(),
        debtService.getDebts(),
        goalService.getGoals(),
      ])

      if (txRes.status === 'fulfilled') setTransactions(txRes.value?.transactions || [])
      if (subRes.status === 'fulfilled') setSubscriptions(subRes.value || [])
      if (recRes.status === 'fulfilled') setRecurringExpenses(recRes.value || [])
      if (debtRes.status === 'fulfilled') setDebts(debtRes.value?.debts || [])
      if (goalRes.status === 'fulfilled') setGoals(goalRes.value?.goals || [])
    } catch (err) {
      console.error('Failed to load financial calendar feeds:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Calendar Month grid calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Map events to day keys (e.g. "2026-09-15")
  const eventsByDay = useMemo(() => {
    const map = {}

    const addEvent = (dateStr, event) => {
      if (!dateStr) return
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!map[key]) map[key] = []
      map[key].push(event)
    }

    // 1. Transactions
    transactions.forEach((tx) => {
      addEvent(tx.date, {
        id: `tx-${tx._id}`,
        type: 'transaction',
        subtype: tx.type, // 'income' | 'expense'
        title: tx.title,
        amount: tx.amount,
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        color: tx.type === 'income' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      })
    })

    // 2. Subscriptions
    subscriptions.forEach((sub) => {
      if (sub.nextBillingDate) {
        addEvent(sub.nextBillingDate, {
          id: `sub-${sub._id}`,
          type: 'subscription',
          title: `${sub.name} renewal`,
          amount: sub.amount,
          category: sub.category,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        })
      }
    })

    // 3. Recurring Expenses
    recurringExpenses.forEach((rec) => {
      if (rec.nextOccurrence) {
        addEvent(rec.nextOccurrence, {
          id: `rec-${rec._id}`,
          type: 'recurring',
          title: `${rec.title} due`,
          amount: rec.amount,
          category: rec.category,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        })
      }
    })

    // 4. Debts
    debts.forEach((debt) => {
      if (debt.dueDate) {
        addEvent(debt.dueDate, {
          id: `debt-${debt._id}`,
          type: 'debt',
          subtype: debt.direction, // 'owe' | 'owed_to_me'
          title: debt.direction === 'owe' ? `Owe ${debt.personName}` : `${debt.personName} owes you`,
          amount: debt.remainingAmount || debt.amount,
          color: debt.direction === 'owe' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        })
      }
    })

    // 5. Goals
    goals.forEach((goal) => {
      if (goal.deadline) {
        addEvent(goal.deadline, {
          id: `goal-${goal._id}`,
          type: 'goal',
          title: `Goal Deadline: ${goal.name}`,
          amount: goal.targetAmount,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        })
      }
    })

    return map
  }, [transactions, subscriptions, recurringExpenses, debts, goals])

  const handleDayClick = (dayNum) => {
    const dayDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const events = eventsByDay[dayDateKey] || []
    setSelectedDayEvents(events)
    setSelectedDateLabel(
      new Date(year, month, dayNum).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    )
  }

  // Monthly summary stats
  const currentMonthEvents = useMemo(() => {
    let totalIn = 0
    let totalOut = 0
    let upcomingBills = 0

    Object.entries(eventsByDay).forEach(([key, items]) => {
      const [kYear, kMonth] = key.split('-').map(Number)
      if (kYear === year && kMonth === month + 1) {
        items.forEach((item) => {
          if (item.type === 'transaction') {
            if (item.subtype === 'income') totalIn += item.amount
            else totalOut += item.amount
          } else if (item.type === 'subscription' || item.type === 'recurring') {
            upcomingBills += item.amount
          }
        })
      }
    })

    return { totalIn, totalOut, upcomingBills }
  }, [eventsByDay, year, month])

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Financial Calendar"
        subtitle="Chronological map of cash inflows, expense postings, renewals, and debt deadlines."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center bg-[#10182C] border border-white/10 rounded-lg p-0.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-semibold text-white min-w-[130px] text-center">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchCalendarData}
              loading={loading}
              title="Refresh calendar data"
            />
          </div>
        }
      />

      {/* Monthly Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#10182C] border-white/10">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            {currentDate.toLocaleString('default', { month: 'short' })} Inflow
          </span>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">
            {formatCurrency(currentMonthEvents.totalIn)}
          </p>
        </Card>
        <Card className="p-4 bg-[#10182C] border-white/10">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            {currentDate.toLocaleString('default', { month: 'short' })} Outflow
          </span>
          <p className="text-xl font-bold text-rose-400 mt-0.5">
            {formatCurrency(currentMonthEvents.totalOut)}
          </p>
        </Card>
        <Card className="p-4 bg-[#10182C] border-white/10">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Scheduled Bills & Renewals
          </span>
          <p className="text-xl font-bold text-cyan-400 mt-0.5">
            {formatCurrency(currentMonthEvents.upcomingBills)}
          </p>
        </Card>
      </div>

      {/* Calendar Grid Container */}
      <Card className="p-0 overflow-hidden bg-[#0C1322] border-white/10">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-white/[0.08] bg-[#090F1C] text-center">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-2.5 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Month Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.04]">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-[#070B14]/40 p-2 opacity-30" />
          ))}

          {/* Actual days in month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1
            const dayDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const isToday = dayDateKey === todayStr
            const allDayEvents = eventsByDay[dayDateKey] || []

            const filteredEvents = allDayEvents.filter((ev) => {
              if (activeFilter === 'all') return true
              if (activeFilter === 'transactions') return ev.type === 'transaction'
              if (activeFilter === 'subscriptions') return ev.type === 'subscription' || ev.type === 'recurring'
              if (activeFilter === 'debts') return ev.type === 'debt'
              if (activeFilter === 'goals') return ev.type === 'goal'
              return true
            })

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                className={cn(
                  "h-24 sm:h-28 p-1.5 sm:p-2 hover:bg-white/[0.03] transition-colors cursor-pointer flex flex-col justify-between group",
                  isToday && "bg-accent-primary/[0.06] border border-accent-primary/30"
                )}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-mono font-semibold px-1.5 py-0.5 rounded",
                      isToday
                        ? "bg-accent-primary text-white"
                        : "text-text-muted group-hover:text-white"
                    )}
                  >
                    {dayNum}
                  </span>
                  {filteredEvents.length > 0 && (
                    <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
                      {filteredEvents.length} event{filteredEvents.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Event Pills (Compact) */}
                <div className="space-y-1 overflow-hidden my-1">
                  {filteredEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded border truncate flex items-center justify-between font-medium",
                        ev.color
                      )}
                    >
                      <span className="truncate">{ev.title}</span>
                      <span className="shrink-0 ml-1 font-mono font-semibold hidden sm:inline">
                        ₹{Math.round(ev.amount)}
                      </span>
                    </div>
                  ))}
                  {filteredEvents.length > 2 && (
                    <span className="text-[10px] text-text-muted font-mono px-1 block">
                      +{filteredEvents.length - 2} more...
                    </span>
                  )}
                </div>

                <div className="h-1" />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Day Events Details Modal */}
      <Modal
        isOpen={Boolean(selectedDayEvents)}
        onClose={() => setSelectedDayEvents(null)}
        title={selectedDateLabel || "Daily Financial Events"}
        subtitle="Events logged or scheduled for this date"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {selectedDayEvents && selectedDayEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted">
              No financial transactions or due dates logged for this day.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05] max-h-80 overflow-y-auto custom-scrollbar">
              {selectedDayEvents?.map((ev) => (
                <div key={ev.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn("p-1.5 rounded-lg border shrink-0", ev.color)}>
                      {ev.type === 'transaction' ? (
                        ev.subtype === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : ev.type === 'subscription' ? (
                        <Repeat className="w-3.5 h-3.5" />
                      ) : ev.type === 'debt' ? (
                        <Scale className="w-3.5 h-3.5" />
                      ) : (
                        <Target className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{ev.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                        <span className="capitalize">{ev.type}</span>
                        {ev.category && <span>• {ev.category}</span>}
                        {ev.paymentMethod && <span>• {ev.paymentMethod}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white font-mono block">
                      {formatCurrency(ev.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-white/[0.06]">
            <Button variant="secondary" size="sm" onClick={() => setSelectedDayEvents(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
